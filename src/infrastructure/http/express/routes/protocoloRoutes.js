'use strict';

import express from 'express';
import createAuthMiddleware from '../middlewares/AuthMiddleware.js';
import ProtocoloController from '../controllers/ProtocoloController.js';
import ListarProtocolosUseCase from '../../../../application/useCases/ListarProtocolosUseCase.js';
import ConsultarProtocoloUseCase from '../../../../application/useCases/ConsultarProtocoloUseCase.js';
import SequelizeCedenteRepository from '../../../database/sequelize/repositories/SequelizeCedenteRepository.js';
import SequelizeSoftwareHouseRepository from '../../../database/sequelize/repositories/SequelizeSoftwareHouseRepository.js';
import SequelizeWebhookReprocessadoRepository from '../../../database/sequelize/repositories/SequelizeWebhookReprocessadoRepository.js';

import RedisCacheRepository from '../../../cache/redis/RedisCacheRepository.js';

import * as db from '../../../database/sequelize/models/index.cjs';

const { models, sequelize, Sequelize } = db;
const { Op } = Sequelize;
const router = express.Router();

const cedenteRepository = new SequelizeCedenteRepository({ models });
const softwareHouseRepository = new SequelizeSoftwareHouseRepository({ models });
const authMiddleware = createAuthMiddleware({
  cedenteRepository,
  softwareHouseRepository,
});

// --- CORREÇÃO AQUI ---
// 1. Instancia o RedisCacheRepository (a classe com .get(), .set(), .del())
const redisCacheRepository = new RedisCacheRepository();

const webhookReprocessadoRepository = new SequelizeWebhookReprocessadoRepository({
  WebhookReprocessadoModel: models.WebhookReprocessado,
  sequelize: sequelize,
  Op: Op
});

const listarProtocolosUseCase = new ListarProtocolosUseCase({
  webhookReprocessadoRepository,
  // 2. Injeta a CLASSE correta, e não o 'redisClient'
  cacheRepository: redisCacheRepository 
});

const consultarProtocoloUseCase = new ConsultarProtocoloUseCase({
  webhookReprocessadoRepository,
  // 3. Injeta a CLASSE correta, e não o 'redisClient'
  cacheRepository: redisCacheRepository 
});
// --- FIM DA CORREÇÃO ---

const protocoloController = new ProtocoloController({
  listarProtocolosUseCase,
  consultarProtocoloUseCase
});

router.use(authMiddleware);

// A rota de listagem (GET /)
router.get('/', (req, res) => protocoloController.listarProtocolos(req, res));

// A rota de consulta (GET /:uuid)
router.get('/:uuid', (req, res) => protocoloController.consultarProtocolo(req, res));

export default router;