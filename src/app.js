// src/app.js

import express from 'express';
// Seus arquivos de rota serão importados aqui. Exemplo:
// import webhookRoutes from './infrastructure/web/routes/webhookRoutes';

const app = express();

// Middlewares essenciais
app.use(express.json());

// Rota de teste para garantir que o servidor responde
app.get('/', (req, res) => {
  res.status(200).json({ message: 'API is running' });
});

// Suas rotas principais seriam adicionadas aqui
// app.use('/api', webhookRoutes);

// A linha mais importante de todas:
// Exporta a instância do app como o padrão do módulo.
export default app;