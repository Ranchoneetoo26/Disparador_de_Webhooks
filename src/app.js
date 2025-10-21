import express from 'express';
import * as webhookRouterModule from './infrastructure/http/express/routes/webhookRoutes';
<<<<<<< HEAD
import ReenviarWebhookController from './infrastructure/http/express/controllers/ReenviarWebhookController.js';
import { webhookRepository, webhookReprocessadoRepository } from './infrastructure/database/sequelize/repositories/index.js'; 
import { httpClient, redisClient } from './infrastructure/providers/index.js';

 
const app = express();
=======
>>>>>>> c0863978c9428b9f79e93829b4ccbe950281acc9

const app = express();
// Acessa o roteador. Express.Router() é exportado via module.exports,
// o que aparece como a propriedade 'default' ou diretamente o objeto em imports ESM.
const webhookRouter = webhookRouterModule.default || webhookRouterModule; 

// Middlewares essenciais
app.use(express.json());

// Rota de teste para garantir que o servidor responde
app.get('/', (req, res) => {
  res.status(200).json({ message: 'API is running' });
});

app.use('/webhooks', webhookRouter);
app.use('/protocolo', protocoloRouter);

// Tratamento de erros 404 para rotas não encontradas
app.use((req, res, next) => {
    res.status(404).json({ error: 'Endpoint not found' });
});
 
export default app;