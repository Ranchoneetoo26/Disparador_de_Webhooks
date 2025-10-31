// src/app.js
'use strict';

import express from 'express';
import fs from 'fs';
import yaml from 'js-yaml';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors'; // <-- 1. NOVO IMPORT

// Importação das rotas
import webhookRouter from './infrastructure/http/express/routes/webhookRoutes.js';
import protocoloRouter from './infrastructure/http/express/routes/protocoloRoutes.js';

const app = express();

// --- Configuração dos Middlewares ---

// Habilita o CORS para todas as requisições
app.use(cors()); // <-- 2. NOVO MIDDLEWARE

// Permite que o Express leia JSON no body das requisições
app.use(express.json());

// --- Rotas Principais ---

app.get('/', (req, res) => {
  res.status(200).json({ message: 'API is running' });
});

// Rotas da aplicação
app.use('/webhooks', webhookRouter);
app.use('/protocolo', protocoloRouter);

// --- Documentação Swagger ---

try {
  const swaggerDocument = yaml.load(
    fs.readFileSync('./docs/swagger.yml', 'utf8')
  );
  app.use('/wb-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (e) {
  console.error('Failed to load swagger.yml file:', e);
}

// --- Tratamento de Erros (Fallback) ---

// Middleware para rotas não encontradas (404)
app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

<<<<<<< HEAD
console.log("--- app.js: Fim da configuração ---");
=======
// Middleware genérico de tratamento de erro (opcional, mas bom)
app.use((err, req, res, next) => { // <-- 3. MELHORIA NO TRATAMENTO DE ERRO
  console.error('[Erro na Aplicação]:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

console.log('--- app.js: Fim da configuração ---');
>>>>>>> 651ab5fbc86e1d21442262c94bdcb06b44117687
export default app;