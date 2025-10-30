// src/infrastructure/http/express/routes/webhookRoutes.js
'use strict';

import express from 'express';
import createAuthMiddleware from '../middlewares/AuthMiddleware.js';
import ReenviarWebhookController from '../../../../application/controllers/ReenviarWebhookController.js';
import SequelizeCedenteRepository from '../../../database/sequelize/repositories/SequelizeCedenteRepository.js';
import SequelizeSoftwareHouseRepository from '../../../database/sequelize/repositories/SequelizeSoftwareHouseRepository.js';
import SequelizeWebhookReprocessadoRepository from '../../../database/sequelize/repositories/SequelizeWebhookReprocessadoRepository.js';
import SequelizeWebhookRepository from '../../../database/sequelize/repositories/SequelizeWebhookRepository.js';
import httpClient from '../../../http/providers/AxiosProvider.js';

// --- CORREÇÃO AQUI ---
// 1. Importamos a CLASSE
import RedisCacheRepository from '../../../cache/redis/RedisCacheRepository.js';
// --- FIM DA CORREÇÃO ---

import * as dbCjs from '../../../database/sequelize/models/index.cjs';
const db = dbCjs.default;
const { models, sequelize, Sequelize } = db;
const { Op } = Sequelize;
const router = express.Router();

// --- Injeção de Dependência ---
const cedenteRepository = new SequelizeCedenteRepository();
const softwareHouseRepository = new SequelizeSoftwareHouseRepository();
const authMiddleware = createAuthMiddleware({
  cedenteRepository,
  softwareHouseRepository,
});

// --- CORREÇÃO AQUI ---
// 2. Criamos a INSTÂNCIA
const redisCacheRepository = new RedisCacheRepository();
// --- FIM DA CORREÇÃO ---

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
  redisClient: redisCacheRepository // <-- Agora passamos a instância
});

router.use(authMiddleware);
router.post('/', (req, res) => reenviarWebhookController.handle(req, res));
export default router;