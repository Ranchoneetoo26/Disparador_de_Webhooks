'use strict';

// Carrega o .env para os testes
try {
  require("dotenv").config({ path: "./.env.test" });
} catch (err) {
  console.warn('Arquivo .env.test não encontrado, usando .env padrão.');
  require("dotenv").config({ path: "./.env" });
}

// Carrega o DB e os Models globalmente
try {
  const dbModule = require("./src/infrastructure/database/sequelize/models/index.cjs");
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
  // 2. Fechar a ÚNICA instância do Redis
  try {
    // Importamos a *instância singleton*
    const { default: redisCacheRepository } = await import(
      "./src/infrastructure/cache/redis/RedisCacheRepository.js"
    );
    
    // Verificamos e desconectamos a instância
    if (
      redisCacheRepository &&
      typeof redisCacheRepository.disconnect === "function"
    ) {
      console.log("[Jest] Desconectando Redis (singleton)...");
      await redisCacheRepository.disconnect();
      console.log("[Jest] Redis (singleton) desconectado.");
    } else {
      console.warn(
        "[Jest] Instância do redisCacheRepository não encontrada ou sem método disconnect."
      );
    }
  } catch (err) {
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
  console.log("[Jest] afterAll concluído.");
});