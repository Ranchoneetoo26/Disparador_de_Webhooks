"use strict";

import ReenviarWebhookInput from "../dtos/ReenviarWebhookInput.js";

export default class ReenviarWebhookUseCase {
  constructor({
    webhookRepository,
    webhookReprocessadoRepository,
    httpClient,
    redisClient,
  } = {}) {
    if (!webhookRepository) throw new Error("webhookRepository missing");
    if (!webhookReprocessadoRepository)
      throw new Error("webhookReprocessadoRepository missing");
    if (!httpClient) throw new Error("httpClient missing");
    if (!redisClient) throw new Error("redisClient missing");

    this.webhookRepository = webhookRepository;
    this.reprocessadoRepository = webhookReprocessadoRepository;
    this.httpClient = httpClient;
    this.redisClient = redisClient;
  }

  async execute(payload) {
    if (!payload) {
      const validationError = new Error('Payload é obrigatório');
      validationError.status = 400; 
      throw validationError;
    }

    const input = ReenviarWebhookInput.validate(payload);
    const { product, id, kind, type } = input;

    if (!id || !Array.isArray(id)) {
      const validationError = new Error('O campo "id" deve ser um array.');
      validationError.status = 400;
      throw validationError;
    }

    const cacheKey = `reenviar:${product}:${id.join(",")}`;
    const existeCache = await this.redisClient.get(cacheKey);
    if (existeCache) {
      throw Object.assign(
        new Error("Requisição duplicada. Tente novamente em 1 hora."),
        { status: 400 }
      );
    }


    if (!webhookIdParaBuscar) throw new Error("id is required after validation");

    const webhook = await this.webhookRepository.findById(webhookIdParaBuscar);
    if (!webhook) {
      return { success: false, error: "Webhook not found" };
    }

    try {
      const resp = await this.httpClient.post(webhook.url, webhook.payload, {
        timeout: 5000,
      });

      if (resp && resp.status >= 200 && resp.status < 300) {
        await this.webhookRepository.update(webhook.id, {
          tentativas: (webhook.tentativas || 0) + 1,
          last_status: resp.status,
        });

        return { success: true, status: resp.status, data: resp.data };
      } else {
        const status = resp ? resp.status : 'no_status';
        await this.reprocessadoRepository.create({
          data: webhook.payload,
          cedente_id: webhook.cedente_id || null,
          kind: webhook.kind || kind || "unknown",
          type: webhook.type || type || "unknown",
          servico_id: webhook.servico_id || JSON.stringify(id) || null,
          protocolo: `status:${status}`,
          meta: { originalStatus: status },
        });
        return { success: false, status: status };
      }
    } catch (err) {
      await this.reprocessadoRepository.create({
        data: webhook.payload,
        cedente_id: webhook.cedente_id || null,
        kind: webhook.kind || kind || "unknown",
        type: webhook.type || type || "unknown",
        servico_id: webhook.servico_id || JSON.stringify(id) || null,
        protocolo: `error:${err.message.slice(0, 100)}`,
        meta: { errorMessage: err.message },
      });

      await this.webhookRepository.update(webhook.id, {
        tentativas: (webhook.tentativas || 0) + 1,
      });

      return { success: false, error: err.message };
    }
  }
}