import express from 'express';
import ReenviarWebhookController from '../../../application/controllers/ReenviarWebhookController.js';
import { webhookReprocessadoRepository, redisCacheRepository, webhookRepository } from '../database/sequelize/repositories/index.js';
import axios from 'axios';

const router = express.Router();

// Initialize controller with dependencies
const reenviarWebhookController = new ReenviarWebhookController({
    webhookRepository,
    webhookReprocessadoRepository,
    httpClient: axios,
    redisClient: redisCacheRepository,
});

// Route to reprocess webhook
router.post('/reenviar', (req, res) => reenviarWebhookController.handle(req, res));

// Route to get webhooks
router.get('/', (req, res) => {
    res.status(200).json([]);
});

export default router;