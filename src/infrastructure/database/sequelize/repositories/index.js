import { models } from "../models/index.cjs";
import SequelizeWebhookReprocessadoRepository from "./SequelizeWebhookReprocessadoRepository.js";
import RedisCacheRepository from "../../../cache/redis/RedisCacheRepository.js";

const webhookReprocessadoRepository =
  new SequelizeWebhookReprocessadoRepository({
    WebhookReprocessadoModel: models.WebhookReprocessado,
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
