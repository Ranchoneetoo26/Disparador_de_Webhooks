"use strict";

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

  async execute(payload = {}) {
    // ✅ Verificação de id
    if (!payload?.id) {
      throw new Error("id is required");
    }

    // ✅ Busca o webhook
    const webhook = await this.webhookRepository.findById(payload.id);
    if (!webhook) {
      return { success: false, error: "Webhook not found" };
    }

    try {
      // ✅ Faz o POST do webhook
      const response = await this.httpClient.post(
        webhook.url,
        webhook.payload,
        { timeout: 5000 }
      );

      // ✅ Caso sucesso (2xx)
      if (response && response.status >= 200 && response.status < 300) {
        await this.webhookRepository.update(webhook.id, {
          tentativas: (webhook.tentativas || 0) + 1,
          last_status: response.status,
        });

        return {
          success: true,
          status: response.status,
          data: response.data,
        };
      }

      // ✅ Caso erro de status (não 2xx)
      await this.reprocessadoRepository.create({
        data: webhook.payload,
        cedente_id: webhook.cedente_id || null,
        kind: webhook.kind || "unknown",
        type: webhook.type || "unknown",
        servico_id: webhook.servico_id || null,
        protocolo: `status:${response.status}`,
        meta: { originalStatus: response.status },
      });

      return { success: false, status: response.status };
    } catch (err) {
      // ✅ Caso erro de rede ou exceção
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
