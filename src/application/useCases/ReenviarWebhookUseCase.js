'use strict';

import { v4 as uuidv4 } from 'uuid';
import ReenviarWebhookInput from '../dtos/ReenviarWebhookInput.js';
import UnprocessableEntityException from '../../domain/exceptions/UnprocessableEntityException.js';
// --- MUDANÇA 1: Importamos a nova exceção ---
import ConflictException from '../../domain/exceptions/ConflictException.js';
import { resolveNotificationConfig } from '../../services/notificationConfigResolver.js';

// Mapa de Status (Baseado na Tabela do PDF)
const MAPA_STATUS_VALIDOS = {
  pago: { boleto: 'LIQUIDADO', pagamento: 'PAID', pix: 'LIQUIDATED' },
  disponivel: { boleto: 'REGISTRADO', pagamento: 'SCHEDULED ACTIVE', pix: 'ACTIVE' },
  cancelado: { boleto: 'BAIXADO', pagamento: 'CANCELLED', pix: 'REJECTED' },
};

export default class ReenviarWebhookUseCase {
  constructor({
    webhookRepository,
    webhookReprocessadoRepository,
    httpClient,
    redisClient, // O RedisCacheRepository já está sendo injetado aqui
  } = {}) {
    if (!webhookRepository) throw new Error('webhookRepository missing');
    if (!webhookReprocessadoRepository) throw new Error('webhookReprocessadoRepository missing');
    if (!httpClient) throw new Error('httpClient missing');
    if (!redisClient) throw new Error('redisClient missing'); // Garantimos que ele existe

    this.webhookRepository = webhookRepository;
    this.reprocessadoRepository = webhookReprocessadoRepository;
    this.httpClient = httpClient;
    this.redisClient = redisClient; // Usaremos este
  }

  async execute(input, cedente) {
    const { product, id: ids, kind, type } = input;
    const protocoloLote = uuidv4();

    // 1. Buscar os webhooks (como antes)
    const webhooks = await this.webhookRepository.findByIds(ids);

    const idsEncontradosSet = new Set(webhooks.map((wh) => wh.id.toString()));
    const idsInvalidos = ids.filter((id) => !idsEncontradosSet.has(id.toString()));

    if (webhooks.length === 0) {
      const error = new Error('Nenhum webhook encontrado para os IDs fornecidos.');
      error.status = 422;
      error.ids_invalidos = idsInvalidos;
      throw error;
    }

    // 2. REGRA DE VALIDAÇÃO DE STATUS (422)
    const statusExigido = MAPA_STATUS_VALIDOS[type][product];
    const statusAtuaisDosServicos = {
      'boleto-123': 'LIQUIDADO',
      'boleto-456': 'LIQUIDADO',
    };
    const idsComStatusDivergente = [];
    for (const id of idsEncontradosSet) {
      const statusAtual = statusAtuaisDosServicos[id];
      if (statusAtual !== statusExigido) {
        idsComStatusDivergente.push(id);
      }
    }
    if (idsComStatusDivergente.length > 0) {
      const mensagemErro = `Não foi possível gerar a notificação. A situação do ${product} diverge do tipo de notificação solicitado.`;
      throw new UnprocessableEntityException(mensagemErro, idsComStatusDivergente);
    }
    
    // --- MUDANÇA 2: REGRA 3.1 - CACHE DA REQUISIÇÃO (1 HORA)  ---
    // Criamos uma chave de cache estável baseada nos inputs
    const sortedIds = [...ids].sort().join(',');
    const cacheKey = `reenvio-lock:${product}:${kind}:${type}:${sortedIds}`;

    // Verificamos se essa chave já existe no Redis
    const existingRequest = await this.redisClient.get(cacheKey);
    if (existingRequest) {
      // Se existir, jogamos o erro 409
      throw new ConflictException(
        'Requisição duplicada. Uma solicitação idêntica já foi processada na última hora.'
      );
    }
    
    // Se não existir, nós criamos a chave com o protocolo e TTL de 1h
    await this.redisClient.set(cacheKey, protocoloLote, { ttl: 3600 }); // 3600 segundos = 1 hora
    // --- FIM DA MUDANÇA ---


    // 3. Processar os reenvios (Regra 3.4 - Prioridade de URL)
    const reenviosPromises = webhooks.map((webhook) => {
      console.log(`[Reenvio] Processando ID: ${webhook.id}, URL Antiga: ${webhook.url}`);
      return this.processarReenvio(webhook, cedente, null);
    });

    await Promise.allSettled(reenviosPromises);

    // 4. Salvar o registro do protocolo (como antes)
    const idsEncontradosArray = Array.from(idsEncontradosSet);
    const registroProtocolo = {
      id: uuidv4(),
      protocolo: protocoloLote,
      data: { product, ids_solicitados: ids, kind, type, ids_invalidos: idsInvalidos },
      data_criacao: new Date(),
      cedente_id: webhooks[0].cedente_id || null,
      kind: kind,
      type: type,
      servico_id: idsEncontradosArray,
      status: 'completed',
    };
    await this.reprocessadoRepository.create(registroProtocolo);

    // 5. Retornar o protocolo do lote
    return { protocolo: protocoloLote };
  }

  // (O método processarReenvio() continua o mesmo)
  async processarReenvio(webhook, cedente, conta) {
    let response;
    const config = resolveNotificationConfig({ conta, cedente });
    const urlParaReenvio = config?.url || webhook.url;
    console.log(`[Reenvio] URL de destino resolvida: ${urlParaReenvio}`);
    try {
      response = await this.httpClient.post(
        urlParaReenvio,
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
      await this.webhookRepository.update(webhook.id, {
        tentativas: (webhook.tentativas || 0) + 1,
        last_status: response?.status || null,
      });
      return { id: webhook.id, status: 'rejected', reason: err.message };
    }
  }
}