// src/infrastructure/database/sequelize/models/index.js
'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';

// ajuste a config para usar suas variáveis/arquivo config
const config = {
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'your_db',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres',
  logging: false,
};

const sequelize = new Sequelize(config.database, config.username, config.password, config);

const db = { sequelize, Sequelize };

// carregar model manualmente (recomendado)
db.Cedente = require(path.join(__dirname, 'CedenteModel'))(sequelize, Sequelize.DataTypes);
db.Conta = require(path.join(__dirname, 'ContaModel'))(sequelize, Sequelize.DataTypes);
db.Convenio = require(path.join(__dirname, 'ConvenioModel'))(sequelize, Sequelize.DataTypes);
db.SoftwareHouse = require(path.join(__dirname, 'SoftwareHouseModel'))(sequelize, Sequelize.DataTypes);
// ... carregue outros models conforme necessário

// executar associações (se houver)
Object.keys(db).forEach((modelName) => {
  if (db[modelName] && typeof db[modelName].associate === 'function') {
    db[modelName].associate(db);
  }
});

// Exporta cada model e a instância do sequelize.
// Assim, quando seu jest.config.mapear '@database' para esse index,
// você pode fazer: const { Cedente, sequelize } = require('@database');
module.exports = {
  ...db,           // contém Cedente, Conta, Convenio, SoftwareHouse, sequelize, Sequelize
};
