'use strict';

import express from 'express';
import createAuthMiddleware from '../middlewares/AuthMiddleware.js';
import ReenviarWebhookController from '../../../../application/controllers/ReenviarWebhookController.js';
import SequelizeCedenteRepository from '../../../database/sequelize/repositories/SequelizeCedenteRepository.js';
import SequelizeSoftwareHouseRepository from '../../../database/sequelize/repositories/SequelizeSoftwareHouseRepository.js';
import SequelizeWebhookReprocessadoRepository from '../../../database/sequelize/repositories/SequelizeWebhookReprocessadoRepository.js';
import SequelizeWebhookRepository from '../../../database/sequelize/repositories/SequelizeWebhookRepository.js';
import httpClient from '../../../http/providers/AxiosProvider.js';

// --- CORREÇÃO 1: Importa a INSTÂNCIA singleton ---
import redisCacheRepository from '../../../cache/redis/RedisCacheRepository.js';

// Importa o db (assumindo que exporta 'models', 'sequelize', 'Sequelize' e 'Op')
import * as db from '../../../database/sequelize/models/index.cjs';

const { models, sequelize, Sequelize } = db;
const { Op } = Sequelize;
const router = express.Router();

// Instanciação dos repositórios
const cedenteRepository = new SequelizeCedenteRepository({ models });
const softwareHouseRepository = new SequelizeSoftwareHouseRepository({ models });
const authMiddleware = createAuthMiddleware({
  cedenteRepository,
  softwareHouseRepository,
});

const redisCacheRepository = new RedisCacheRepository();

// Passa o 'models' e 'Op' para os repositórios que precisam
const webhookRepository = new SequelizeWebhookRepository({ models, Op });
const webhookReprocessadoRepository = new SequelizeWebhookReprocessadoRepository({
  WebhookReprocessadoModel: models.WebhookReprocessado,
  sequelize: sequelize,
  Op: Op
});

// servicoRepository foi REMOVIDO
const reenviarWebhookController = new ReenviarWebhookController({
  // servicoRepository REMOVIDO
  webhookRepository,
  webhookReprocessadoRepository,
  httpClient,
  redisClient: redisCacheRepository // Agora usa a instância importada
});

router.use(authMiddleware);
router.post('/', (req, res) => reenviarWebhookController.handle(req, res));

export default router;