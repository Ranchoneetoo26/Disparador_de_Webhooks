<<<<<<< HEAD
<<<<<<< HEAD

=======
>>>>>>> 147c0084fb6ff328823fc70425debc9e25fd26ed
'use strict';
=======
"use strict";
>>>>>>> d69ec169d0d39e2e3744332f34d207bd68b6f06a

const express = require("express");
const createAuthMiddleware = require("../middlewares/AuthMiddleware.js");
const ProtocoloController = require("../controllers/ProtocoloController.js");
const ListarProtocolosUseCase = require("../../../../application/useCases/ListarProtocolosUseCase.js");
const ConsultarProtocoloUseCase = require("../../../../application/useCases/ConsultarProtocoloUseCase.js");
const SequelizeCedenteRepository = require("../../../database/sequelize/repositories/SequelizeCedenteRepository.js");
const SequelizeSoftwareHouseRepository = require("../../../database/sequelize/repositories/SequelizeSoftwareHouseRepository.js");
const SequelizeWebhookReprocessadoRepository = require("../../../database/sequelize/repositories/SequelizeWebhookReprocessadoRepository.js");

<<<<<<< HEAD
import RedisCacheRepository from '../../../cache/redis/RedisCacheRepository.js';
<<<<<<< HEAD

=======
>>>>>>> 147c0084fb6ff328823fc70425debc9e25fd26ed
=======
const redisCacheRepository =
  new (require("../../../cache/redis/RedisCacheRepository.js"))();

const {
  models,
  sequelize,
  Sequelize,
} = require("../../../database/sequelize/models/index.cjs");
>>>>>>> d69ec169d0d39e2e3744332f34d207bd68b6f06a

const router = express.Router();

const cedenteRepository = new SequelizeCedenteRepository();
const softwareHouseRepository = new SequelizeSoftwareHouseRepository();

const authMiddleware = createAuthMiddleware({
  cedenteRepository,
  softwareHouseRepository,
});

<<<<<<< HEAD
<<<<<<< HEAD
=======
const redisCacheRepository = new RedisCacheRepository();

const webhookReprocessadoRepository = new SequelizeWebhookReprocessadoRepository({
  WebhookReprocessadoModel: models.WebhookReprocessado,
  sequelize: sequelize,
  Op: Op
});
=======
const webhookReprocessadoRepository =
  new SequelizeWebhookReprocessadoRepository();
>>>>>>> d69ec169d0d39e2e3744332f34d207bd68b6f06a

const listarProtocolosUseCase = new ListarProtocolosUseCase({
  webhookReprocessadoRepository,
  cacheRepository: redisCacheRepository,
});

const consultarProtocoloUseCase = new ConsultarProtocoloUseCase({
  webhookReprocessadoRepository,
  cacheRepository: redisCacheRepository,
});

const protocoloController = new ProtocoloController({
  listarProtocolosUseCase,
  consultarProtocoloUseCase,
});

router.use(authMiddleware);
<<<<<<< HEAD
router.get('/', (req, res) => protocoloController.listarProtocolos(req, res));
router.get('/:uuid', (req, res) => protocoloController.consultarProtocolo(req, res));
>>>>>>> 147c0084fb6ff328823fc70425debc9e25fd26ed
export default router;
=======
router.get("/", (req, res) => protocoloController.listarProtocolos(req, res));
router.get("/:uuid", (req, res) =>
  protocoloController.consultarProtocolo(req, res)
);

module.exports = router;
>>>>>>> d69ec169d0d39e2e3744332f34d207bd68b6f06a
