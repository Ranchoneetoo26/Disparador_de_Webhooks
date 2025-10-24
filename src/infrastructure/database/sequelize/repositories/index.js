import { models } from "../models/index.cjs";
import SequelizeWebhookReprocessadoRepository from "./SequelizeWebhookReprocessadoRepository.js";
import RedisCacheRepository from "../../../cache/redis/RedisCacheRepository.js";

const webhookReprocessadoRepository =
  new SequelizeWebhookReprocessadoRepository({
    WebhookReprocessadoModel: models.WebhookReprocessado,
  });

const redisCacheRepository = new RedisCacheRepository();

export { webhookReprocessadoRepository, redisCacheRepository };
