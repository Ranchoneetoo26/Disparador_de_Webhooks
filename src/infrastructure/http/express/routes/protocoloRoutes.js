'use strict';

import express from 'express';
import createAuthMiddleware from '../middlewares/AuthMiddleware.js';
import ProtocoloController from '../controllers/ProtocoloController.js';
import ListarProtocolosUseCase from '../../../../application/useCases/ListarProtocolosUseCase.js';
import ConsultarProtocoloUseCase from '../../../../application/useCases/ConsultarProtocoloUseCase.js';
import SequelizeCedenteRepository from '../../../database/sequelize/repositories/SequelizeCedenteRepository.js';
import SequelizeSoftwareHouseRepository from '../../../database/sequelize/repositories/SequelizeSoftwareHouseRepository.js';
import SequelizeWebhookReprocessadoRepository from '../../../database/sequelize/repositories/SequelizeWebhookReprocessadoRepository.js';

// Importa a INSTÂNCIA singleton do cache
import redisCacheRepository from '../../../cache/redis/RedisCacheRepository.js';

import * as dbCjs from '../../../database/sequelize/models/index.cjs';
const db = dbCjs.default;
const { models, sequelize, Sequelize } = db;
const { Op } = Sequelize;
const router = express.Router();

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

// --- CORREÇÃO AQUI ---
// Os construtores de AMBOS os UseCases esperam um OBJETO
// com as duas dependências.
const listarProtocolosUseCase = new ListarProtocolosUseCase({
  webhookReprocessadoRepository: webhookReprocessadoRepository,
  cacheRepository: redisCacheRepository 
});

const consultarProtocoloUseCase = new ConsultarProtocoloUseCase({
  webhookReprocessadoRepository: webhookReprocessadoRepository,
  cacheRepository: redisCacheRepository 
});
// --- FIM DA CORREÇÃO ---

const protocoloController = new ProtocoloController({
  listarProtocolosUseCase,
  consultarProtocoloUseCase
});

router.use(authMiddleware);
router.get('/', (req, res) => protocoloController.listarProtocolos(req, res));
router.get('/:uuid', (req, res) => protocoloController.consultarProtocolo(req, res));
export default router;