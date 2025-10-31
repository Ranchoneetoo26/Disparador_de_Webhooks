'use strict';

require("dotenv").config();
const SequelizeModule = require("sequelize");
const Sequelize = SequelizeModule.Sequelize;
const path = require("path");

const env = process.env.NODE_ENV || "development";

const configPath = path.resolve(__dirname, '..', 'config', 'config.cjs');
const config = require(configPath)[env];

if (!config) {
  console.error(`[index.cjs] FATAL: Configuração de DB para o ambiente "${env}" não encontrada em config.cjs`);
  process.exit(1);
}

console.log(`[index.cjs] Conectando ao DB: Dialect=${config.dialect}, Host=${config.host}, DB=${config.database}`);

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  port: config.port,
  dialect: config.dialect,
  dialectModule: require('pg'),
  logging: console.log, 
  define: {
    timestamps: true,
    underscored: true,
  },
});

const models = {};

try {
  const Cedente = require("./CedenteModel.cjs")(sequelize, SequelizeModule.DataTypes);
  const SoftwareHouse = require("./SoftwareHouseModel.cjs")(sequelize, SequelizeModule.DataTypes);
  const Conta = require("./ContaModel.cjs")(sequelize, SequelizeModule.DataTypes);
  const Convenio = require("./ConvenioModel.cjs")(sequelize, SequelizeModule.DataTypes);
  const WebhookModel = require("./WebhookModel.cjs")(sequelize, SequelizeModule.DataTypes);
  const WebhookReprocessado = require("./WebhookReprocessadoModel.cjs")(sequelize, SequelizeModule.DataTypes);
  
  const Servico = require("./ServicoModel.cjs")(sequelize, SequelizeModule.DataTypes);

  models.WebhookReprocessado = WebhookReprocessado;
  models.WebhookModel = WebhookModel;
  models.Convenio = Convenio;
  models.Conta = Conta;
  models.Cedente = Cedente;
  models.SoftwareHouse = SoftwareHouse;
  models.Servico = Servico;

} catch (err) {
  console.error(
    "ERRO ao carregar Models no index.cjs:",
    err.message
  );
}

Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    console.log(`[index.cjs] Associando model: ${modelName}`);
    models[modelName].associate(models);
  }
});

module.exports = { sequelize, Sequelize, models };