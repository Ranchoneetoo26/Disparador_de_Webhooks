"use strict";

<<<<<<< HEAD
import express from 'express';
import createAuthMiddleware from '../middlewares/AuthMiddleware.js';
import ReenviarWebhookController from '../../../../application/controllers/ReenviarWebhookController.js';
import SequelizeCedenteRepository from '../../../database/sequelize/repositories/SequelizeCedenteRepository.js';
import SequelizeSoftwareHouseRepository from '../../../database/sequelize/repositories/SequelizeSoftwareHouseRepository.js';
import SequelizeWebhookReprocessadoRepository from '../../../database/sequelize/repositories/SequelizeWebhookReprocessadoRepository.js';
import SequelizeWebhookRepository from '../../../database/sequelize/repositories/SequelizeWebhookRepository.js';
import httpClient from '../../../http/providers/AxiosProvider.js';
import RedisCacheRepository from '../../../cache/redis/RedisCacheRepository.js';

// Importa o db
import * as db from '../../../database/sequelize/models/index.cjs';

const { models, sequelize, Sequelize } = db;
const { Op } = Sequelize;
const router = express.Router();

// Instanciação dos repositórios
// Eu adicionei o { models } que estava faltando no construtor
const cedenteRepository = new SequelizeCedenteRepository({ models });
const softwareHouseRepository = new SequelizeSoftwareHouseRepository({ models });
=======
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
>>>>>>> ac74577e24c01cb6576b44326ef20c19e70cd838
const authMiddleware = createAuthMiddleware({
  cedenteRepository,
  softwareHouseRepository,
});

const redisCacheRepository = new RedisCacheRepository();

// Passa o 'models' e 'Op' para os repositórios que precisam
<<<<<<< HEAD
const webhookRepository = new SequelizeWebhookRepository({ models, Op });
const webhookReprocessadoRepository = new SequelizeWebhookReprocessadoRepository({
  WebhookReprocessadoModel: models.WebhookReprocessado,
  sequelize: sequelize,
  Op: Op
});

// servicoRepository foi REMOVIDO
const reenviarWebhookController = new ReenviarWebhookController({
  // servicoRepository REMOVIDO
  webhookRepository,
  webhookReprocessadoRepository,
  httpClient,
  redisClient: redisCacheRepository 
});

router.use(authMiddleware);
router.post('/', (req, res) => reenviarWebhookController.handle(req, res));

export default router;
=======
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
>>>>>>> ac74577e24c01cb6576b44326ef20c19e70cd838
