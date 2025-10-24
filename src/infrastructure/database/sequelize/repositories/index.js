<<<<<<< HEAD
import softwareHouseRepository from './SequelizeSoftwareHouseRepository.js';
import cedenteRepository from './SequelizeCedenteRepository.js';
import contaRepository from './SequelizeContaRepository.js';           // <<< ADICIONE
import convenioRepository from './SequelizeConvenioRepository.js';       // <<< ADICIONE
import servicoRepository from './SequelizeServicoRepository.js';
import webhookReprocessadoRepository from './SequelizeWebhookReprocessadoRepository.js';
import redisCacheRepository from '../../../cache/redis/RedisCacheRepository.js';m
=======
import { models } from "../models/index.cjs";
import SequelizeWebhookReprocessadoRepository from "./SequelizeWebhookReprocessadoRepository.js";
import RedisCacheRepository from "../../../cache/redis/RedisCacheRepository.js";
>>>>>>> e8eb97ff05622b90f384c5fbc829e82218ca52c7

const webhookReprocessadoRepository =
  new SequelizeWebhookReprocessadoRepository({
    WebhookReprocessadoModel: models.WebhookReprocessado,
  });

const redisCacheRepository = new RedisCacheRepository();

<<<<<<< HEAD
export {
    softwareHouseRepository,
    cedenteRepository,
    contaRepository,           // <<< ADICIONE
    convenioRepository,       // <<< ADICIONE
    servicoRepository,
    webhookReprocessadoRepository,
    redisCacheRepository
};
=======
export { webhookReprocessadoRepository, redisCacheRepository };
>>>>>>> e8eb97ff05622b90f384c5fbc829e82218ca52c7
