// src/infrastructure/http/express/routes/protocoloRoutes.js
'use strict';
// [ ... outros imports ... ]
import express from 'express';
import createAuthMiddleware from '../middlewares/AuthMiddleware.js';
import ProtocoloController from '../controllers/ProtocoloController.js';
import ListarProtocolosUseCase from '../../../../application/useCases/ListarProtocolosUseCase.js';
import ConsultarProtocoloUseCase from '../../../../application/useCases/ConsultarProtocoloUseCase.js';
import SequelizeCedenteRepository from '../../../database/sequelize/repositories/SequelizeCedenteRepository.js';
import SequelizeSoftwareHouseRepository from '../../../database/sequelize/repositories/SequelizeSoftwareHouseRepository.js';
import SequelizeWebhookReprocessadoRepository from '../../../database/sequelize/repositories/SequelizeWebhookReprocessadoRepository.js';
import redisCacheRepository from '../../../cache/redis/RedisCacheRepository.js';

// --- CORREÇÃO AQUI ---
import * as dbCjs from '../../../database/sequelize/models/index.cjs';
const db = dbCjs.default; // O export real está no '.default'
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
const webhookReprocessadoRepository = new SequelizeWebhookReprocessadoRepository({
  WebhookReprocessadoModel: models.WebhookReprocessado,
  sequelize: sequelize,
  Op: Op
});
const listarProtocolosUseCase = new ListarProtocolosUseCase({
  webhookReprocessadoRepository,
  cacheRepository: redisCacheRepository
});
const consultarProtocoloUseCase = new ConsultarProtocoloUseCase({
  webhookReprocessadoRepository,
  cacheRepository: redisCacheRepository
});
const protocoloController = new ProtocoloController({
  listarProtocolosUseCase,
  consultarProtocoloUseCase
});
router.use(authMiddleware);
router.get('/', (req, res) => protocoloController.listarProtocolos(req, res));
router.get('/:uuid', (req, res) => protocoloController.consultarProtocolo(req, res));
export default router;