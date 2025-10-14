// jest.setup.cjs

// Carrega .env cedo
try {
  // O require deve funcionar corretamente agora que o arquivo é .cjs
  require('dotenv').config({ path: './.env' });
} catch (err) { }

// ==========================================================
// >>> CORREÇÃO: CARREGAMENTO E EXPOSIÇÃO DOS MODELS <<<
// Inclui logs para diagnosticar o erro "undefined (reading 'create')"
// ==========================================================
try {
  // 1. Carrega o objeto de banco de dados (que contém todos os Models)
  const dbModule = require('./src/infrastructure/database/sequelize/models/index.cjs');

  // 2. Acessa o objeto 'db' exportado (dbModule.default ou dbModule)
  const db = dbModule.default || dbModule;

  // --- LOGS DE DIAGNÓSTICO ---
  console.log("--- DEBUG START ---");
  console.log("DB Loaded:", !!db);
  if (db) {
    // Verificamos se 'Webhook' existe no objeto 'db'
    console.log("Webhook in DB:", !!db.Webhook);
    // Imprimimos o nome do Model para garantir que o objeto seja válido
    console.log("Webhook Name:", db.Webhook ? db.Webhook.name : 'N/A');
    // Imprimimos as chaves principais para ver todos os Models carregados
    console.log("DB Keys:", Object.keys(db).filter(key => key.length > 3));
  }
  console.log("--- DEBUG END ---");
  // --- FIM DOS LOGS DE DIAGNÓSTICO ---

  // 3. Torna o objeto 'db' e os Models individualmente acessíveis globalmente
  global.db = db;

  // 4. Itera sobre o objeto db para expor todos os Models
  Object.keys(db).forEach(key => {
    // Verifica se é um Model do Sequelize (um objeto com um nome definido e que é uma função/classe)
    if (db[key] && db[key].name && typeof db[key] === 'function') {
      // Ex: global.Webhook = db.Webhook
      global[db[key].name] = db[key];
    }
  });

} catch (err) {
  // Se houver um erro de carregamento (ex: falha de conexão), isso será capturado aqui
  console.error("ERRO FATAL ao carregar Models no jest.setup.cjs:", err.message);
}
// ==========================================================
// >>> FIM DA CORREÇÃO DE CARREGAMENTO <<<
// ==========================================================

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
    // Nota: O require aqui pode falhar se o Jest já tiver destruído o ambiente, 
    // mas a variável global deve resolver.
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