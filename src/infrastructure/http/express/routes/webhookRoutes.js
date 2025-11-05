"use strict";

const express = require("express");
const createAuthMiddleware = require("../middlewares/AuthMiddleware.js");
const ReenviarWebhookController = require("../../../../application/controllers/ReenviarWebhookController.js");

// --- Importações dos Repositórios ---
const SequelizeCedenteRepository = require("../../../database/sequelize/repositories/SequelizeCedenteRepository.js");
const SequelizeSoftwareHouseRepository = require("../../../database/sequelize/repositories/SequelizeSoftwareHouseRepository.js");
const SequelizeWebhookReprocessadoRepository = require("../../../database/sequelize/repositories/SequelizeWebhookReprocessadoRepository.js");
const SequelizeWebhookRepository = require("../../../database/sequelize/repositories/SequelizeWebhookRepository.js");
// ===== 1. ADICIONE A IMPORTAÇÃO AQUI =====
const SequelizeServicoRepository = require("../../../database/sequelize/repositories/SequelizeServicoRepository.js");

const httpClient = require("../../../http/providers/AxiosProvider.js");
const RedisCacheRepository = require("../../../cache/redis/RedisCacheRepository.js");
const { models } = require("../../../database/sequelize/models/index.cjs");

const router = express.Router();

// --- Instâncias dos Repositórios ---
const cedenteRepository = new SequelizeCedenteRepository({ models });
const softwareHouseRepository = new SequelizeSoftwareHouseRepository({
  models,
});

// (Nota: Seus outros repositórios provavelmente também precisam dos 'models')
const webhookRepository = new SequelizeWebhookRepository({ models });
const webhookReprocessadoRepository =
  new SequelizeWebhookReprocessadoRepository({ models });

// ===== 2. ADICIONE A INSTÂNCIA AQUI =====
const servicoRepository = new SequelizeServicoRepository({ models });

const redisCacheRepository = new RedisCacheRepository();

const authMiddleware = createAuthMiddleware({
  cedenteRepository,
  softwareHouseRepository,
});

const reenviarWebhookController = new ReenviarWebhookController({
  webhookRepository,
  webhookReprocessadoRepository,
  httpClient,
  redisClient: redisCacheRepository,
  servicoRepository: servicoRepository,
});

router.use(authMiddleware);
router.post("/", (req, res) => reenviarWebhookController.handle(req, res));

module.exports = router;