'use strict';

import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// MANTEMOS OS OUTROS COMENTADOS POR ENQUANTO
// import CedenteModel from './CedenteModel.js';
// import ContaModel from './ContaModel.js';
// import ConvenioModel from './ConvenioModel.js';
import SoftwareHouseModel from './SoftwareHouseModel.js';

const db = {};

// AQUI ESTÁ A CORREÇÃO: Colocamos os parâmetros de volta
const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    dialect: process.env.DB_DIALECT, // Esta era a informação que faltava
    logging: false,
  }
);

const models = {
  // MANTEMOS OS OUTROS COMENTADOS POR ENQUANTO
  // Cedente: CedenteModel(sequelize, DataTypes),
  // Conta: ContaModel(sequelize, DataTypes),
  // Convenio: ConvenioModel(sequelize, DataTypes),
  SoftwareHouse: SoftwareHouseModel(sequelize, DataTypes),
};

// O resto do arquivo continua igual...
Object.values(models).forEach(model => {
  db[model.name] = model;
  if (model.associate) {
    model.associate(models);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;