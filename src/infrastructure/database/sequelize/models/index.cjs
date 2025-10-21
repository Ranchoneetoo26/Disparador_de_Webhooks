const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

const isTest = process.env.NODE_ENV === 'test';

const DB_DIALECT = isTest ? process.env.DB_DIALECT_TEST || 'sqlite' : process.env.DB_DIALECT || 'sqlite';
const DB_STORAGE = process.env.DB_STORAGE || ':memory:';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_DATABASE = process.env.DB_DATABASE || 'disparador';
const DB_USERNAME = process.env.DB_USERNAME || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || null;

const sequelize = new Sequelize(
  DB_DATABASE,
  DB_USERNAME,
  DB_PASSWORD,
  {
    host: DB_HOST,
    dialect: DB_DIALECT,
    storage: DB_STORAGE,
    logging: false,
  }
);

const models = {};

try {
  const Cedente = require('./Cedente.cjs');
  const SoftwareHouse = require('./SoftwareHouse.cjs');

  models.Cedente = Cedente(sequelize);
  models.SoftwareHouse = SoftwareHouse(sequelize);
} catch (err) {
  console.warn('Aviso: nenhum model foi carregado automaticamente. Isso é esperado em ambiente de teste.');
}

module.exports = {
  sequelize,
  Sequelize,
  ...models,
};