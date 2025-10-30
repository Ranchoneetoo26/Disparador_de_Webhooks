// src/application/useCases/ReenviarWebhookUseCase.js
'use strict';

import { v4 as uuidv4 } from 'uuid';
import ReenviarWebhookInput from '../dtos/ReenviarWebhookInput.js';

export default class ReenviarWebhookUseCase {
  constructor({
    webhookRepository,
    webhookReprocessadoRepository,
    httpClient,
    redisClient, // Embora injetado, não estamos usando (poderia ser usado para invalidar cache)
  } = {}) {
    if (!webhookRepository) throw new Error('webhookRepository missing');
    if (!webhookReprocessadoRepository) throw new Error('webhookReprocessadoRepository missing');
    if (!httpClient) throw new Error('httpClient missing');

    this.webhookRepository = webhookRepository;
    this.reprocessadoRepository = webhookReprocessadoRepository;
    this.httpClient = httpClient;
    this.redisClient = redisClient;
  }

  /**
   * Executa o caso de uso de reenvio de webhooks.
   * @param {ReenviarWebhookInput} input - O DTO de entrada validado.
   * @returns {Promise<{protocolo: string}>}
   */
  async execute(input) {
    const { product, id: ids, kind, type } = input;

    // 1. Gerar um protocolo único para este LOTE de reenvio.
    const protocoloLote = uuidv4();

    // 2. Buscar os webhooks que correspondem aos IDs fornecidos.
    // Usamos 'findByIds' (que criamos no repositório) em vez de 'findById'
    const webhooks = await this.webhookRepository.findByIds(ids);

    const webhooksEncontradosMap = new Map(webhooks.map((wh) => [wh.id.toString(), wh]));
    const idsEncontrados = new Set(webhooks.map((wh) => wh.id.toString()));
    const idsInvalidos = ids.filter((id) => !idsEncontrados.has(id.toString()));

    if (webhooks.length === 0) {
      // Nenhum ID fornecido era válido.
      const error = new Error('Nenhum webhook encontrado para os IDs fornecidos.');
      error.status = 422; // Unprocessable Entity
      error.ids_invalidos = idsInvalidos;
      throw error;
    }

    // 3. Preparar e executar as chamadas HTTP em paralelo.
    const reenviosPromises = webhooks.map((webhook) => {
      console.log(`[Reenvio] Processando ID: ${webhook.id}, URL: ${webhook.url}`);
      return this.processarReenvio(webhook);
    });

    const resultados = await Promise.allSettled(reenviosPromises);

    // 4. Salvar o registro do lote de reprocessamento (o "Protocolo").
    // O seu model 'WebhookReprocessadoModel' espera 'servico_id' como JSONB.
    // O seu DTO de Input 'ReenviarWebhookInput' define 'id' como o array.
    // Vamos salvar os IDs que *tentamos* processar.
    const registroProtocolo = {
      id: uuidv4(), // ID único da tabela
      protocolo: protocoloLote, // ID da requisição/lote
      data: {
        // Armazenamos o payload de entrada original
        product,
        ids_solicitados: ids,
        kind,
        type,
        ids_invalidos: idsInvalidos,
        // Você pode adicionar um resumo dos resultados aqui se quiser
        // resultados: resultados.map(r => r.status)
      },
      data_criacao: new Date(),
      cedente_id: webhooks[0].cedente_id || null, // Assumindo que todos são do mesmo cedente
      kind: kind,
      type: type,
      servico_id: idsEncontrados, // Salva os IDs que foram processados como JSONB
      status: 'completed', // Status do LOTE (não dos webhooks individuais)
    };

    await this.reprocessadoRepository.create(registroProtocolo);

    // 5. Retornar o protocolo do lote para o Controller.
    return { protocolo: protocoloLote };
  }

  /**
   * Lógica interna para processar um único webhook.
   * @param {object} webhook - O objeto webhook do banco de dados.
   * @returns {Promise<object>}
   */
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
        // Atualiza o webhook original com a tentativa bem-sucedida
        await this.webhookRepository.update(webhook.id, {
          tentativas: (webhook.tentativas || 0) + 1,
          last_status: response.status, // Você pode precisar adicionar esta coluna
        });
        return { id: webhook.id, status: 'fulfilled', httpStatus: response.status };
      } else {
        // Falha (ex: 404, 500)
        throw new Error(`HTTP Status ${response.status}`);
      }
    } catch (err) {
      // Falha (ex: timeout, erro de rede, ou o 'throw' acima)
      await this.webhookRepository.update(webhook.id, {
        tentativas: (webhook.tentativas || 0) + 1,
        last_status: response?.status || null, // Salva o status se tiver, senão null
      });
      return { id: webhook.id, status: 'rejected', reason: err.message };
    }
  }
}