'use strict';

import express from 'express';
import createAuthMiddleware from '../middlewares/AuthMiddleware.js';
import ReenviarWebhookController from '../../../../application/controllers/ReenviarWebhookController.js';
import SequelizeCedenteRepository from '../../../database/sequelize/repositories/SequelizeCedenteRepository.js';
import SequelizeSoftwareHouseRepository from '../../../database/sequelize/repositories/SequelizeSoftwareHouseRepository.js';
import SequelizeWebhookReprocessadoRepository from '../../../database/sequelize/repositories/SequelizeWebhookReprocessadoRepository.js';
import SequelizeWebhookRepository from '../../../database/sequelize/repositories/SequelizeWebhookRepository.js';
import SequelizeServicoRepository from '../../../database/sequelize/repositories/SequelizeServicoRepository.js'; // 1. IMPORTAR
import httpClient from '../../../http/providers/AxiosProvider.js';

// --- CORREÇÃO 1: Importa a INSTÂNCIA singleton ---
import redisCacheRepository from '../../../cache/redis/RedisCacheRepository.js';

import * as dbCjs from '../../../database/sequelize/models/index.cjs';
const db = dbCjs.default;
const { models, sequelize, Sequelize } = db;
const { Op } = Sequelize;
const router = express.Router();

// Repositórios para Autenticação
const cedenteRepository = new SequelizeCedenteRepository();
const softwareHouseRepository = new SequelizeSoftwareHouseRepository();
const authMiddleware = createAuthMiddleware({
  cedenteRepository,
  softwareHouseRepository,
});

// --- CORREÇÃO 2: A linha "new RedisCacheRepository()" foi REMOVIDA ---

// Repositórios para o UseCase
const servicoRepository = new SequelizeServicoRepository(); // 2. INSTANCIAR
const webhookRepository = new SequelizeWebhookRepository();
const webhookReprocessadoRepository = new SequelizeWebhookReprocessadoRepository({
  WebhookReprocessadoModel: models.WebhookReprocessado,
  sequelize: sequelize,
  Op: Op
});

// Controller com todas as dependências
const reenviarWebhookController = new ReenviarWebhookController({
  servicoRepository, // 3. INJETAR
  webhookRepository,
  webhookReprocessadoRepository,
  httpClient,
  redisClient: redisCacheRepository // Agora usa a instância importada
});

router.use(authMiddleware);
router.post('/', (req, res) => reenviarWebhookController.handle(req, res));
export default router;
