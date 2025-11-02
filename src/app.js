<<<<<<< HEAD

=======
>>>>>>> 147c0084fb6ff328823fc70425debc9e25fd26ed
'use strict';

import express from 'express';
import fs from 'fs';
import yaml from 'js-yaml';
import swaggerUi from 'swagger-ui-express';
<<<<<<< HEAD
import cors from 'cors'; 
=======
import cors from 'cors';
>>>>>>> 147c0084fb6ff328823fc70425debc9e25fd26ed

import webhookRouter from './infrastructure/http/express/routes/webhookRoutes.js';
import protocoloRouter from './infrastructure/http/express/routes/protocoloRoutes.js';

const app = express();

<<<<<<< HEAD

app.use(cors()); 

=======
app.use(cors());

>>>>>>> 147c0084fb6ff328823fc70425debc9e25fd26ed
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({ message: 'API is running' });
});

<<<<<<< HEAD

app.use('/webhooks', webhookRouter);
app.use('/protocolo', protocoloRouter);



=======
app.use('/webhooks', webhookRouter);
app.use('/protocolo', protocoloRouter);

>>>>>>> 147c0084fb6ff328823fc70425debc9e25fd26ed
try {
  const swaggerDocument = yaml.load(
    fs.readFileSync('./docs/swagger.yml', 'utf8')
  );
  app.use('/wb-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (e) {
  console.error('Failed to load swagger.yml file:', e);
}

<<<<<<< HEAD

=======
>>>>>>> 147c0084fb6ff328823fc70425debc9e25fd26ed
app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

<<<<<<< HEAD
console.log("--- app.js: Fim da configuração ---");
=======
app.use((err, req, res, next) => {
  console.error('[Erro na Aplicação]:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

console.log('--- app.js: Fim da configuração ---');
>>>>>>> 147c0084fb6ff328823fc70425debc9e25fd26ed
export default app;