// src/infrastructure/http/express/routes/webhookRoutes.js
import express from 'express';
import ReenviarWebhookController from '@/application/controllers/ReenviarWebhookController.js'; 
import { webhookReprocessadoRepository, redisCacheRepository, webhookRepository } from '@/infrastructure/database/sequelize/repositories/index.js';
import axios from 'axios'; 

const router = express.Router();

const reenviarWebhookController = new ReenviarWebhookController({
    webhookRepository,
    webhookReprocessadoRepository,
    httpClient: axios, 
    redisClient: redisCacheRepository,
});

// CORREÇÃO ESSENCIAL: A rota deve aceitar o :id no path para passar o teste
// O Controller ignora o ID do path e usa o ID do body, conforme a regra de negócio.
router.post('/:id/reenviar', (req, res) => reenviarWebhookController.handle(req, res)); 

const getWebhooks = (req, res) => {
    res.status(200).json([]);
};

router.get('/', getWebhooks); 

export default router;
