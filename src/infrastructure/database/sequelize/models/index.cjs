require("dotenv").config();

const SequelizeModule = require("sequelize");
const Sequelize = SequelizeModule.Sequelize;
const path = require("path");

var isTest = process.env.NODE_ENV === "test";

var DB_DIALECT = isTest
  ? process.env.DB_DIALECT_TEST || "sqlite"
  : process.env.DB_DIALECT || "sqlite";
var DB_STORAGE = process.env.DB_STORAGE || ":memory:";
var DB_HOST = process.env.DB_HOST || "localhost";
var DB_DATABASE = process.env.DB_DATABASE || "disparador";
var DB_USERNAME = process.env.DB_USERNAME || "root";
var DB_PASSWORD = process.env.DB_PASSWORD || null;

const sequelize = new Sequelize(DB_DATABASE, DB_USERNAME, DB_PASSWORD, {
  host: DB_HOST,
  dialect: DB_DIALECT,
  storage: DB_STORAGE,
  logging: false,
  port: process.env.DB_PORT || 5432,
});

const models = {};

try {
  const Cedente = require("./CedenteModel.cjs")(
    sequelize,
    SequelizeModule.DataTypes
  );
  const SoftwareHouse = require("./SoftwareHouseModel.cjs")(
    sequelize,
    SequelizeModule.DataTypes
  );
  const Conta = require("./ContaModel.cjs")(
    sequelize,
    SequelizeModule.DataTypes
  );
  const Convenio = require("./ConvenioModel.cjs")(
    sequelize,
    SequelizeModule.DataTypes
  );
  const WebhookModel = require("./WebhookModel.cjs")(
    sequelize,
    SequelizeModule.DataTypes
  );
  const WebhookReprocessado = require("./WebhookReprocessadoModel.cjs")(
    sequelize,
    SequelizeModule.DataTypes
  );

  models.WebhookReprocessado = WebhookReprocessado;
  models.WebhookModel = WebhookModel;
  models.Convenio = Convenio;
  models.Conta = Conta;
  models.Cedente = Cedente;
  models.SoftwareHouse = SoftwareHouse;
} catch (err) {
  console.warn(
    "Aviso: nenhum model foi carregado automaticamente. Isso é esperado em ambiente de teste."
  );
}

module.exports = { sequelize, Sequelize, models };