import express from 'express';
// CORREÇÃO: Importa o roteador CJS como um objeto namespace
import * as webhookRouterModule from './infrastructure/http/express/routes/webhookRoutes';

// Adicionado: controller e dependências para rota /reenviar
import ReenviarWebhookController from './controllers/ReenviarWebhookController.js';
import { webhookRepository, webhookReprocessadoRepository } from './infra/repositories/index.js';
import { httpClient, redisClient } from './infra/config/index.js';
 
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

// Registra rota /reenviar sem duplicar middlewares existentes
const reenviarController = new ReenviarWebhookController({
  webhookRepository,
  webhookReprocessadoRepository,
  httpClient,
  redisClient,
});

app.post('/reenviar', (req, res) => reenviarController.handle(req, res));

// Tratamento de erros 404 para rotas não encontradas
app.use((req, res, next) => {
    res.status(404).json({ error: 'Webhook not found' });
});
 
export default app;