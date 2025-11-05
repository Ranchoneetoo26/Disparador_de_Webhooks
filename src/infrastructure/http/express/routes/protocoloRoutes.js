"use strict";

const express = require("express");
const createAuthMiddleware = require("../middlewares/AuthMiddleware.js");
const ProtocoloController = require("../controllers/ProtocoloController.js");
const ListarProtocolosUseCase = require("../../../../application/useCases/ListarProtocolosUseCase.js");
const ConsultarProtocoloUseCase = require("../../../../application/useCases/ConsultarProtocoloUseCase.js");
const SequelizeCedenteRepository = require("../../../database/sequelize/repositories/SequelizeCedenteRepository.js");
const SequelizeSoftwareHouseRepository = require("../../../database/sequelize/repositories/SequelizeSoftwareHouseRepository.js");
const SequelizeWebhookReprocessadoRepository = require("../../../database/sequelize/repositories/SequelizeWebhookReprocessadoRepository.js");

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
});

// Controller
const protocoloController = new ProtocoloController({
  listarProtocolosUseCase,
  consultarProtocoloUseCase,
});

// Rotas
router.use(authMiddleware);
router.get("/", (req, res) => protocoloController.listarProtocolos(req, res));
router.get("/:uuid", (req, res) =>
  protocoloController.consultarProtocolo(req, res)
);

module.exports = router;
