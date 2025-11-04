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
      
      // --- MUDANÇA AQUI ---
      // 2. Pegamos o 'cedente' que o AuthMiddleware já buscou
      const cedente = req.cedente; 
      // --- FIM DA MUDANÇA ---

      // 3. Executar o caso de uso, passando o 'cedente'
      const result = await this.useCase.execute(input, cedente); // <-- 'cedente' adicionado
      
      // 4. Retornar o sucesso
      return res.status(200).json(ReenviarWebhookOutput.success(result.protocolo));

    } catch (err) {
      // 5. Capturar QUALQUER erro (inclusive o 422)
      console.error('[Erro no Reenvio - Controller]', err); 

      const status = err.status || 400;
      const message = err.message || 'Erro desconhecido ao processar o reenvio.';
      const detalhes = err.ids_invalidos || null;
      
      return res.status(status).json(ReenviarWebhookOutput.error(status, message, detalhes));
    }
  }
}
