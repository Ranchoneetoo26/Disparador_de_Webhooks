import express from 'express';

const router = express.Router();

const reenviarWebhook = (req, res) => {
    
    res.status(200).json({ success: true, message: 'Simulação: Webhook reenviado' });
};
const getWebhooks = (req, res) => {
    res.status(200).json([]);
};


router.post('/:id/reenviar', reenviarWebhook); 

router.get('/', getWebhooks); 

export default router;