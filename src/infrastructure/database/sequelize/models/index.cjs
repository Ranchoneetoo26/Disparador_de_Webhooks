"use strict";

require("dotenv").config();
const SequelizeModule = require("sequelize");
const Sequelize = SequelizeModule.Sequelize;
const path = require("path");

const env = process.env.NODE_ENV || "development";

const configPath = path.resolve(__dirname, "..", "config", "config.cjs");
const config = require(configPath)[env];

if (!config) {
  console.error(
    `[index.cjs] FATAL: Configuração de DB para o ambiente "${env}" não encontrada em config.cjs`
  );
  process.exit(1);
}

console.log(
  `[index.cjs] Conectando ao DB: Dialect=${config.dialect}, Host=${config.host}, DB=${config.database}`
);

// --- CORREÇÃO AQUI ---
// Removemos as opções manuais e passamos o objeto 'config' diretamente.
// O 'config' já contém 'host', 'port', 'dialect', 'define' e 'logging: false' (do seu config.cjs).
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);
// --- FIM DA CORREÇÃO ---

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
  const WebhookReprocessado = require("./WebhookReprocessado.cjs")(
    sequelize,
    SequelizeModule.DataTypes
  );

  const Servico = require("./ServicoModel.cjs")(
    sequelize,
    SequelizeModule.DataTypes
  );

  models.WebhookReprocessado = WebhookReprocessado;
  models.Convenio = Convenio;
  models.Conta = Conta;
  models.Cedente = Cedente;
  models.SoftwareHouse = SoftwareHouse;
  models.Servico = Servico;
} catch (err) {
  console.error("ERRO ao carregar Models no index.cjs:", err.message);
}

Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    console.log(`[index.cjs] Associando model: ${modelName}`);
    models[modelName].associate(models);
  }
});

module.exports = { sequelize, Sequelize, models };
