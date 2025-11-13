"use strict";

const express = require("express");
const createAuthMiddleware = require("../../../http/express/middlewares/AuthMiddleware.js");
const ProtocoloController = require("../../../http/express/controllers/ProtocoloController.js");
const ListarProtocolosUseCase = require("../../../../application/useCases/ListarProtocolosUseCase.js");
const ConsultarProtocoloUseCase = require("../../../../application/useCases/ConsultarProtocoloUseCase.js");
const SequelizeCedenteRepository = require("../../../database/sequelize/repositories/SequelizeCedenteRepository.js");
const SequelizeSoftwareHouseRepository = require("../../../database/sequelize/repositories/SequelizeSoftwareHouseRepository.js");
const SequelizeWebhookReprocessadoRepository = require("../../../database/sequelize/repositories/SequelizeWebhookReprocessadoRepository.js");

<<<<<<< HEAD
module.exports = (sequelize, DataTypes) => {
  class WebhookReprocessado extends Model {
    static associate(models) {
      this.belongsTo(models.Cedente, { foreignKey: 'cedente_id', as: 'cedente' });
    }
  }
  WebhookReprocessado.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    data: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    data_criacao: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    cedente_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    kind: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    servico_id: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    protocolo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'WebhookReprocessado',
    tableName: 'WebhookReprocessados',
    timestamps: false
  });
  return WebhookReprocessado;
};
=======
const redisCacheRepository = require("../../../cache/redis/RedisCacheRepository.js");

const router = express.Router();

const cedenteRepository = new SequelizeCedenteRepository();
const softwareHouseRepository = new SequelizeSoftwareHouseRepository();
const authMiddleware = createAuthMiddleware({
  cedenteRepository,
  softwareHouseRepository,
});

const webhookReprocessadoRepository =
  new SequelizeWebhookReprocessadoRepository();

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
router.get("/", (req, res) => protocoloController.listarProtocolos(req, res));
router.get("/:uuid", (req, res) =>
  protocoloController.consultarProtocolo(req, res)
);
module.exports = router;
>>>>>>> 929a7ec6c858b3cadf7036896999f620d5e879bb
