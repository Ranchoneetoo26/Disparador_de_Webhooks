import softwareHouseRepository from './SequelizeSoftwareHouseRepository.js';
import cedenteRepository from './SequelizeCedenteRepository.js';
import contaRepository from './SequelizeContaRepository.js';           // <<< ADICIONE
import convenioRepository from './SequelizeConvenioRepository.js';       // <<< ADICIONE
import servicoRepository from './SequelizeServicoRepository.js';
import webhookReprocessadoRepository from './SequelizeWebhookReprocessadoRepository.js';
import redisCacheRepository from '../../../cache/redis/RedisCacheRepository.js';m

const webhookReprocessadoRepository = new SequelizeWebhookReprocessadoRepository({
    WebhookReprocessadoModel: db.WebhookReprocessado
});

const redisCacheRepository = new RedisCacheRepository(/* { client: redisClient } */); // Ajuste a inicialização se necessário

export {
    softwareHouseRepository,
    cedenteRepository,
    contaRepository,           // <<< ADICIONE
    convenioRepository,       // <<< ADICIONE
    servicoRepository,
    webhookReprocessadoRepository,
    redisCacheRepository
};