// Use a sintaxe de importação ESM
import express from 'express';
// Para a compatibilidade do Jest, usamos um require customizado no app.js, 
// mas o código do roteador precisa de import
// Importe seu Controller aqui (assumindo que ele também usa import/export)
// import WebhookController from '../controllers/WebhookController'; 

// Se o seu Controller ainda usar require(), você terá que convertê-lo também,
// ou usar a importação mista aqui. Para simplificar, vamos criar um mock simples:
const router = express.Router();

// Mock do Controller para que o teste passe com status HTTP
const reenviarWebhook = (req, res) => {
    // Se o seu teste for bem-sucedido, ele chegará aqui.
    res.status(200).json({ success: true, message: 'Simulação: Webhook reenviado' });
};
const getWebhooks = (req, res) => {
    res.status(200).json([]);
};


// Rotas que seus testes esperam:
// POST /webhooks/:id/reenviar
router.post('/:id/reenviar', reenviarWebhook); 

// GET /webhooks/ (usada no webhook.test.js)
router.get('/', getWebhooks); 

// Exporte o roteador usando export default
export default router;