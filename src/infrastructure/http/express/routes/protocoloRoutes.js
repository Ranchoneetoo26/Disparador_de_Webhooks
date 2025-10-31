// src/infrastructure/http/express/routes/protocoloRoutes.js
'use strict';

import express from 'express';
import createAuthMiddleware from '../middlewares/AuthMiddleware.js';
import ProtocoloController from '../controllers/ProtocoloController.js';
import ListarProtocolosUseCase from '../../../../application/useCases/ListarProtocolosUseCase.js';
import ConsultarProtocoloUseCase from '../../../../application/useCases/ConsultarProtocoloUseCase.js';
import SequelizeCedenteRepository from '../../../database/sequelize/repositories/SequelizeCedenteRepository.js';
import SequelizeSoftwareHouseRepository from '../../../database/sequelize/repositories/SequelizeSoftwareHouseRepository.js';
import SequelizeWebhookReprocessadoRepository from '../../../database/sequelize/repositories/SequelizeWebhookReprocessadoRepository.js';

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

<<<<<<< HEAD
=======
// --- CORREÇÃO AQUI ---
// 2. Criamos a INSTÂNCIA
const redisCacheRepository = new RedisCacheRepository();
// --- FIM DA CORREÇÃO ---

const webhookReprocessadoRepository = new SequelizeWebhookReprocessadoRepository({
  WebhookReprocessadoModel: models.WebhookReprocessado,
  sequelize: sequelize,
  Op: Op
});

const listarProtocolosUseCase = new ListarProtocolosUseCase({
  webhookReprocessadoRepository,
  cacheRepository: redisCacheRepository // <-- Agora passamos a instância
});

const consultarProtocoloUseCase = new ConsultarProtocoloUseCase({
  webhookReprocessadoRepository,
  cacheRepository: redisCacheRepository // <-- Agora passamos a instância
});

const protocoloController = new ProtocoloController({
  listarProtocolosUseCase,
  consultarProtocoloUseCase
});

router.use(authMiddleware);
router.get('/', (req, res) => protocoloController.listarProtocolos(req, res));
router.get('/:uuid', (req, res) => protocoloController.consultarProtocolo(req, res));
>>>>>>> 651ab5fbc86e1d21442262c94bdcb06b44117687
export default router;