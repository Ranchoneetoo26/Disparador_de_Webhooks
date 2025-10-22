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

  handle = async (req, res) => {
    try {
      // 1. Crie o payload final e limpo
      const finalPayload = {
        ...req.body,
        id: [req.params.id]
      };

      // 2. Crie uma CÓPIA PROFUNDA (deep copy) SÓ para o validador
      const payloadParaValidar = {
        ...finalPayload,
        id: [...finalPayload.id] // <<< AQUI ESTÁ A GRANDE MUDANÇA
      };
      // (Isso cria um NOVO array para o ID)

      // 3. Chame a validação na CÓPIA.
      ReenviarWebhookInput.validate(payloadParaValidar);

      // 4. Execute o UseCase com o payload ORIGINAL e limpo
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