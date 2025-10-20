import express from 'express';
import * as webhookRouterModule from './infrastructure/http/express/routes/webhookRoutes';
import ReenviarWebhookController from './controllers/ReenviarWebhookController.js';
import { webhookRepository, webhookReprocessadoRepository } from './infra/repositories/index.js';
import { httpClient, redisClient } from './infra/config/index.js';
 
const app = express();

const webhookRouter = webhookRouterModule.default || webhookRouterModule; 


app.use(express.json());


app.get('/', (req, res) => {
  res.status(200).json({ message: 'API is running' });
});

app.use('/webhooks', webhookRouter);


const reenviarController = new ReenviarWebhookController({
  webhookRepository,
  webhookReprocessadoRepository,
  httpClient,
  redisClient,
});

app.post('/reenviar', (req, res) => reenviarController.handle(req, res));


app.use((req, res, next) => {
    res.status(404).json({ error: 'Webhook not found' });
});
 
export default app;