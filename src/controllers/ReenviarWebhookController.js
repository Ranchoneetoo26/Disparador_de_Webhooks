
'use strict';

import ReenviarWebhookUseCase from '../application/useCases/ReenviarWebhookUseCase.js';
import ReenviarWebhookOutput from '../application/dtos/ReenviarWebhookOutput.js';
import ReenviarWebhookInput from '../application/dtos/ReenviarWebhookInput.js';

export default class ReenviarWebhookController {
  constructor({ webhookRepository, webhookReprocessadoRepository, httpClient, redisClient }) {
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
      const result = await this.useCase.execute(input);
      return res.status(200).json(ReenviarWebhookOutput.success(result.protocolo));
    } catch (err) {
      console.error('Erro no reenvio:', err.message);
      const status = err.status || 400;
      const detalhes = err.ids_invalidos || null;
      return res.status(status).json(ReenviarWebhookOutput.error(status, err.message, detalhes));
    }
  }
}
