import express from 'express';
import * as webhookRouterModule from './infrastructure/http/express/routes/webhookRoutes';

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