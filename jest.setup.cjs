try {
  require('dotenv').config({ path: './.env' });
} catch (err) { }

try {
  // Carrega models do Sequelize
  const dbModule = require('./src/infrastructure/database/sequelize/models/index.cjs');

  // Suporta exports default ou module.exports
  const db = dbModule.default || dbModule;

  // Logs de diagnóstico (útil para manter)
  console.log("--- DEBUG START ---");
  console.log("DB Loaded:", !!db);
  if (db) {
    console.log("Webhook in DB:", !!db.Webhook);
    console.log("Webhook Name:", db.Webhook ? db.Webhook.name : 'N/A');
    console.log("DB Keys:", Object.keys(db).filter(key => key.length > 3));
  }
  console.log("--- DEBUG END ---");

  // Torna 'db' e seus Models acessíveis globalmente
  global.db = db;

  // Expõe individualmente cada Model (ex: global.User, global.Webhook)
  Object.keys(db).forEach(key => {
    // Filtra e expõe apenas os Models válidos (funções com nome)
    if (db[key] && db[key].name && typeof db[key] === 'function') {
      global[db[key].name] = db[key];
    }
  });

} catch (err) {
  console.error("ERRO FATAL ao carregar Models no jest.setup.cjs:", err.message);
}

// Try/close server
async function tryCloseServer() {
  try {
    const appModule = require('./src/app');
    const server = appModule.server || appModule.default?.server || appModule;
    if (server && typeof server.close === 'function') {
      await new Promise((resolve, reject) =>
        server.close(err => (err ? reject(err) : resolve()))
      );
    }
  } catch (err) {
    // ignore if not present
  }
}

// Try/close sequelize
async function tryCloseSequelize() {
  try {
    // Tenta usar a variável global 'db', ou tenta carregar de novo para fechar a conexão
    const db = global.db || require('./src/infrastructure/database/sequelize/models/index.cjs');
    // Acessa o objeto sequelize dentro do db (que tem o método close)
    const sequelize = db?.sequelize;

    if (sequelize && typeof sequelize.close === 'function') {
      await sequelize.close();
    }
  } catch (err) {
    // ignore
  }
}

afterAll(async () => {
  try {
    await tryCloseServer();
  } catch (err) {
    // silent
  }

  try {
    await tryCloseSequelize();
  } catch (err) {
    // silent
  }

  if (typeof globalThis !== 'undefined' && typeof globalThis.jest !== 'undefined' && typeof globalThis.jest.useRealTimers === 'function') {
    globalThis.jest.useRealTimers();
  }
});