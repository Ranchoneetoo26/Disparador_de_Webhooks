'use strict';

// --- CORREÇÃO AQUI ---
// Mudamos a forma como o Controlador importa o UseCase
import { default as ReenviarWebhookUseCase } from '../useCases/ReenviarWebhookUseCase.js';
// --- FIM DA CORREÇÃO ---

import ReenviarWebhookInput from '../dtos/ReenviarWebhookInput.js';
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
      redisClient
    });
  }

  async handle(req, res) {
    try {
      const input = ReenviarWebhookInput.validate(req.body);
      input.cedente = req.cedente;

      const output = await this.reenviarWebhookUseCase.execute(input, cedente);
      
      return res.status(200).json(output);

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