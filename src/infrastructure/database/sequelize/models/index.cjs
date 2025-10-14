'use strict';

const { Sequelize, DataTypes } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

// Carregamento dos Models existentes
const CedenteModel = require('./CedenteModel.cjs').default || require('./CedenteModel.cjs');
const ContaModel = require('./ContaModel.cjs').default || require('./ContaModel.cjs');
const ConvenioModel = require('./ConvenioModel.cjs').default || require('./ConvenioModel.cjs');
const SoftwareHouseModel = require('./SoftwareHouseModel.cjs').default || require('./SoftwareHouseModel.cjs')

// >>> NOVAS LINHAS: Adição dos modelos Webhook <<<
const WebhookModel = require('./WebhookModel.cjs').default || require('./WebhookModel.cjs');
const WebhookReprocessadoModel = require('./WebhookReprocessadoModel.cjs').default || require('./WebhookReprocessadoModel.cjs');
// >>> FIM DAS NOVAS LINHAS <<<

const db = {};

// =========================================================================
// Lógica para selecionar o ambiente (TESTE ou DESENVOLVIMENTO)
// =========================================================================

const isTest = process.env.NODE_ENV === 'test';

// Seleciona a variável correta (TEST se isTest é true, caso contrário, DEV)
const DB_HOST = isTest ? process.env.DB_HOST_TEST : process.env.DB_HOST;
const DB_USERNAME = isTest ? process.env.DB_USERNAME_TEST : process.env.DB_USERNAME;
const DB_PASSWORD = isTest ? process.env.DB_PASSWORD_TEST : process.env.DB_PASSWORD;
const DB_DATABASE = isTest ? process.env.DB_DATABASE_TEST : process.env.DB_DATABASE;
const DB_PORT = isTest ? process.env.DB_PORT_TEST : process.env.DB_PORT;
const DB_DIALECT = isTest ? process.env.DB_DIALECT_TEST : process.env.DB_DIALECT;

const sequelize = new Sequelize(
  // Agora usamos as variáveis definidas acima
  DB_DATABASE,
  DB_USERNAME,
  DB_PASSWORD,
  {
    host: DB_HOST,
    port: parseInt(DB_PORT, 10),
    dialect: DB_DIALECT,
    logging: false,
  }
);
const models = {

  Cedente: CedenteModel(sequelize, DataTypes),
  Conta: ContaModel(sequelize, DataTypes),
  Convenio: ConvenioModel(sequelize, DataTypes),
  SoftwareHouse: SoftwareHouseModel(sequelize, DataTypes),

  // >>> NOVAS LINHAS: Adição dos modelos ao objeto 'models' <<<
  Webhook: WebhookModel(sequelize, DataTypes),
  WebhookReprocessado: WebhookReprocessadoModel(sequelize, DataTypes),
  // >>> FIM DAS NOVAS LINHAS <<<

};

Object.values(models).forEach(model => {
  db[model.name] = model;
  if (model.associate) {
    model.associate(models);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = db;
  module.exports.default = db;
}