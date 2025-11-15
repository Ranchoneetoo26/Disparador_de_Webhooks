"use strict";

try {
  require("dotenv").config({ path: "./.env.test" });
} catch (err) {
  try {
    require("dotenv").config({ path: "./.env" });
  } catch (e) {}
}

const {
  beforeAll,
  afterAll,
} = require("@jest/globals");

let db, sequelize, models;

try {
  const indexModule = require("./src/infrastructure/database/sequelize/models/index.cjs");
  db = indexModule && (indexModule.default || indexModule);
  if (db) {
    global.db = db;
    if (db.sequelize) {
      global.sequelize = db.sequelize;
      sequelize = db.sequelize;
    }
    if (db.models) {
      global.models = db.models;
      models = db.models;
      Object.keys(db.models).forEach((m) => {
        if (!global[m]) global[m] = db.models[m];
      });
    }
    console.log(
      "[jest.setup.cjs] DB e models carregados no global com sucesso."
    );
  } else {
    console.warn(
      "[jest.setup.cjs] require(index.cjs) retornou falsy. Prosseguindo sem models globais."
    );
  }
} catch (err) {
  console.error(
    "ERRO ao carregar Models no index.cjs (require):",
    err && err.message ? err.message : err
  );
  console.warn(
    "[jest.setup.cjs] Prosseguindo mesmo com erro no require; certifique-se que repositórios são tolerantes a models ausentes."
  );
}

beforeAll(async () => {
  if (sequelize) {
    try {
      console.log("[Jest] Sincronizando o banco de dados de teste (sync)...");
      await sequelize.sync({ force: true });
      console.log("[Jest] Banco de dados de teste sincronizado.");
    } catch (error) {
      console.error("[Jest] ERRO AO SINCRONIZAR O BANCO DE TESTE:", error);
      process.exit(1);
    }
  } else {
    console.error("[Jest] Instância do Sequelize não encontrada no beforeAll.");
  }
});

afterAll(async () => {
  try {
    const seq = global.sequelize || (global.db && global.db.sequelize);
    if (seq && typeof seq.close === "function") {
      console.log("[Jest] Fechando conexão Sequelize...");
      try {
        await seq.close();
      } catch (e) {
        console.warn(
          "[Jest] Erro ao fechar sequelize (ignored):",
          e && e.message
        );
      }
      console.log("[Jest] Conexão Sequelize fechada.");
    }
  } catch (err) {
    console.error(
      "[Jest] Erro ao fechar Sequelize:",
      err && err.message ? err.message : err
    );
  }

  try {
    let redisRepo;
    try {
      const r = require("./src/infrastructure/cache/redis/RedisCacheRepository.js");
      redisRepo = r && (r.default || r);
    } catch (e) {
      redisRepo = null;
    }

    if (redisRepo && typeof redisRepo.disconnect === "function") {
      console.log("[Jest] Desconectando Redis (singleton) via disconnect()...");
      try {
        await redisRepo.disconnect();
      } catch (e) {
        console.warn(
          "[Jest] Erro ao disconnect Redis (ignored):",
          e && e.message
        );
      }
      console.log("[Jest] Redis (singleton) desconectado via disconnect().");
    } else if (redisRepo && typeof redisRepo.quit === "function") {
      console.log("[Jest] Chamando quit() no Redis...");
      try {
        await new Promise((resolve) => redisRepo.quit(() => resolve()));
      } catch (e) {
        console.warn("[Jest] Erro ao quit() Redis (ignored):", e && e.message);
      }
      console.log("[Jest] Redis fechado via quit().");
    } else {
      console.log(
        "[Jest] Nenhuma instância de Redis encontrada para desconectar."
      );
    }
  } catch (err) {
    console.error(
      "[Jest] Erro ao desconectar Redis:",
      err && err.message ? err.message : err
    );
  }

  if (
    typeof globalThis !== "undefined" &&
    typeof globalThis.jest !== "undefined" &&
    typeof globalThis.jest.useRealTimers === "function"
  ) {
    globalThis.jest.useRealTimers();
  }
  console.log("[Jest] afterAll concluído.");
});