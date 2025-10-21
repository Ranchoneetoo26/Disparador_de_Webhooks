import db from '../models/index.cjs';
import SequelizeWebhookReprocessadoRepository from './SequelizeWebhookReprocessadoRepository.js';
import RedisCacheRepository from '../../../cache/redis/RedisCacheRepository.js';

const webhookReprocessadoRepository = new SequelizeWebhookReprocessadoRepository({
    WebhookReprocessadoModel: db.WebhookReprocessado
});

const redisCacheRepository = new RedisCacheRepository(/* { client: redisClient } */); // Ajuste a inicialização se necessário

export {
    webhookReprocessadoRepository,
    redisCacheRepository
};