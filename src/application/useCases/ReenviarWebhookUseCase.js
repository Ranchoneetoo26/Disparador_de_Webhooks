'use strict';

import { v4 as uuidv4 } from 'uuid';
import UnprocessableEntityException from '../../domain/exceptions/UnprocessableEntityException.js';

// 1. MAPEAMENTO DE SITUAÇÃO (Regra 3.1.O)
// Tabela do PDF para validar o status
const MAPA_SITUACAO = {
  boleto: {
    disponivel: 'REGISTRADO',
    cancelado: 'BAIXADO',
    pago: 'LIQUIDADO',
  },
  pagamento: {
    disponivel: 'SCHEDULED_ACTIVE',
    cancelado: 'CANCELLED',
    pago: 'PAID',
  },
  pix: {
    disponivel: 'ACTIVE',
    cancelado: 'REJECTED',
    pago: 'LIQUIDATED',
  },
};

export default class ReenviarWebhookUseCase {
  constructor({
    // servicoRepository foi REMOVIDO para corrigir o crash
    webhookRepository,
    webhookReprocessadoRepository,
    httpClient,
    redisClient,
  } = {}) {
    if (!webhookRepository) throw new Error('webhookRepository missing');
    if (!webhookReprocessadoRepository) throw new Error('webhookReprocessadoRepository missing');
    if (!httpClient) throw new Error('httpClient missing');
    if (!redisClient) throw new Error('redisClient missing');

    this.webhookRepository = webhookRepository;
    this.reprocessadoRepository = webhookReprocessadoRepository;
    this.httpClient = httpClient;
    this.redisClient = redisClient;
  }

  async execute(input) {
    const { product, id: ids, kind, type } = input;
    const { cedente } = input;

    // 2. CACHE DE REQUISIÇÃO (Regra 3.1.N)
    const cacheKey = `reenvio:${cedente.id}:${JSON.stringify(input)}`;
    const cachedRequest = await this.redisClient.get(cacheKey);

    if (cachedRequest) {
      const err = new Error('Requisição duplicada. Aguarde 1 hora para reenviar os mesmos dados.');
      err.status = 429;
      throw err;
    }
    await this.redisClient.set(cacheKey, 'processing', { ttl: 3600 });

    // 3. VALIDAÇÃO DE SITUAÇÃO (Regra 3.1.O) - Lógica Corrigida
    // Busca os *Webhooks* (que têm ID string)
    const webhooks = await this.webhookRepository.findByIdsAndCedente(ids, cedente.id);

    const webhooksEncontradosMap = new Map(webhooks.map((wh) => [wh.id.toString(), wh]));
    const idsNaoEncontrados = ids.filter((id) => !webhooksEncontradosMap.has(id.toString()));

    if (idsNaoEncontrados.length > 0) {
      throw new UnprocessableEntityException(
        'Não foi possível gerar a notificação. Os seguintes IDs não foram encontrados ou não pertencem ao cedente.',
        idsNaoEncontrados
      );
    }

    const situacaoEsperada = MAPA_SITUACAO[product]?.[type];
    if (!situacaoEsperada) {
      const err = new Error(`Mapeamento de situação inválido para product '${product}' e type '${type}'.`);
      err.status = 400;
      throw err;
    }

    // Valida o status DENTRO DO PAYLOAD do webhook
    const idsSituacaoErrada = webhooks
      .filter(wh => {
        // Assume que o status está em 'webhook.payload.status'
        // NOTA: O seeder tem 'pago', mas a regra pede 'LIQUIDADO'.
        // Isso significa que o seeder está "errado" ou a regra do PDF está
        // simplificada. Vamos assumir que o 'status' no payload deve
        // corresponder ao 'MAPA_SITUACAO'.
        const statusReal = wh.payload?.status;
        return statusReal !== situacaoEsperada;
      })
      .map(wh => wh.id);

    if (idsSituacaoErrada.length > 0) {
      // O seeder tem "pago" e o teste é "disponivel" (espera "REGISTRADO")
      // "pago" != "REGISTRADO", então o erro 422 vai disparar.
      throw new UnprocessableEntityException(
        `Não foi possível gerar a notificação. A situação do ${product} diverge do tipo de notificação solicitado (esperado: ${situacaoEsperada}).`,
        idsSituacaoErrada
      );
    }

    const protocoloLote = uuidv4();

    // Inicia o reenvio
    const reenviosPromises = webhooks.map((webhook) => {
      console.log(`[Reenvio] Processando ID: ${webhook.id}, URL: ${webhook.url}`);
      return this.processarReenvio(webhook);
    });

    const resultados = await Promise.allSettled(reenviosPromises);

    // 4. FALHA NO PROCESSAMENTO (Regra 3.1.P)
    const sucessos = resultados.filter(r => r.status === 'fulfilled');
    if (sucessos.length === 0) {
      const err = new Error('Não foi possível gerar a notificação. Tente novamente mais tarde.');
      err.status = 400;
      await this.redisClient.del(cacheKey);
      throw err;
    }

    // 5. ARMAZENAMENTO PÓS-SUCESSO (Regra 3.1.R)
    const registroProtocolo = {
      id: uuidv4(),
      protocolo: protocoloLote,
      data: { product, ids_solicitados: ids, kind, type },
      data_criacao: new Date(),
      cedente_id: cedente.id,
      kind: kind,
      type: type,
      servico_id: ids,
      status: 'sent',
    };

    await this.reprocessadoRepository.create(registroProtocolo);
    return { protocolo: protocoloLote };
  }

  async processarReenvio(webhook) {
    let response;
    try {
      response = await this.httpClient.post(
        webhook.url,
        webhook.payload,
        { timeout: 5000 }
      );
      const isSuccess = response && response.status >= 200 && response.status < 300;

      if (isSuccess) {
        await this.webhookRepository.update(webhook.id, {
          tentativas: (webhook.tentativas || 0) + 1,
          last_status: response.status,
        });
        return { id: webhook.id, status: 'fulfilled', httpStatus: response.status };
      } else {
        throw new Error(`HTTP Status ${response.status}`);
      }
    } catch (err) {
      console.error(`[ProcessarReenvio] Falha ao enviar ID ${webhook.id}: ${err.message}`);
      await this.webhookRepository.update(webhook.id, {
        tentativas: (webhook.tentativas || 0) + 1,
        last_status: response?.status || null,
      });
      throw new Error(`Falha no reenvio para ${webhook.id}: ${err.message}`);
    }
  }
}