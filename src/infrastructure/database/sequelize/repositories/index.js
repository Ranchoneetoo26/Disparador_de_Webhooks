
import db from '../models/index.cjs';
import SequelizeWebhookReprocessadoRepository from './SequelizeWebhookReprocessadoRepository.js';
import RedisCacheRepository from '../../../cache/redis/RedisCacheRepository.js';
import SequelizeWebhookRepository from './SequelizeWebhookRepository.js';

const webhookReprocessadoRepository = new SequelizeWebhookReprocessadoRepository({
  WebhookReprocessadoModel: db.WebhookReprocessado,
});

const redisCacheRepository = new RedisCacheRepository();

const webhookRepository = new SequelizeWebhookRepository({
  WebhookModel: db.Webhook,
});

export {
  webhookReprocessadoRepository,
  redisCacheRepository,
  webhookRepository,
};

import db from "../models/index.cjs";
import SequelizeWebhookReprocessadoRepository from "./SequelizeWebhookReprocessadoRepository.js";
import RedisCacheRepository from "../../../cache/redis/RedisCacheRepository.js";

const webhookReprocessadoRepository =
  new SequelizeWebhookReprocessadoRepository({
    WebhookReprocessadoModel: db.WebhookReprocessado,
  });

const redisCacheRepository = new RedisCacheRepository();

export { webhookReprocessadoRepository, redisCacheRepository };
b302d08cdf7713c3053e14c47532d6617a79da1c
