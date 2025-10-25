try {
  const dotenv = require("dotenv");
  dotenv.config({ path: "./.env" });
} catch (err) {
  console.warn("jest.setup.cjs: .env não encontrado ou erro ao carregar.");
}

let db;
try {
  db = require("./src/infrastructure/database/sequelize/models/index.cjs");
  console.log("--- DEBUG START jest.setup.cjs ---");
  console.log("DB Loaded:", !!db);
  if (db && db.models) {
    console.log("DB Models Keys:", Object.keys(db.models || {}));
    console.log("DB Export Keys:", Object.keys(db));
  } else {
    console.log("DB Keys: Objeto db ou db.models não carregado corretamente.");
  }
  console.log("--- DEBUG END jest.setup.cjs ---");
  global.db = db;
} catch (err) {
  console.error("ERRO FATAL ao carregar DB no jest.setup.cjs:", err.message, err.stack);
  process.exit(1);
}

async function tryCloseServer() {
  try {
    const appModule = await import("./src/app.js");
    const app = appModule.default || appModule;
    const server = app.server;
    if (server && typeof server.close === "function") {
      console.log("Fechando servidor Express...");
      await new Promise((resolve, reject) =>
        server.close((err) => (err ? reject(err) : resolve()))
      );
      console.log("Servidor Express fechado.");
    } else {
       console.log("Nenhum servidor Express encontrado para fechar.");
    }
  } catch (err) {
     console.error("Erro ao tentar fechar servidor Express:", err.message);
  }
}

async function tryCloseSequelize() {
  try {
    const sequelize = db?.sequelize;

    if (sequelize && sequelize.connectionManager && !sequelize.connectionManager.closing) {
      console.log("Fechando conexão Sequelize...");
      await sequelize.close();
      console.log("Conexão Sequelize fechada.");
    } else if (sequelize && sequelize.connectionManager && sequelize.connectionManager.closing) {
       console.log("Conexão Sequelize já estava fechando ou fechada.");
    } else {
       console.log("Instância Sequelize não encontrada ou inválida para fechar.");
    }

  } catch (err) {
    console.error("Erro ao fechar Sequelize:", err.message);
  }
}

afterAll(async () => {
  console.log("Iniciando afterAll...");

  await tryCloseServer();

  try {
    const repositoriesModule = await import(
      "./src/infrastructure/database/sequelize/repositories/index.js"
    );
    const redisCacheRepository = repositoriesModule.redisCacheRepository;
    if (redisCacheRepository && typeof redisCacheRepository.disconnect === "function") {
      console.log("Desconectando Redis...");
      await redisCacheRepository.disconnect();
      console.log("Redis desconectado.");
    } else {
      console.warn("redisCacheRepository não encontrado ou sem método disconnect.");
    }
  } catch (err) {
    console.error("Erro ao importar ou desconectar Redis no afterAll:", err.message, err.stack);
  }

  await tryCloseSequelize();

  if (
    typeof globalThis !== "undefined" &&
    typeof globalThis.jest !== "undefined" &&
    typeof globalThis.jest.useRealTimers === "function"
  ) {
    globalThis.jest.useRealTimers();
  }
  console.log("afterAll concluído.");
});