<<<<<<< HEAD

=======
>>>>>>> 147c0084fb6ff328823fc70425debc9e25fd26ed
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
<<<<<<< HEAD

=======
>>>>>>> 147c0084fb6ff328823fc70425debc9e25fd26ed

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

<<<<<<< HEAD
=======
const redisCacheRepository = new RedisCacheRepository();

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
>>>>>>> 147c0084fb6ff328823fc70425debc9e25fd26ed
export default router;