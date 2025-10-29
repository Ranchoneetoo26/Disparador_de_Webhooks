// src/infrastructure/http/express/routes/webhookRoutes.js
'use strict';

import express from 'express';
import createAuthMiddleware from '../middlewares/AuthMiddleware.js';

// Importações da Arquitetura "Real"
import ReenviarWebhookController from '../../../../application/controllers/ReenviarWebhookController.js';

// Importações dos Repositórios REAIS (Infraestrutura)
import SequelizeCedenteRepository from '../../../database/sequelize/repositories/SequelizeCedenteRepository.js';
import SequelizeSoftwareHouseRepository from '../../../database/sequelize/repositories/SequelizeSoftwareHouseRepository.js';
import SequelizeWebhookReprocessadoRepository from '../../../database/sequelize/repositories/SequelizeWebhookReprocessadoRepository.js';
import SequelizeWebhookRepository from '../../../database/sequelize/repositories/SequelizeWebhookRepository.js';
import redisCacheRepository from '../../../cache/redis/RedisCacheRepository.js';
import httpClient from '../../../http/providers/AxiosProvider.js';

// --- CORREÇÃO AQUI ---
// Importamos 'db' como o export default do arquivo .cjs
import db from '../../../database/sequelize/models/index.cjs';
// Desestruturamos TUDO que precisamos aqui, em um só lugar.
const { models, sequelize, Sequelize } = db;
const { Op } = Sequelize;
// --- FIM DA CORREÇÃO ---

const router = express.Router();

// --- Injeção de Dependência ---

// 1. Repositórios de Autenticação
const cedenteRepository = new SequelizeCedenteRepository();
const softwareHouseRepository = new SequelizeSoftwareHouseRepository();
const authMiddleware = createAuthMiddleware({
  cedenteRepository,
  softwareHouseRepository,
});

// 2. Repositórios do Caso de Uso
const webhookRepository = new SequelizeWebhookRepository();
const webhookReprocessadoRepository = new SequelizeWebhookReprocessadoRepository({
  WebhookReprocessadoModel: models.WebhookReprocessado,
  sequelize: sequelize, // <-- Injetar sequelize
  Op: Op                  // <-- Injetar Op
});

// 3. Instanciar o Controller "Real"
const reenviarWebhookController = new ReenviarWebhookController({
  webhookRepository,
  webhookReprocessadoRepository,
  httpClient,
  redisClient: redisCacheRepository,
});

// --- Fim da Injeção de Dependência ---

router.use(authMiddleware);

router.post(
  '/',
  (req, res) => reenviarWebhookController.handle(req, res)
);

export default router;