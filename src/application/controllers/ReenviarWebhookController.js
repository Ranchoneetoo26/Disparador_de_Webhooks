'use strict';

import ReenviarWebhookUseCase from '../useCases/ReenviarWebhookUseCase.js';
import ReenviarWebhookOutput from '../dtos/ReenviarWebhookOutput.js';
import ReenviarWebhookInput from '../dtos/ReenviarWebhookInput.js';
import UnprocessableEntityException from '../../domain/exceptions/UnprocessableEntityException.js';

export default class ReenviarWebhookController {
  constructor({
    // servicoRepository foi removido
    webhookRepository,
    webhookReprocessadoRepository,
    httpClient,
    redisClient
  }) {
    this.useCase = new ReenviarWebhookUseCase({
      // servicoRepository foi removido
      webhookRepository,
      webhookReprocessadoRepository,
      httpClient,
      redisClient,
    }); // O erro do '_' estava aqui
  }

  async handle(req, res) {
    try {
      // 1. Valida o corpo (body)
      const input = ReenviarWebhookInput.validate(req.body);
      
      // 2. INJETA O CEDENTE (Esta é a linha crucial!)
      // Pega o 'cedente' que o AuthMiddleware colocou no 'req'
      // e passa para o 'input' que o UseCase vai receber.
      input.cedente = req.cedente; 
      
      // 3. Executa o UseCase com o input completo
      // A LETRA 'V' FOI REMOVIDA DESTA LINHA
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