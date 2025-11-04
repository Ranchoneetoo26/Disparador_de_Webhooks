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

const db = dbCjs.default || dbCjs;
const { models, sequelize, Sequelize } = db;
const { Op } = Sequelize;

const router = express.Router();

// Repositórios de apoio
const cedenteRepository = new SequelizeCedenteRepository();
const softwareHouseRepository = new SequelizeSoftwareHouseRepository();

// Middleware de autenticação
const authMiddleware = createAuthMiddleware({
  cedenteRepository,
  softwareHouseRepository,
});

// Pega com segurança o model WebhookReprocessado (sensitive case)
const webhookModel = models && (models.WebhookReprocessado || models.webhookReprocessado);
if (!webhookModel) {
  // Lança erro claro para debugging em ambiente de testes
  throw new Error('Model WebhookReprocessado não encontrado em sequelize.models');
}

// Instancia repositório corretamente (propriedade com o nome correto)
const webhookReprocessadoRepository = new SequelizeWebhookReprocessadoRepository({
  WebhookReprocessadoModel: webhookModel,
  sequelize,
  Op
});

// Instancia dos UseCases com as dependências esperadas (objeto)
const listarProtocolosUseCase = new ListarProtocolosUseCase({
  webhookReprocessadoRepository,
  cacheRepository: redisCacheRepository
});

const consultarProtocoloUseCase = new ConsultarProtocoloUseCase({
  webhookReprocessadoRepository,
  cacheRepository: redisCacheRepository
});

// Controller
const protocoloController = new ProtocoloController({
  listarProtocolosUseCase,
  consultarProtocoloUseCase
});

// Rotas
router.use(authMiddleware);
router.get('/', (req, res) => protocoloController.listarProtocolos(req, res));
router.get('/:uuid', (req, res) => protocoloController.consultarProtocolo(req, res));

export default router;
