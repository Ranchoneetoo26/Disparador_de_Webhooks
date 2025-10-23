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

router.post('/:id/reenviar', reenviarWebhookController.handle.bind(reenviarWebhookController));
const getWebhooks = (req, res) => {
    res.status(200).json([]);
};

router.get('/', getWebhooks);

export default router;