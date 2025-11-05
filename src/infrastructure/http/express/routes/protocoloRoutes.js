"use strict";

const express = require("express");
const createAuthMiddleware = require("../middlewares/AuthMiddleware.js");
const ProtocoloController = require("../controllers/ProtocoloController.js");
const ListarProtocolosUseCase = require("../../../../application/useCases/ListarProtocolosUseCase.js");
const ConsultarProtocoloUseCase = require("../../../../application/useCases/ConsultarProtocoloUseCase.js");
const SequelizeCedenteRepository = require("../../../database/sequelize/repositories/SequelizeCedenteRepository.js");
const SequelizeSoftwareHouseRepository = require("../../../database/sequelize/repositories/SequelizeSoftwareHouseRepository.js");
const SequelizeWebhookReprocessadoRepository = require("../../../database/sequelize/repositories/SequelizeWebhookReprocessadoRepository.js");

<<<<<<< HEAD
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
=======
// Importa a INSTÂNCIA singleton do cache
const redisCacheRepository =
  new (require("../../../cache/redis/RedisCacheRepository.js"))();

const {
  models,
  sequelize,
  Sequelize,
} = require("../../../database/sequelize/models/index.cjs");

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
// Instancia repositório corretamente (propriedade com o nome correto)
const webhookReprocessadoRepository =
  new SequelizeWebhookReprocessadoRepository();

// Instancia dos UseCases com as dependências esperadas (objeto)
const listarProtocolosUseCase = new ListarProtocolosUseCase({
  webhookReprocessadoRepository,
  cacheRepository: redisCacheRepository,
});

const consultarProtocoloUseCase = new ConsultarProtocoloUseCase({
  webhookReprocessadoRepository,
  cacheRepository: redisCacheRepository,
>>>>>>> ac74577e24c01cb6576b44326ef20c19e70cd838
});

// Controller
const protocoloController = new ProtocoloController({
<<<<<<< HEAD
  listarProtocolosUseCase,
  consultarProtocoloUseCase
=======
  listarProtocolosUseCase,
  consultarProtocoloUseCase,
>>>>>>> ac74577e24c01cb6576b44326ef20c19e70cd838
});

// Rotas
router.use(authMiddleware);
<<<<<<< HEAD

// A rota de listagem (GET /)
router.get('/', (req, res) => protocoloController.listarProtocolos(req, res));

// A rota de consulta (GET /:uuid)
router.get('/:uuid', (req, res) => protocoloController.consultarProtocolo(req, res));

export default router;
=======
router.get("/", (req, res) => protocoloController.listarProtocolos(req, res));
router.get("/:uuid", (req, res) =>
  protocoloController.consultarProtocolo(req, res)
);

module.exports = router;
>>>>>>> ac74577e24c01cb6576b44326ef20c19e70cd838
