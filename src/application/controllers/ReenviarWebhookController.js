<<<<<<< HEAD
// src/application/controllers/ReenviarWebhookController.js
=======

>>>>>>> e8eb97ff05622b90f384c5fbc829e82218ca52c7
'use strict';

import ReenviarWebhookUseCase from '../useCases/ReenviarWebhookUseCase.js';
import ReenviarWebhookOutput from '../dtos/ReenviarWebhookOutput.js';
<<<<<<< HEAD
=======
import ReenviarWebhookInput from '../dtos/ReenviarWebhookInput.js';
>>>>>>> e8eb97ff05622b90f384c5fbc829e82218ca52c7

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
<<<<<<< HEAD
      // ✅ CORREÇÃO: Unifica o 'id' da URL com o 'body' da requisição
      const { id } = req.params;
      const { product, kind, type } = req.body;

      const payload = {
        id: [id], // O UseCase espera um array de IDs
        product,
        kind,
        type
      };
      
      const result = await this.useCase.execute(payload);
      
      return res.status(200).json(ReenviarWebhookOutput.success(result.protocolo));
    } catch (err) {
      console.error('Erro no reenvio:', err.message);
      
      const status = err.status || 400; 
      const detalhes = err.ids_invalidos || null;
      
      // ✅ CORREÇÃO: Garante que a mensagem de erro seja passada corretamente
      const errorMessage = err.message || 'Ocorreu um erro inesperado.';
      
      return res.status(status).json(ReenviarWebhookOutput.error(status, errorMessage, detalhes));
    }
  }
}
=======
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
>>>>>>> e8eb97ff05622b90f384c5fbc829e82218ca52c7
