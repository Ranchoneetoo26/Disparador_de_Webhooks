"use strict";

const express = require("express");
const createAuthMiddleware = require("../middlewares/AuthMiddleware.js");
const ReenviarWebhookController = require("../../../../application/controllers/ReenviarWebhookController.js");
const SequelizeCedenteRepository = require("../../../database/sequelize/repositories/SequelizeCedenteRepository.js");
const SequelizeSoftwareHouseRepository = require("../../../database/sequelize/repositories/SequelizeSoftwareHouseRepository.js");
const SequelizeWebhookReprocessadoRepository = require("../../../database/sequelize/repositories/SequelizeWebhookReprocessadoRepository.js");
const SequelizeWebhookRepository = require("../../../database/sequelize/repositories/SequelizeWebhookRepository.js");
const httpClient = require("../../../http/providers/AxiosProvider.js");

const RedisCacheRepository = require("../../../cache/redis/RedisCacheRepository.js");

const { models } = require("../../../database/sequelize/models/index.cjs");

const router = express.Router();

const cedenteRepository = new SequelizeCedenteRepository({ models });
const softwareHouseRepository = new SequelizeSoftwareHouseRepository({
  models,
});
const authMiddleware = createAuthMiddleware({
  cedenteRepository,
  softwareHouseRepository,
});

const redisCacheRepository = new RedisCacheRepository();

const webhookRepository = new SequelizeWebhookRepository();
const webhookReprocessadoRepository =
  new SequelizeWebhookReprocessadoRepository();

const reenviarWebhookController = new ReenviarWebhookController({
  webhookRepository,
  webhookReprocessadoRepository,
  httpClient,
  redisClient: redisCacheRepository,
});

router.use(authMiddleware);
router.post("/", (req, res) => reenviarWebhookController.handle(req, res));

module.exports = router;
