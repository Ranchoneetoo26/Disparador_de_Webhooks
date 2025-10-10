'use strict';

import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

import CedenteModel from './CedenteModel.js';
import ContaModel from './ContaModel.js';
import ConvenioModel from './ConvenioModel.js';
import SoftwareHouseModel from './SoftwareHouseModel.js';

const db = {};


const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    dialect: process.env.DB_DIALECT,
    logging: false,
  }
);

const models = {

  Cedente: CedenteModel(sequelize, DataTypes),
  Conta: ContaModel(sequelize, DataTypes),
  Convenio: ConvenioModel(sequelize, DataTypes),
  SoftwareHouse: SoftwareHouseModel(sequelize, DataTypes),

};

Object.values(models).forEach(model => {
  db[model.name] = model;
  if (model.associate) {
    model.associate(models);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;