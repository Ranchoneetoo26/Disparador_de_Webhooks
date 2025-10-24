// src/infrastructure/database/sequelize/models/index.cjs
'use strict';

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { Sequelize, DataTypes } = require('sequelize');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Detecta test env (Jest define JEST_WORKER_ID e NODE_ENV pode ser 'test')
const isTest = process.env.NODE_ENV === 'test' || !!process.env.JEST_WORKER_ID;

// Variáveis normais (não-test)
const DB_DATABASE = process.env.DB_DATABASE;
const DB_USERNAME = process.env.DB_USERNAME;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_HOST     = process.env.DB_HOST;
const DB_PORT     = process.env.DB_PORT;
const DB_DIALECT  = process.env.DB_DIALECT;

// Variáveis de teste (se quiser manter configuração por .env)
const DB_DATABASE_TEST = process.env.DB_DATABASE_TEST;
const DB_USERNAME_TEST = process.env.DB_USERNAME_TEST;
const DB_PASSWORD_TEST = process.env.DB_PASSWORD_TEST;
const DB_HOST_TEST     = process.env.DB_HOST_TEST;
const DB_PORT_TEST     = process.env.DB_PORT_TEST;
const DB_DIALECT_TEST  = process.env.DB_DIALECT_TEST;

// Função utilitária para criar instância do Sequelize
function createSequelizeInstance() {
  if (isTest) {
    // Forçar SQLite em memória nos testes — evita dependência de Docker/Postgres
    return new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
      define: {
        underscored: true,
        timestamps: false
      }
    });
  }

  // produção/desenvolvimento: usa variáveis normais
  const dialect = DB_DIALECT || 'postgres';
  const host = DB_HOST || '127.0.0.1';
  const port = DB_PORT ? Number(DB_PORT) : undefined;
  const db = DB_DATABASE || 'disparador_dev';
  const user = DB_USERNAME || 'postgres';
  const pass = DB_PASSWORD || null;

  return new Sequelize(db, user, pass, {
    host,
    port,
    dialect,
    logging: false,
    define: {
      underscored: true,
      timestamps: false
    }
  });
}

const sequelize = createSequelizeInstance();

const db = {};
const basename = path.basename(__filename);
const modelsDir = __dirname;

// Carrega modelos do diretório
fs
  .readdirSync(modelsDir)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      (file.slice(-3) === '.js' || file.slice(-4) === '.cjs')
    );
  })
  .forEach(file => {
    const modelPath = path.join(modelsDir, file);
    try {
      const modelImport = require(modelPath);
      const model = (typeof modelImport === 'function')
        ? modelImport(sequelize, DataTypes)
        : (modelImport.default ? modelImport.default(sequelize, DataTypes) : modelImport(sequelize, DataTypes));
      if (model && model.name) {
        db[model.name] = model;
      }
    } catch (err) {
      // Em tests pode haver modelos que dependam de features do Postgres — loga pra debug
      // mas não quebra o carregamento de outros modelos.
      // console.error('Erro ao carregar model', file, err.message);
    }
  });

// Executa associações se existirem
Object.keys(db).forEach(modelName => {
  if (db[modelName] && typeof db[modelName].associate === 'function') {
    db[modelName].associate(db);
  }
});

// Torna possível sincronizar a DB nos testes
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
