// src/infrastructure/database/sequelize/models/index.js
'use strict';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { Sequelize } from 'sequelize';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

// --- Config Sequelize (ajuste conforme necessário) ---
const config = {
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
  database: process.env.DB_NAME || 'your_db',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres',
  logging: false,
};

// --- Exports nomeados pré-declarados (para que `import * as db from '@database'` funcione) ---
export let sequelize;
export let SequelizeLib;
export let Cedente;
export let Conta;
export let Convenio;
export let SoftwareHouse;

// --- Instancia Sequelize (exporta a conexão) ---
sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: config.logging,
  }
);

SequelizeLib = Sequelize;

// objeto onde iremos guardar os models
const db = { sequelize, Sequelize: SequelizeLib };

// --- Carregar todos os arquivos de models da pasta (suporta .js ESM e .cjs CommonJS) ---
const files = fs.readdirSync(__dirname).filter((file) => {
  const isSelf = file === path.basename(__filename);
  const isModel = /\.(js|cjs)$/.test(file);
  return !isSelf && isModel;
});

for (const file of files) {
  const fullPath = path.join(__dirname, file);
  let mod;
  try {
    if (file.endsWith('.cjs')) {
      // CommonJS model — mantenha module.exports = (sequelize, DataTypes) => { ... }
      mod = require(fullPath);
    } else if (file.endsWith('.js')) {
      // ESM model — mantenha export default (sequelize, DataTypes) => { ... }
      mod = (await import(fullPath));
      // import retorna namespace; factories ESM normalmente em .default
      mod = mod?.default ?? mod;
    } else {
      continue;
    }

    // mod pode ser a factory (função) ou um objeto. Suporta factories padrão.
    const factory = typeof mod === 'function' ? mod : (mod?.default ?? mod);
    if (typeof factory !== 'function') {
      // pula arquivos que não exportam uma factory
      continue;
    }

    const model = factory(sequelize, Sequelize.DataTypes);

    // nome do model (preferir model.name; fallback para basename do arquivo)
    const name = model?.name || path.basename(file).replace(/\.(cjs|js)$/, '');

    db[name] = model;

    // atribui aos named exports conhecidos (para compatibilidade com seus testes)
    switch (name) {
      case 'Cedente':
        Cedente = model;
        break;
      case 'Conta':
        Conta = model;
        break;
      case 'Convenio':
        Convenio = model;
        break;
      case 'SoftwareHouse':
        SoftwareHouse = model;
        break;
      default:
        // se tiver outros models, eles ficarão em db[name]
        break;
    }
  } catch (err) {
    // não falha silenciosamente — lança pra você ver o problema
    // (pode comentar essa linha se preferir ignorar erros de arquivos específicos)
    throw new Error(`Erro ao carregar model "${file}": ${err.message}`);
  }
}

// registrar associações, se existirem
Object.keys(db).forEach((modelName) => {
  const model = db[modelName];
  if (model && typeof model.associate === 'function') {
    model.associate(db);
  }
});

// export default para compatibilidade
export default db;
