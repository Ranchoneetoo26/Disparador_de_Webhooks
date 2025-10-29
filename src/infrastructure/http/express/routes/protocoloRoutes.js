// src/infrastructure/http/express/routes/protocoloRoutes.js
'use strict';

import express from 'express';
import createAuthMiddleware from '../middlewares/AuthMiddleware.js';

// --- Importações Corretas ---
// Importa a CLASSE, não uma função
import ProtocoloController from '../controllers/ProtocoloController.js'; 

// Importa os UseCases que o controller precisa
import ListarProtocolosUseCase from '../../../../application/useCases/ListarProtocolosUseCase.js';
import ConsultarProtocoloUseCase from '../../../../application/useCases/ConsultarProtocoloUseCase.js';

// Importa os Repositórios Concretos (Infra)
import SequelizeCedenteRepository from '../../../database/sequelize/repositories/SequelizeCedenteRepository.js';
import SequelizeSoftwareHouseRepository from '../../../database/sequelize/repositories/SequelizeSoftwareHouseRepository.js';
import SequelizeWebhookReprocessadoRepository from '../../../database/sequelize/repositories/SequelizeWebhookReprocessadoRepository.js';
import redisCacheRepository from '../../../cache/redis/RedisCacheRepository.js';

// Importa o DB (Models, Sequelize, Op)
import db from '../../../database/sequelize/models/index.cjs';
const { models, sequelize, Sequelize } = db;
const { Op } = Sequelize;
// --- Fim das Importações ---

const router = express.Router();

// --- Injeção de Dependência ---

// 1. Repositórios de Autenticação
const cedenteRepository = new SequelizeCedenteRepository();
const softwareHouseRepository = new SequelizeSoftwareHouseRepository();
const authMiddleware = createAuthMiddleware({
  cedenteRepository,
  softwareHouseRepository,
});

// 2. Repositórios dos UseCases
const webhookReprocessadoRepository = new SequelizeWebhookReprocessadoRepository({
  WebhookReprocessadoModel: models.WebhookReprocessado,
  sequelize: sequelize,
  Op: Op
});

// 3. Instanciar os UseCases
const listarProtocolosUseCase = new ListarProtocolosUseCase({
  webhookReprocessadoRepository,
  cacheRepository: redisCacheRepository
});

const consultarProtocoloUseCase = new ConsultarProtocoloUseCase({
  webhookReprocessadoRepository,
  cacheRepository: redisCacheRepository
});

// 4. Instanciar o Controller e injetar os UseCases
const protocoloController = new ProtocoloController({
  listarProtocolosUseCase,
  consultarProtocoloUseCase
});

// --- Fim da Injeção de Dependência ---

// Aplicar autenticação a todas as rotas de /protocolo
router.use(authMiddleware);

/**
 * Rota GET /protocolo
 * Lista os protocolos
 */
router.get(
  '/',
  (req, res) => protocoloController.listarProtocolos(req, res)
);

/**
 * Rota GET /protocolo/:uuid
 * Consulta um protocolo específico
 */
router.get(
  '/:uuid',
  (req, res) => protocoloController.consultarProtocolo(req, res)
);

export default router;