import express from "express";
import createAuthMiddleware from "../middlewares/AuthMiddleware.js";
import SequelizeCedenteRepository from "../../../database/sequelize/repositories/SequelizeCedenteRepository.js";
import SequelizeSoftwareHouseRepository from "../../../database/sequelize/repositories/SequelizeSoftwareHouseRepository.js";
import WebhookController from "../controllers/WebhookController.js";

const router = express.Router();

let cedenteRepository;

let softwareHouseRepository;

try {
  cedenteRepository = new SequelizeCedenteRepository();
} catch (e) {
  cedenteRepository = SequelizeCedenteRepository;
}

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

export default router;
