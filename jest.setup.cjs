try {

  require('dotenv').config({ path: './.env' }); 

  require('dotenv').config({ path: './.env.test', override: true });
} catch (err) { 
}

try {
  const dbModule = require('./src/infrastructure/database/sequelize/models/index.cjs');
  
  const db = dbModule.default || dbModule;

  console.log("--- DEBUG START ---");
  console.log("DB Loaded:", !!db);
  if (db) {
    console.log("Webhook in DB:", !!db.Webhook);
    console.log("Webhook Name:", db.Webhook ? db.Webhook.name : 'N/A');
    console.log("DB Keys:", Object.keys(db).filter(key => key.length > 3));
  }
  console.log("--- DEBUG END ---");

  global.db = db;

  Object.keys(db).forEach(key => {
    if (db[key] && db[key].name && typeof db[key] === 'function') {
      global[db[key].name] = db[key];
    }
  });

} catch (err) {
  console.error("ERRO FATAL ao carregar Models no jest.setup.cjs:", err.message);
}

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
  }
}

async function tryCloseSequelize() {
  try {
    const db = global.db || require('./src/infrastructure/database/sequelize/models/index.cjs');
    const sequelize = db?.sequelize;

    if (sequelize && typeof sequelize.close === 'function') {
      await sequelize.close();
    }
  } catch (err) {

  }
}

afterAll(async () => {
  try {
    await tryCloseServer();
  } catch (err) {
  }

  try {
    await tryCloseSequelize();
  } catch (err) {
  }

  if (typeof globalThis !== 'undefined' && typeof globalThis.jest !== 'undefined' && typeof globalThis.jest.useRealTimers === 'function') {
    globalThis.jest.useRealTimers();
  }
});