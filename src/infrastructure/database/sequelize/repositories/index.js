import db from '../models/index.cjs';
import SequelizeWebhookReprocessadoRepository from './SequelizeWebhookReprocessadoRepository.js';
import SequelizeWebhookRepository from './SequelizeWebhookRepository.js'; // Novo import
import RedisCacheRepository from '../../../cache/redis/RedisCacheRepository.js';

const webhookReprocessadoRepository = new SequelizeWebhookReprocessadoRepository({
    WebhookReprocessadoModel: db.WebhookReprocessado
});

// Inicializa o novo repositório
const webhookRepository = new SequelizeWebhookRepository({
    WebhookModel: db.Webhook
});

const redisCacheRepository = new RedisCacheRepository(/* { client: redisClient } */); 

export {
    webhookReprocessadoRepository,
    redisCacheRepository,
    webhookRepository // Exporta o novo repositório
};