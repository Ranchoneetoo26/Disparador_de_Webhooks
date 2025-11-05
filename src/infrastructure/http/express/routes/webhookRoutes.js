"use strict";

const express = require("express");
const createAuthMiddleware = require("../middlewares/AuthMiddleware.js");
const ReenviarWebhookController = require("../../../../application/controllers/ReenviarWebhookController.js");
const SequelizeCedenteRepository = require("../../../database/sequelize/repositories/SequelizeCedenteRepository.js");
const SequelizeSoftwareHouseRepository = require("../../../database/sequelize/repositories/SequelizeSoftwareHouseRepository.js");
const SequelizeWebhookReprocessadoRepository = require("../../../database/sequelize/repositories/SequelizeWebhookReprocessadoRepository.js");
const SequelizeWebhookRepository = require("../../../database/sequelize/repositories/SequelizeWebhookRepository.js");
const httpClient = require("../../../http/providers/AxiosProvider.js");

// --- CORREÇÃO 1: Importa a INSTÂNCIA singleton ---
const RedisCacheRepository = require("../../../cache/redis/RedisCacheRepository.js");

// Importa o db (assumindo que exporta 'models', 'sequelize', 'Sequelize' e 'Op')
const { models } = require("../../../database/sequelize/models/index.cjs");

const router = express.Router();

// Instanciação dos repositórios
const cedenteRepository = new SequelizeCedenteRepository({ models });
const softwareHouseRepository = new SequelizeSoftwareHouseRepository({
  models,
});
const authMiddleware = createAuthMiddleware({
  cedenteRepository,
  softwareHouseRepository,
});

const redisCacheRepository = new RedisCacheRepository();

// Passa o 'models' e 'Op' para os repositórios que precisam
const webhookRepository = new SequelizeWebhookRepository();
const webhookReprocessadoRepository =
  new SequelizeWebhookReprocessadoRepository();

// servicoRepository foi REMOVIDO
const reenviarWebhookController = new ReenviarWebhookController({
  // servicoRepository REMOVIDO
  webhookRepository,
  webhookReprocessadoRepository,
  httpClient,
  redisClient: redisCacheRepository, // Agora usa a instância importada
});

router.use(authMiddleware);
router.post("/", (req, res) => reenviarWebhookController.handle(req, res));

module.exports = router;
