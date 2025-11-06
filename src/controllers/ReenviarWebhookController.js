"use strict";

const ReenviarWebhookUseCase = require("../useCases/ReenviarWebhookUseCase.js");
const ReenviarWebhookOutput = require("../dtos/ReenviarWebhookOutput.js");
const ReenviarWebhookInput = require("../dtos/ReenviarWebhookInput.js");

class ReenviarWebhookController {
  constructor({
    webhookRepository,
    webhookReprocessadoRepository,
    httpClient,
    redisClient,
  }) {
    this.useCase = new ReenviarWebhookUseCase({
      webhookRepository,
      webhookReprocessadoRepository,
      httpClient,
      redisClient,
    });
  }

  async handle(req, res) {
    try {
      const input = ReenviarWebhookInput.validate(req.body);

      const cedente = req.cedente;

      const result = await this.useCase.execute(input, cedente);

      return res
        .status(200)
        .json(ReenviarWebhookOutput.success(result.protocolo));
    } catch (err) {
      console.error("[Erro no Reenvio - Controller]", err);

      const status = err.status || 400;
      const message =
        err.message || "Erro desconhecido ao processar o reenvio.";
      const detalhes = err.ids_invalidos || null;

      return res
        .status(status)
        .json(ReenviarWebhookOutput.error(status, message, detalhes));
    }
  }
}

module.exports = ReenviarWebhookController;
