import express from 'express';
import * as webhookRouterModule from './infrastructure/http/express/routes/webhookRoutes';

const app = express();
const webhookRouter = webhookRouterModule.default || webhookRouterModule;

app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({ message: 'API is running' });
});

app.use('/webhooks', webhookRouter);

app.use((req, res, next) => {
  res.status(404).json({ error: 'Webhook not found' });
});

export default app;