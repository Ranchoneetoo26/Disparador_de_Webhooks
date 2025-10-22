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

  async handle(req, res) {
    try {
      const input = ReenviarWebhookInput.validate(req.body); // Chama a validação Joi (Requisito 1, 2, 3)
      const result = await this.useCase.execute(input);
      return res.status(200).json(ReenviarWebhookOutput.success(result.protocolo));
    } catch (err) {
      console.error('Erro no reenvio:', err.message);
      // Pega o status do erro customizado (422 para divergência, 400 para cache/falha)
      const status = err.status || 400; 
      const detalhes = err.ids_invalidos || null;
      return res.status(status).json(ReenviarWebhookOutput.error(status, err.message, detalhes));
    }
  }
}