'use strict';

import express from 'express';
import createAuthMiddleware from '../middlewares/AuthMiddleware.js';
import ReenviarWebhookController from '../../../../application/controllers/ReenviarWebhookController.js';
import SequelizeCedenteRepository from '../../../database/sequelize/repositories/SequelizeCedenteRepository.js';
import SequelizeSoftwareHouseRepository from '../../../database/sequelize/repositories/SequelizeSoftwareHouseRepository.js';
import SequelizeWebhookReprocessadoRepository from '../../../database/sequelize/repositories/SequelizeWebhookReprocessadoRepository.js';
import SequelizeWebhookRepository from '../../../database/sequelize/repositories/SequelizeWebhookRepository.js';
import httpClient from '../../../http/providers/AxiosProvider.js';

import RedisCacheRepository from '../../../cache/redis/RedisCacheRepository.js';

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

const redisCacheRepository = new RedisCacheRepository();

const webhookRepository = new SequelizeWebhookRepository();
const webhookReprocessadoRepository = new SequelizeWebhookReprocessadoRepository({
  WebhookReprocessadoModel: models.WebhookReprocessado,
  sequelize: sequelize,
  Op: Op
});

const reenviarWebhookController = new ReenviarWebhookController({
  webhookRepository,
  webhookReprocessadoRepository,
  httpClient,
  redisClient: redisCacheRepository 
});

router.use(authMiddleware);

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