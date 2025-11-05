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
<<<<<<< HEAD

const safeHandler = (ctrl, method) => {
  try {
    if (!ctrl) return (req, res) => res.status(204).end();
    const fn = ctrl[method] || ctrl;
    if (typeof fn === "function") return fn.bind(ctrl);
    return (req, res) => res.status(204).end();
  } catch (error) {
    console.error("Error in safeHandler:", error);
    return (req, res) =>
      res.status(500).json({ error: "Internal Server Error" });
  }
};

const webhookController = new WebhookController();

router.post("/", safeHandler(webhookController, "reenviar"));
router.get("/", safeHandler(webhookController, "list"));

export default router;
=======
router.post("/", (req, res) => reenviarWebhookController.handle(req, res));

module.exports = router;
>>>>>>> d69ec169d0d39e2e3744332f34d207bd68b6f06a
