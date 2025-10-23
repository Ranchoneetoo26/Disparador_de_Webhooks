// src/infrastructure/http/express/routes/reenvioRoutes.js
import express from 'express';
import { criarReprocessamento } from '../controllers/ReenvioController.js';
import { validateReenvio } from '../validationSchemas/reenvioSchema.js';
import createAuthMiddleware from '../middlewares/AuthMiddleware.js'; // <<< Importa a função factory

// <<< Importa os repositórios necessários para o AuthMiddleware >>>
import { cedenteRepository, softwareHouseRepository } from '../../../database/sequelize/repositories/index.js'; // Ajuste o caminho

const router = express.Router();

// <<< Instancia o AuthMiddleware passando as dependências >>>
const authMiddleware = createAuthMiddleware({ cedenteRepository, softwareHouseRepository });

// Aplica Auth, depois Validação, depois chama o Controller
router.post('/', authMiddleware, validateReenvio, criarReprocessamento); // <<< authMiddleware DESCOMENTADO

export default router;