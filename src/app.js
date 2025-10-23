// src/app.js
import express from 'express';
import * as webhookRouterModule from './infrastructure/http/express/routes/webhookRoutes.js'; // Mantém se precisar das rotas antigas por ora
import protocoloRouter from './infrastructure/http/express/routes/protocoloRoutes.js';
import reenvioRouter from './infrastructure/http/express/routes/reenvioRoutes.js'; // <<< ADICIONADO

const app = express();

const webhookRouter = webhookRouterModule.default || webhookRouterModule;

app.use(express.json());

app.get('/', (req, res) => {
    res.status(200).json({ message: 'API is running' });
});

// Monta as rotas nos prefixos corretos
app.use('/webhooks', webhookRouter); // Mantém se necessário
app.use('/protocolo', protocoloRouter);
app.use('/reenviar', reenvioRouter); // <<< ADICIONADO: Monta as rotas de reenvio em /reenviar

// Middleware de "Not Found" - Mantém no final
app.use((req, res, next) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// TODO: Adicionar middleware global de tratamento de erros aqui (Regra 5)

export default app;