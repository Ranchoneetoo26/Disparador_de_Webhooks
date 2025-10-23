
'use strict';

import ReenviarWebhookUseCase from '../useCases/ReenviarWebhookUseCase.js';
import ReenviarWebhookOutput from '../dtos/ReenviarWebhookOutput.js';
import ReenviarWebhookInput from '../dtos/ReenviarWebhookInput.js';

export default class ReenviarWebhookController {
  constructor({ webhookRepository, webhookReprocessadoRepository, httpClient, redisClient }) {
    this.useCase = new ReenviarWebhookUseCase({
      webhookRepository,
      webhookReprocessadoRepository,
      httpClient,
      redisClient,
    });
  }

  handle = async (req, res) => {
    try {
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

      const detalhes = err.ids_invalidos || null;
      return res.status(status).json(ReenviarWebhookOutput.error(status, err.message, detalhes));
    }
  }
}