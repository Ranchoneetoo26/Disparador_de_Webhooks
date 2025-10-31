// src/application/useCases/ReenviarWebhookUseCase.js
'use strict';

import { v4 as uuidv4 } from 'uuid';
import ReenviarWebhookInput from '../dtos/ReenviarWebhookInput.js';

export default class ReenviarWebhookUseCase {
  constructor({
    webhookRepository,
    webhookReprocessadoRepository,
    httpClient,
    redisClient,
  } = {}) {
    if (!webhookRepository) throw new Error('webhookRepository missing');
    if (!webhookReprocessadoRepository) throw new Error('webhookReprocessadoRepository missing');
    if (!httpClient) throw new Error('httpClient missing');

    this.webhookRepository = webhookRepository;
    this.reprocessadoRepository = webhookReprocessadoRepository;
    this.httpClient = httpClient;
    this.redisClient = redisClient;
  }

  async execute(input) {
    const { product, id: ids, kind, type } = input;
    const protocoloLote = uuidv4();

    // 1. Buscar os webhooks
    const webhooks = await this.webhookRepository.findByIds(ids);

    const webhooksEncontradosMap = new Map(webhooks.map((wh) => [wh.id.toString(), wh]));
    const idsEncontradosSet = new Set(webhooks.map((wh) => wh.id.toString()));
    const idsInvalidos = ids.filter((id) => !idsEncontradosSet.has(id.toString()));

    if (webhooks.length === 0) {
      const error = new Error('Nenhum webhook encontrado para os IDs fornecidos.');
      error.status = 422;
      error.ids_invalidos = idsInvalidos;
      throw error;
    }

    // 2. Processar os reenvios
    const reenviosPromises = webhooks.map((webhook) => {
      console.log(`[Reenvio] Processando ID: ${webhook.id}, URL: ${webhook.url}`);
      return this.processarReenvio(webhook);
    });

    const resultados = await Promise.allSettled(reenviosPromises);

    // 3. Salvar o registro do protocolo
    
    // --- CORREÇÃO AQUI ---
    // Convertemos o Set 'idsEncontradosSet' para um Array
    // para que o Sequelize possa salvá-lo na coluna JSONB.
    const idsEncontradosArray = Array.from(idsEncontradosSet);
    // --- FIM DA CORREÇÃO ---

    const registroProtocolo = {
      id: uuidv4(),
      protocolo: protocoloLote,
      data: {
        product,
        ids_solicitados: ids,
        kind,
        type,
        ids_invalidos: idsInvalidos,
      },
      data_criacao: new Date(),
      cedente_id: webhooks[0].cedente_id || null,
      kind: kind,
      type: type,
      servico_id: idsEncontradosArray, // <-- Usamos o Array corrigido
      status: 'completed', 
    };

    // Esta chamada agora vai funcionar
    await this.reprocessadoRepository.create(registroProtocolo);

    // 4. Retornar o protocolo do lote
    return { protocolo: protocoloLote };
  }

  // (O método processarReenvio() continua o mesmo)
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
      await this.webhookRepository.update(webhook.id, {
        tentativas: (webhook.tentativas || 0) + 1,
        last_status: response?.status || null,
      });
      return { id: webhook.id, status: 'rejected', reason: err.message };
    }
  }
}