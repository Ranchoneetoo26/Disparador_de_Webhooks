'use strict';

import { v4 as uuidv4 } from 'uuid';
// CORREÇÃO: O caminho agora é '../../' para subir dois níveis
import UnprocessableEntityException from '../../domain/exceptions/UnprocessableEntityException.js';

// 1. MAPEAMENTO DE SITUAÇÃO (Regra 3.1.O)
// Tabela do PDF para validar o status do serviço
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
    // Repositório 'Servico' é necessário para a validação de situação
    servicoRepository,
    webhookRepository,
    webhookReprocessadoRepository,
    httpClient,
    redisClient,
  } = {}) {
    // Adicione a validação do novo repositório
    if (!servicoRepository) throw new Error('servicoRepository missing');
    if (!webhookRepository) throw new Error('webhookRepository missing');
    if (!webhookReprocessadoRepository) throw new Error('webhookReprocessadoRepository missing');
    if (!httpClient) throw new Error('httpClient missing');
    if (!redisClient) throw new Error('redisClient missing');

    this.servicoRepository = servicoRepository; // Adicionado
    this.webhookRepository = webhookRepository;
    this.reprocessadoRepository = webhookReprocessadoRepository;
    this.httpClient = httpClient;
    this.redisClient = redisClient;
  }

  async execute(input) {
    const { product, id: ids, kind, type } = input;
    const { cedente } = input; // O AuthMiddleware deve injetar isso

    // 2. CACHE DE REQUISIÇÃO (Regra 3.1.N)
    // Impede reenvios duplicados
    const cacheKey = `reenvio:${cedente.id}:${JSON.stringify(input)}`;
    const cachedRequest = await this.redisClient.get(cacheKey);

    if (cachedRequest) {
      const err = new Error('Requisição duplicada. Aguarde 1 hora para reenviar os mesmos dados.');
      err.status = 429; // Too Many Requests
      throw err;
    }
    // Salva no cache por 1 hora (3600 segundos)
    await this.redisClient.set(cacheKey, 'processing', { ttl: 3600 });


    // 3. VALIDAÇÃO DE SITUAÇÃO (Regra 3.1.O)
    // Busca os *Serviços* (boletos, pix, etc.) e não os webhooks
    const servicos = await this.servicoRepository.findByIdsAndCedente(ids, cedente.id);

    const servicosEncontradosMap = new Map(servicos.map((s) => [s.id.toString(), s]));
    const idsNaoEncontrados = ids.filter((id) => !servicosEncontradosMap.has(id.toString()));

    // Valida se todos os IDs solicitados foram encontrados para este cedente
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

    // Valida se os serviços encontrados estão na situação correta
    const idsSituacaoErrada = servicos
      .filter(servico => servico.status !== situacaoEsperada)
      .map(servico => servico.id);

    if (idsSituacaoErrada.length > 0) {
      throw new UnprocessableEntityException(
        `Não foi possível gerar a notificação. A situação do ${product} diverge do tipo de notificação solicitado (esperado: ${situacaoEsperada}).`,
        idsSituacaoErrada
      );
    }

    // Busca os dados de webhook (URL, payload) para os serviços válidos
    // (Assumindo que o ID do Webhook é o mesmo ID do Serviço)
    const webhooks = await this.webhookRepository.findByIds(ids);
    const webhooksMap = new Map(webhooks.map((wh) => [wh.id.toString(), wh]));

    const protocoloLote = uuidv4();

    // Inicia o reenvio
    const reenviosPromises = servicos.map((servico) => {
      const webhookData = webhooksMap.get(servico.id.toString());
      if (!webhookData || !webhookData.url) {
        console.warn(`[Reenvio] Webhook data (URL) não encontrado para Servico ID: ${servico.id}`);
        return Promise.reject(new Error(`Webhook data not found for ${servico.id}`));
      }
      console.log(`[Reenvio] Processando ID: ${servico.id}, URL: ${webhookData.url}`);
      return this.processarReenvio(webhookData);
    });

    const resultados = await Promise.allSettled(reenviosPromises);

    // 4. FALHA NO PROCESSAMENTO (Regra 3.1.P)
    // Só salva o protocolo se pelo menos 1 webhook foi enviado com sucesso
    const sucessos = resultados.filter(r => r.status === 'fulfilled');
    if (sucessos.length === 0) {
      const err = new Error('Não foi possível gerar a notificação. Tente novamente mais tarde.');
      err.status = 400;
      // Remove a chave do cache para permitir nova tentativa
      await this.redisClient.del(cacheKey);
      throw err;
    }

    // 5. ARMAZENAMENTO PÓS-SUCESSO (Regra 3.1.R)
    const registroProtocolo = {
      id: uuidv4(),
      protocolo: protocoloLote,
      data: { // Dados originais da requisição
        product,
        ids_solicitados: ids,
        kind,
        type,
      },
      data_criacao: new Date(),
      cedente_id: cedente.id,
      kind: kind,
      type: type,
      servico_id: ids, // Salva como JSONB (migration já foi ajustada)
      status: 'sent', // Define o status como 'sent'
    };

    await this.reprocessadoRepository.create(registroProtocolo);

    return { protocolo: protocoloLote };
  }

  async processarReenvio(webhook) {
    let response;
    try {
      // 6. LÓGICA DE NOTIFICAÇÃO (Regra 3.4 e 3.5)
      // Aqui você implementaria a busca da config (Conta vs Cedente)
      // E a adição dos headers (cnpj-sh, token-sh, etc.)
      // const headers = this.notificationConfigService.getHeaders(cedente, conta);
      // const config = this.notificationConfigService.getConfig(cedente, conta);

      response = await this.httpClient.post(
        webhook.url,
        webhook.payload,
        {
          timeout: 5000,
          // headers: headers // Adicionaria os headers aqui
        }
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