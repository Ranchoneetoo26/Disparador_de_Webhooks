'use strict';

// --- CORREÇÃO AQUI ---
// Mudamos a forma como o Controlador importa o UseCase
import { default as ReenviarWebhookUseCase } from '../useCases/ReenviarWebhookUseCase.js';
// --- FIM DA CORREÇÃO ---

import ReenviarWebhookInput from '../dtos/ReenviarWebhookInput.js';

export default class ReenviarWebhookController {
  constructor({ 
    webhookRepository, 
    webhookReprocessadoRepository, 
    httpClient, 
    redisClient 
  }) {
    // Instancia o UseCase com as dependências
    this.reenviarWebhookUseCase = new ReenviarWebhookUseCase({
      webhookRepository,
      webhookReprocessadoRepository,
      httpClient,
      redisClient
    });
  }

  async handle(req, res) {
    try {
      const { product, id, kind, type } = req.body;
      const input = new ReenviarWebhookInput(product, id, kind, type);
      
      // O 'cedente' vem do seu AuthMiddleware
      const cedente = req.cedente; 

      const output = await this.reenviarWebhookUseCase.execute(input, cedente);
      
      return res.status(200).json(output);

    } catch (err) {
      // Pega exceções customizadas
      if (err.status) {
        return res.status(err.status).json({
          error: err.name,
          message: err.message,
          ...(err.details && { details: err.details })
        });
      }
      // Outros erros
      console.error(err);
      return res.status(500).json({ error: 'InternalServerError', message: err.message });
    }
  }
}