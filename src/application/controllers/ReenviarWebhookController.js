"use strict";

const ReenviarWebhookUseCase = require("../useCases/ReenviarWebhookUseCase.js");

const ReenviarWebhookInput = require("../dtos/ReenviarWebhookInput.js");
const ReenviarWebhookOutput = require("../dtos/ReenviarWebhookOutput.js");
const UnprocessableEntityException = require("../../domain/exceptions/UnprocessableEntityException.js");

class ReenviarWebhookController {
  constructor({
    servicoRepository,
    webhookRepository,
    webhookReprocessadoRepository,
    httpClient,
    redisClient,
  }) {
    this.useCase = new ReenviarWebhookUseCase({
      servicoRepository,
      webhookRepository,
      webhookReprocessadoRepository,
      httpClient,
      redisClient,
    });
  }

  handle = async (req, res) => {
    try {
<<<<<<< HEAD
      const finalPayload = {
        ...req.body,
        id: [req.params.id]
      };

      const payloadParaValidar = {
        ...finalPayload,
        id: [...finalPayload.id] 
      };

      ReenviarWebhookInput.validate(payloadParaValidar);

      const result = await this.useCase.execute(finalPayload);

      return res.status(200).json(ReenviarWebhookOutput.success(result.protocolo));

    } catch (err) {
      console.error('Erro no reenvio:', err.message);

      let status = err.status || 400;
      if (err.message.includes('Não foi possível gerar a notificação')) {
        status = 502;
      }

=======
      const { cedente } = req;
      const input = ReenviarWebhookInput.validate(req.body);
      input.cedente = cedente;

      const output = await this.useCase.execute(input, cedente);

      return res.status(200).json(output);
    } catch (err) {
      console.error("[Erro no Reenvio - Controller]", err);

      if (err instanceof UnprocessableEntityException) {
        return res
          .status(err.status)
          .json(
            ReenviarWebhookOutput.error(
              err.status,
              err.message,
              err.ids_invalidos
            )
          );
      }

      const status = err.status || 400;
      const message =
        err.message || "Erro desconhecido ao processar o reenvio.";
>>>>>>> 929a7ec6c858b3cadf7036896999f620d5e879bb
      const detalhes = err.ids_invalidos || null;

      return res
        .status(status)
        .json(ReenviarWebhookOutput.error(status, message, detalhes));
    }
  }
<<<<<<< HEAD
}
=======
}

module.exports = ReenviarWebhookController;
>>>>>>> 929a7ec6c858b3cadf7036896999f620d5e879bb
