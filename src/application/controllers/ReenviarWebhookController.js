'use strict';

import ReenviarWebhookUseCase from '../useCases/ReenviarWebhookUseCase.js';
import ReenviarWebhookOutput from '../dtos/ReenviarWebhookOutput.js';
import ReenviarWebhookInput from '../dtos/ReenviarWebhookInput.js';
import UnprocessableEntityException from '../../domain/exceptions/UnprocessableEntityException.js';

export default class ReenviarWebhookController {
  constructor({
    // servicoRepository REMOVIDO
    webhookRepository,
    webhookReprocessadoRepository,
    httpClient,
    redisClient
  }) {
    this.useCase = new ReenviarWebhookUseCase({
      // servicoRepository REMOVIDO
      webhookRepository,
      webhookReprocessadoRepository,
      httpClient,
      redisClient,
    });
  }

  async handle(req, res) {
    try {
      const input = ReenviarWebhookInput.validate(req.body);
      input.cedente = req.cedente;

      const result = await this.useCase.execute(input);

      return res.status(200).json(ReenviarWebhookOutput.success(result.protocolo));

    } catch (err) {
      console.error('[Erro no Reenvio - Controller]', err);

      if (err instanceof UnprocessableEntityException) {
        return res.status(err.status).json(
          ReenviarWebhookOutput.error(err.status, err.message, err.ids_invalidos)
        );
      }

      const status = err.status || 400;
      const message = err.message || 'Erro desconhecido ao processar o reenvio.';
      const detalhes = err.ids_invalidos || null;

      return res.status(status).json(ReenviarWebhookOutput.error(status, message, detalhes));
    }
  }
}