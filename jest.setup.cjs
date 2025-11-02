'use strict';

// Carrega o .env para os testes
try {
  require("dotenv").config({ path: "./.env.test" });
} catch (err) {
  console.warn('Arquivo .env.test não encontrado, usando .env padrão.');
  require("dotenv").config({ path: "./.env" });
}

// Carrega o DB e os Models globalmente para os testes de integração
try {
  const dbModule = require("./src/infrastructure/database/sequelize/models/index.cjs");
  // O import CJS/ESM que corrigimos
  const db = dbModule.default || dbModule;

  global.db = db;

  Object.keys(db).forEach((key) => {
    if (db[key] && db[key].name && typeof db[key] === "function") {
      if (db[key].init && db[key].associate) {
        global[db[key].name] = db[key];
      }
    }
  });
} catch (err) {
  console.error(
    "ERRO FATAL ao carregar Models no jest.setup.cjs:",
    err.message
  );
}


// Hook global que roda DEPOIS de todos os testes
afterAll(async () => {
  try {
    // 1. Fechar a conexão do Sequelize
    const db = global.db;
    const sequelize = db?.sequelize;

    if (sequelize && typeof sequelize.close === "function") {
      console.log("[Jest] Fechando conexão Sequelize...");
      await sequelize.close(); 
      console.log("[Jest] Conexão Sequelize fechada.");
    }
  } catch (err) {
    console.error("[Jest] Erro ao fechar Sequelize:", err.message);
  }

  // --- CORREÇÃO AQUI ---
  // 2. Fechar a conexão do Redis
  try {
    // Importamos o *módulo* (a classe)
    const { default: RedisCacheRepository } = await import(
      "./src/infrastructure/cache/redis/RedisCacheRepository.js"
    );
    
    // Instanciamos
    const redisCacheRepository = new RedisCacheRepository();

    if (
      redisCacheRepository &&
      typeof redisCacheRepository.disconnect === "function"
    ) {
      console.log("[Jest] Desconectando Redis...");
      await redisCacheRepository.disconnect();
      console.log("[Jest] Redis desconectado.");
    } else {
      console.warn(
        "[Jest] redisCacheRepository não encontrado ou sem método disconnect."
      );
    }
  } catch (err) {
    // O erro 'Cannot find module' que víamos vai desaparecer
    console.error(
      "[Jest] Erro ao importar ou desconectar Redis no afterAll:",
      err.message
    );
  }
  // --- FIM DA CORREÇÃO ---

  if (
    typeof globalThis !== "undefined" &&
    typeof globalThis.jest !== "undefined" &&
    typeof globalThis.jest.useRealTimers === "function"
  ) {
    globalThis.jest.useRealTimers();
  }
<<<<<<< HEAD
  console.log("afterAll concluído.");
=======
  console.log("[Jest] afterAll concluído.");
>>>>>>> 147c0084fb6ff328823fc70425debc9e25fd26ed
});