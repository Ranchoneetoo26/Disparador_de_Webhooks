// src/infrastructure/http/express/routes/webhookRoutes.js
'use strict';
// [ ... todos os imports ... ]
import express from 'express';
import createAuthMiddleware from '../middlewares/AuthMiddleware.js';
import ReenviarWebhookController from '../../../../application/controllers/ReenviarWebhookController.js';
import SequelizeCedenteRepository from '../../../database/sequelize/repositories/SequelizeCedenteRepository.js';
import SequelizeSoftwareHouseRepository from '../../../database/sequelize/repositories/SequelizeSoftwareHouseRepository.js';
import SequelizeWebhookReprocessadoRepository from '../../../database/sequelize/repositories/SequelizeWebhookReprocessadoRepository.js';
import SequelizeWebhookRepository from '../../../database/sequelize/repositories/SequelizeWebhookRepository.js';
import redisCacheRepository from '../../../cache/redis/RedisCacheRepository.js';
import httpClient from '../../../http/providers/AxiosProvider.js';

// --- CORREÇÃO AQUI ---
import dbCjs from '../../../database/sequelize/models/index.cjs';
const db = dbCjs; // <-- Corrigido (sem .default)
// --- FIM DA CORREÇÃO ---

const { models, sequelize, Sequelize } = db;
const { Op } = Sequelize;
const router = express.Router();

// ... (Resto do arquivo, injeção de dependência...)
const cedenteRepository = new SequelizeCedenteRepository();
const softwareHouseRepository = new SequelizeSoftwareHouseRepository();
const authMiddleware = createAuthMiddleware({
  cedenteRepository,
  softwareHouseRepository,
});
const webhookRepository = new SequelizeWebhookRepository();
const webhookReprocessadoRepository = new SequelizeWebhookReprocessadoRepository({
  WebhookReprocessadoModel: models.WebhookReprocessado,
  sequelize: sequelize,
  Op: Op
});
const reenviarWebhookController = new ReenviarWebhookController({
  webhookRepository,
  webhookReprocessadoRepository,
  httpClient,
  redisClient: redisCacheRepository,
});

router.use(authMiddleware);
router.post('/', (req, res) => reenviarWebhookController.handle(req, res));
export default router;