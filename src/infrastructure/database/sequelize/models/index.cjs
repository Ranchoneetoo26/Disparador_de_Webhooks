<<<<<<< HEAD
<<<<<<< HEAD

=======
>>>>>>> 147c0084fb6ff328823fc70425debc9e25fd26ed
'use strict';
=======
"use strict";
>>>>>>> d69ec169d0d39e2e3744332f34d207bd68b6f06a

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

<<<<<<< HEAD
const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  port: config.port,
  dialect: config.dialect,
<<<<<<< HEAD
  dialectModule: require('pg'), 
=======
  dialectModule: require('pg'),
>>>>>>> 147c0084fb6ff328823fc70425debc9e25fd26ed
  logging: console.log, 
  define: {
    timestamps: true,
    underscored: true,
  },
});
=======
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);
>>>>>>> d69ec169d0d39e2e3744332f34d207bd68b6f06a

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
<<<<<<< HEAD
  models.Servico = Servico; 
=======
  models.Servico = Servico;
<<<<<<< HEAD
>>>>>>> 147c0084fb6ff328823fc70425debc9e25fd26ed

=======
>>>>>>> d69ec169d0d39e2e3744332f34d207bd68b6f06a
} catch (err) {
  console.error("ERRO ao carregar Models no index.cjs:", err.message);
}

<<<<<<< HEAD
<<<<<<< HEAD
=======
Object.keys(models).forEach(modelName => {
=======
Object.keys(models).forEach((modelName) => {
>>>>>>> d69ec169d0d39e2e3744332f34d207bd68b6f06a
  if (models[modelName].associate) {
    console.log(`[index.cjs] Associando model: ${modelName}`);
    models[modelName].associate(models);
  }
});

<<<<<<< HEAD
>>>>>>> 147c0084fb6ff328823fc70425debc9e25fd26ed
module.exports = { sequelize, Sequelize, models };
=======
module.exports = { sequelize, Sequelize, models };
>>>>>>> d69ec169d0d39e2e3744332f34d207bd68b6f06a
