'use strict';

import express from 'express';
import fs from 'fs';
import yaml from 'js-yaml';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';

import webhookRouter from './infrastructure/http/express/routes/webhookRoutes.js';
import protocoloRouter from './infrastructure/http/express/routes/protocoloRoutes.js';

const app = express();

app.use(cors());

app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({ message: 'API is running' });
});

app.use('/webhooks', webhookRouter);
app.use('/protocolo', protocoloRouter);

try {
  const swaggerDocument = yaml.load(
    fs.readFileSync('./docs/swagger.yml', 'utf8')
  );
  app.use('/wb-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (e) {
  console.error('Failed to load swagger.yml file:', e);
}

app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
  console.error('[Erro na Aplicação]:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

console.log('--- app.js: Fim da configuração ---');
export default app;