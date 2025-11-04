'use strict';

import ReenviarWebhookUseCase from '../useCases/ReenviarWebhookUseCase.js';
import ReenviarWebhookOutput from '../dtos/ReenviarWebhookOutput.js';
import ReenviarWebhookInput from '../dtos/ReenviarWebhookInput.js';
// CORREÇÃO: O caminho agora é '../../' para subir dois níveis
import UnprocessableEntityException from '../../domain/exceptions/UnprocessableEntityException.js';

export default class ReenviarWebhookController {
  constructor({
    servicoRepository, // Adicionada nova dependência
    webhookRepository,
    webhookReprocessadoRepository,
    httpClient,
    redisClient
  }) {
    this.useCase = new ReenviarWebhookUseCase({
      servicoRepository, // Injetada no useCase
      webhookRepository,
      webhookReprocessadoRepository,
      httpClient,
      redisClient,
    });
  }

  async handle(req, res) {
    try {
      // 1. Valida o corpo da requisição
      const input = ReenviarWebhookInput.validate(req.body);

      // 2. Adiciona o cedente (do AuthMiddleware) ao input
      // O useCase agora espera por `input.cedente`
      input.cedente = req.cedente;

      const result = await this.useCase.execute(input);

      return res.status(200).json(ReenviarWebhookOutput.success(result.protocolo));

    } catch (err) {
      console.error('[Erro no Reenvio - Controller]', err);

      // Trata o erro 422 (Validação de Situação)
      if (err instanceof UnprocessableEntityException) {
        return res.status(err.status).json(
          ReenviarWebhookOutput.error(err.status, err.message, err.ids_invalidos)
        );
      }

      // Trata outros erros (Validação Joi, Cache, etc.)
      const status = err.status || 400;
      const message = err.message || 'Erro desconhecido ao processar o reenvio.';
      const detalhes = err.ids_invalidos || null;

      return res.status(status).json(ReenviarWebhookOutput.error(status, message, detalhes));
    }
  }
}