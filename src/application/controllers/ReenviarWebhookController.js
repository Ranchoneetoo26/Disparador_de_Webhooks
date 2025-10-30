// src/application/controllers/ReenviarWebhookController.js
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
      // 1. Validar a entrada
      const input = ReenviarWebhookInput.validate(req.body);
      
      // 2. Executar o caso de uso
      const result = await this.useCase.execute(input);
      
      // 3. Retornar o sucesso
      // (Adicionamos 'return' para garantir que a função pare aqui)
      return res.status(200).json(ReenviarWebhookOutput.success(result.protocolo));

    } catch (err) {
      // --- BLOCO CATCH MELHORADO ---
      // 4. Capturar QUALQUER erro que o UseCase jogar
      console.error('[Erro no Reenvio - Controller]', err); // Loga o objeto de erro inteiro

      const status = err.status || 400;
      const message = err.message || 'Erro desconhecido ao processar o reenvio.';
      const detalhes = err.ids_invalidos || null;
      
      return res.status(status).json(ReenviarWebhookOutput.error(status, message, detalhes));
    }
  }
}