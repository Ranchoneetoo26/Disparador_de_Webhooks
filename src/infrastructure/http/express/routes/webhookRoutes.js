import express from 'express';
import createAuthMiddleware from '../middlewares/AuthMiddleware.js';
// Ajuste os caminhos se necessário, baseando-me nos seus posts anteriores
import SequelizeCedenteRepository from '../../../database/sequelize/repositories/SequelizeCedenteRepository.js';
import SequelizeSoftwareHouseRepository from '../../../database/sequelize/repositories/SequelizeSoftwareHouseRepository.js';
import WebhookController from '../controllers/WebhookController.js';

const router = express.Router();

// Instanciação dos repositórios (como antes)
let cedenteRepository;
let softwareHouseRepository;
try {
  cedenteRepository = new SequelizeCedenteRepository();
} catch (e) { /* Lógica de fallback se necessário */ }
try {
  softwareHouseRepository = new SequelizeSoftwareHouseRepository();
} catch (e) { /* Lógica de fallback se necessário */ }

// Middleware de autenticação (como antes)
const authMiddleware = createAuthMiddleware({ cedenteRepository, softwareHouseRepository });
router.use(authMiddleware); // Aplica a todas as rotas abaixo

const safeHandler = (ctrl, method) => {
  // Sua função safeHandler (como antes)
  try {
    if (!ctrl) return (req, res) => res.status(204).end();
    const fn = ctrl[method] || ctrl;
    if (typeof fn === 'function') return fn.bind(ctrl);
    return (req, res) => res.status(204).end();
  } catch (error) {
    console.error('Error in safeHandler:', error);
    return (req, res) => res.status(500).json({ error: 'Internal Server Error' });
  }
};

const webhookController = new WebhookController(); // Instancia o controller

// --- CORREÇÃO DA ROTA POST ---
// A rota agora é /:id/reenviar e chama o método 'reenviar' do controller
router.post('/:id/reenviar', safeHandler(webhookController, 'reenviar'));
// ----------------------------

// A rota GET para listar continua a mesma
router.get('/', safeHandler(webhookController, 'list'));

export default router;
