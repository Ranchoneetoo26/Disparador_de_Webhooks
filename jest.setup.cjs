try {
  require("dotenv").config({ path: "./.env" });
} catch (err) {}



try {
  const dbModule = require("./src/infrastructure/database/sequelize/models/index.cjs");
  const db = dbModule.default || dbModule;

  console.log("--- DEBUG START ---");
  console.log("DB Loaded:", !!db);
  if (db) {
    console.log("Webhook in DB:", !!db.Webhook);
    console.log("Webhook Name:", db.Webhook ? db.Webhook.name : "N/A");
    console.log(
      "DB Keys:",
      Object.keys(db).filter((key) => key.length > 3)
    );
  }
  console.log("--- DEBUG END ---");

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

async function tryCloseServer() {
  try {
    const appModule = await import("./src/app.js");
    const app = appModule.default || appModule;
    const server = app.server;
    if (server && typeof server.close === "function") {
      console.log("Fechando servidor...");
      await new Promise((resolve, reject) =>
        server.close((err) => (err ? reject(err) : resolve()))
      );
      console.log("Servidor fechado.");
    }
  } catch (err) {}
}

async function tryCloseSequelize() {
  try {
    const db =
      global.db ||
      require("./src/infrastructure/database/sequelize/models/index.cjs");
    const sequelize = db?.sequelize;

    if (sequelize && typeof sequelize.close === "function") {
      console.log("Fechando conexão Sequelize...");
      await sequelize.close(); //
      console.log("Conexão Sequelize fechada.");
    }
  } catch (err) {}
}

afterAll(async () => {
  try {
    await tryCloseServer();
  } catch (err) {}

  try {
    await tryCloseSequelize();
  } catch (err) {}

  await tryCloseSequelize();

  try {
    const repositoriesModule = await import(
      "./src/infrastructure/database/sequelize/repositories/index.js"
    );
    const redisCacheRepository = repositoriesModule.redisCacheRepository;

    if (
      redisCacheRepository &&
      typeof redisCacheRepository.disconnect === "function"
    ) {
      console.log("Desconectando Redis...");
      await redisCacheRepository.disconnect();
      console.log("Redis desconectado.");
    } else {
      console.warn(
        "redisCacheRepository não encontrado ou sem método disconnect após import."
      );
    }
  } catch (err) {
    console.error(
      "Erro ao importar ou desconectar Redis no afterAll:",
      err.message
    );
  }

  if (
    typeof globalThis !== "undefined" &&
    typeof globalThis.jest !== "undefined" &&
    typeof globalThis.jest.useRealTimers === "function"
  ) {
    
    globalThis.jest.useRealTimers();
  }
  console.log("afterAll concluído.");
});
