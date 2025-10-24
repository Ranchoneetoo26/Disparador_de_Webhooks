<<<<<<< HEAD
// src/infrastructure/database/sequelize/repositories/index.js

// 1. Importe a função 'createRequire' do módulo 'module' do Node.js
import { createRequire } from 'module';

import SequelizeWebhookReprocessadoRepository from './SequelizeWebhookReprocessadoRepository.js';
import SequelizeWebhookRepository from './SequelizeWebhookRepository.js';
import RedisCacheRepository from '../../../cache/redis/RedisCacheRepository.js';

// 2. Crie uma função 'require' local, específica para este arquivo
const require = createRequire(import.meta.url);

// 3. Use a nova função 'require' para carregar o arquivo .cjs
const db = require('../models/index.cjs');

// O resto do seu código permanece exatamente igual
const webhookReprocessadoRepository = new SequelizeWebhookReprocessadoRepository({
    WebhookReprocessadoModel: db.WebhookReprocessado
});

const webhookRepository = new SequelizeWebhookRepository({
    WebhookModel: db.Webhook
});

const redisCacheRepository = new RedisCacheRepository(/* { client: redisClient } */);

export {
    webhookReprocessadoRepository,
    redisCacheRepository,
    webhookRepository
};
=======
import { models } from "../models/index.cjs";
import SequelizeWebhookReprocessadoRepository from "./SequelizeWebhookReprocessadoRepository.js";
import RedisCacheRepository from "../../../cache/redis/RedisCacheRepository.js";

const webhookReprocessadoRepository =
  new SequelizeWebhookReprocessadoRepository({
    WebhookReprocessadoModel: models.WebhookReprocessado,
  });

const redisCacheRepository = new RedisCacheRepository();

export { webhookReprocessadoRepository, redisCacheRepository };
>>>>>>> e8eb97ff05622b90f384c5fbc829e82218ca52c7
