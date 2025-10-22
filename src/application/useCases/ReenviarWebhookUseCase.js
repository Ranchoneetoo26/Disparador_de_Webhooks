"use strict";

import ReenviarWebhookInput from "../dtos/ReenviarWebhookInput.js";
import { randomUUID } from "crypto";

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
    const input = ReenviarWebhookInput.validate(payload);
    const { product, id, kind, type } = input;

    const cacheKey = `reenviar:${product}:${id.join(",")}`;
    const existeCache = await this.redisClient.get(cacheKey);
    if (existeCache) {
      throw Object.assign(
        new Error("Requisição duplicada. Tente novamente em 1 hora."),
        { status: 400 }
      );
    }

    if (!id) throw new Error("id is required");

    const webhook = await this.webhookRepository.findById(id);
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
      }

      await this.reprocessadoRepository.create({
        data: webhook.payload,
        cedente_id: webhook.cedente_id || null,
        kind: webhook.kind || "unknown",
        type: webhook.type || "unknown",
        servico_id: webhook.servico_id || null,
        protocolo: `status:${resp.status}`,
        meta: { originalStatus: resp.status },
      });

      return { success: false, status: resp.status };
    } catch (err) {
      await this.reprocessadoRepository.create({
        data: webhook.payload,
        cedente_id: webhook.cedente_id || null,
        kind: webhook.kind || "unknown",
        type: webhook.type || "unknown",
        servico_id: webhook.servico_id || null,
        protocolo: `error:${err.message}`,
        meta: { errorMessage: err.message },
      });

      await this.webhookRepository.update(webhook.id, {
        tentativas: (webhook.tentativas || 0) + 1,
      });

      return { success: false, error: err.message };
    }
  }
}
