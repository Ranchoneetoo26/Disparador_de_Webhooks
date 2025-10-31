// src/infrastructure/database/sequelize/models/index.cjs
'use strict';

require("dotenv").config();
const SequelizeModule = require("sequelize");
const Sequelize = SequelizeModule.Sequelize;
const path = require("path");

const env = process.env.NODE_ENV || "development";

// Carrega a configuração do config.cjs (que sabemos que está correta)
const configPath = path.resolve(__dirname, '..', 'config', 'config.cjs');
const config = require(configPath)[env];

if (!config) {
  console.error(`[index.cjs] FATAL: Configuração de DB para o ambiente "${env}" não encontrada em config.cjs`);
  process.exit(1);
}

// Log para depuração
console.log(`[index.cjs] Conectando ao DB: Dialect=${config.dialect}, Host=${config.host}, DB=${config.database}`);

// 4. Cria a instância do Sequelize
const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  port: config.port,
  dialect: config.dialect,
  dialectModule: require('pg'), // Garante que está usando 'pg'
  logging: console.log, // <-- NOVO: Habilita o log de queries no terminal
  define: {
    timestamps: true,
    underscored: true,
  },
});

const models = {};

try {
  // O seu loader de models original
  const Cedente = require("./CedenteModel.cjs")(sequelize, SequelizeModule.DataTypes);
  const SoftwareHouse = require("./SoftwareHouseModel.cjs")(sequelize, SequelizeModule.DataTypes);
  const Conta = require("./ContaModel.cjs")(sequelize, SequelizeModule.DataTypes);
  const Convenio = require("./ConvenioModel.cjs")(sequelize, SequelizeModule.DataTypes);
  const WebhookModel = require("./WebhookModel.cjs")(sequelize, SequelizeModule.DataTypes);
  const WebhookReprocessado = require("./WebhookReprocessadoModel.cjs")(sequelize, SequelizeModule.DataTypes);
  
  // Adiciona o model de Servico que faltava
  const Servico = require("./ServicoModel.cjs")(sequelize, SequelizeModule.DataTypes);

  models.WebhookReprocessado = WebhookReprocessado;
  models.WebhookModel = WebhookModel;
  models.Convenio = Convenio;
  models.Conta = Conta;
  models.Cedente = Cedente;
  models.SoftwareHouse = SoftwareHouse;
  models.Servico = Servico; // Adicionado

} catch (err) {
  console.error(
    "ERRO ao carregar Models no index.cjs:",
    err.message
  );
}

<<<<<<< HEAD
=======
// Associa os models (isso é crucial!)
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    console.log(`[index.cjs] Associando model: ${modelName}`);
    models[modelName].associate(models);
  }
});

>>>>>>> 651ab5fbc86e1d21442262c94bdcb06b44117687
module.exports = { sequelize, Sequelize, models };