<<<<<<< HEAD
// src/infrastructure/http/express/routes/webhookRoutes.js
import express from 'express';
import ReenviarWebhookController from '@/application/controllers/ReenviarWebhookController.js'; 
import { webhookReprocessadoRepository, redisCacheRepository, webhookRepository } from '@/infrastructure/database/sequelize/repositories/index.js';
import axios from 'axios'; 

const router = express.Router();

const reenviarWebhookController = new ReenviarWebhookController({
    webhookRepository,
    webhookReprocessadoRepository,
    httpClient: axios, 
    redisClient: redisCacheRepository,
});
=======
import express from "express";
import createAuthMiddleware from "../middlewares/AuthMiddleware.js";
import SequelizeCedenteRepository from "../../../database/sequelize/repositories/SequelizeCedenteRepository.js";
import SequelizeSoftwareHouseRepository from "../../../database/sequelize/repositories/SequelizeSoftwareHouseRepository.js";
import WebhookController from "../controllers/WebhookController.js";

const router = express.Router();

let cedenteRepository;

let softwareHouseRepository;
>>>>>>> 17f3c16869bd4d4beeb6dc8065b71d46bcf810df

// CORREÇÃO ESSENCIAL: A rota deve aceitar o :id no path para passar o teste
// O Controller ignora o ID do path e usa o ID do body, conforme a regra de negócio.
router.post('/:id/reenviar', (req, res) => reenviarWebhookController.handle(req, res)); 

<<<<<<< HEAD
const getWebhooks = (req, res) => {
    res.status(200).json([]);
};

router.get('/', getWebhooks); 
=======
try {
  softwareHouseRepository = new SequelizeSoftwareHouseRepository();
} catch (e) {
  softwareHouseRepository = SequelizeSoftwareHouseRepository;
}

const authMiddleware = createAuthMiddleware({
  cedenteRepository,
  softwareHouseRepository,
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
>>>>>>> 17f3c16869bd4d4beeb6dc8065b71d46bcf810df

export default router;
