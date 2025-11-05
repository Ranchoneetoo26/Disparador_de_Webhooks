"use strict";

<<<<<<< HEAD
import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

// --- CONFIGURAÇÃO E FUNÇÕES INTERNAS DO REDIS ---
const redisConfig = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || "0", 10),
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  connectTimeout: 5000,
};
=======
const Redis = require("ioredis");

const redisConfig = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || "0", 10),
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  connectTimeout: 5000,
};

let redisClient = null;

function getClient() {
  if (!redisClient || redisClient.status === "end") {
    console.log(
      `[Cache] Conectando ao Redis em ${redisConfig.host}:${redisConfig.port} (DB ${redisConfig.db})...`
    );
    redisClient = new Redis(redisConfig);

    redisClient.on("connect", () => {
      console.log("[Cache] Conectado ao Redis.");
    });

    redisClient.on("ready", () => {
      console.log("[Cache] Cliente Redis pronto para uso.");
    });

    redisClient.on("error", (err) => {
      console.error(
        "[Cache] Erro de conexão/operação Redis:",
        err.message || err
      );
    });

    redisClient.on("close", () => {});

    redisClient.on("reconnecting", (delay) => {
      console.log(`[Cache] Tentando reconectar ao Redis em ${delay}ms...`);
    });

    redisClient.on("end", () => {
      redisClient = null;
    });
  }
  return redisClient;
}

async function ensureReadyClient() {
  const client = getClient();
  if (!client) {
    console.warn("[Cache] Cliente Redis não inicializado.");
    return null;
  }
  if (client.status === "ready") {
    return client;
  }
  if (client.status === "connecting" || client.status === "reconnecting") {
    console.log("[Cache] Aguardando cliente Redis ficar pronto...");
    try {
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(
          () =>
            reject(new Error("Timeout esperando cliente Redis ficar pronto")),
          redisConfig.connectTimeout || 5000
        );
        client.once("ready", () => {
          clearTimeout(timeout);
          resolve();
        });
        client.once("error", (err) => {
          clearTimeout(timeout);
          reject(err);
        });
        client.once("end", () => {
          clearTimeout(timeout);
          reject(
            new Error(
              "Conexão Redis finalizada enquanto aguardava ficar pronto"
            )
          );
        });
      });
      return client;
    } catch (error) {
      console.error("[Cache] Erro ao aguardar cliente Redis:", error.message);
      return null;
    }
  }
  console.warn(`[Cache] Cliente Redis em estado inesperado: ${client.status}`);
  return null;
}

class RedisCacheRepository {
  constructor() {
    try {
      this.client = new Redis({
        host: process.env.REDIS_HOST || "localhost",
        port: process.env.REDIS_PORT || 6379,
        db: process.env.REDIS_DB || 0,
        maxRetriesPerRequest: 3,
      });

      this.client.on("connect", () =>
        console.log("[Cache] Conectando ao Redis...")
      );
      this.client.on("ready", () =>
        console.log("[Cache] Cliente Redis pronto para uso.")
      );
      this.client.on("error", (err) =>
        console.error("[Cache] Erro no Redis:", err.message)
      );
    } catch (err) {
      console.error("[Cache] Falha ao criar cliente Redis:", err.message);
    }
  }
>>>>>>> ac74577e24c01cb6576b44326ef20c19e70cd838

let redisClient = null;

<<<<<<< HEAD
function getClient() {
  if (!redisClient || redisClient.status === "end") {
    console.log(
      `[Cache] Conectando ao Redis em ${redisConfig.host}:${redisConfig.port} (DB ${redisConfig.db})...`
    );
    redisClient = new Redis(redisConfig);

    redisClient.on("connect", () => {
      console.log("[Cache] Conectado ao Redis.");
    });

    redisClient.on("ready", () => {
      console.log("[Cache] Cliente Redis pronto para uso.");
    });

    redisClient.on("error", (err) => {
      console.error(
        "[Cache] Erro de conexão/operação Redis:",
        err.message || err
      );
    });

    redisClient.on("close", () => {});

    redisClient.on("reconnecting", (delay) => {
      console.log(`[Cache] Tentando reconectar ao Redis em ${delay}ms...`);
    });

    redisClient.on("end", () => {
      redisClient = null;
    });
  }
  return redisClient;
}

async function ensureReadyClient() {
  const client = getClient();
  if (!client) {
    console.warn("[Cache] Cliente Redis não inicializado.");
    return null;
  }
  if (client.status === "ready") {
    return client;
  }
  if (client.status === "connecting" || client.status === "reconnecting") {
    console.log("[Cache] Aguardando cliente Redis ficar pronto...");
    try {
      
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(
          () =>
            reject(new Error("Timeout esperando cliente Redis ficar pronto")),
          redisConfig.connectTimeout || 5000
        );
        client.once("ready", () => {
          clearTimeout(timeout);
          resolve();
        });
        client.once("error", (err) => {
          clearTimeout(timeout);
          reject(err);
        });
        client.once("end", () => {
          clearTimeout(timeout);
          reject(
            new Error(
              "Conexão Redis finalizada enquanto aguardava ficar pronto"
            )
          );
        });
      });
      return client;
    } catch (error) {
      console.error("[Cache] Erro ao aguardar cliente Redis:", error.message);
      return null;
    }
  }
  console.warn(`[Cache] Cliente Redis em estado inesperado: ${client.status}`);
  return null;
}
// --- FIM DAS FUNÇÕES INTERNAS ---


// --- A LINHA IMPORTANTE ESTÁ AQUI ---
// Garante que estamos exportando a classe como 'default'
export default class RedisCacheRepository {
  constructor() {
    getClient();
  }

  async get(key) {
    const client = await ensureReadyClient();
    if (!client) {
      console.warn(`[Cache] GET ${key}: Cliente Redis não disponível.`);
      return null;
    }
    try {
      console.log(`[Cache] GET ${key}`);
      const value = await client.get(key);

      return value;
    } catch (error) {
      console.error(`[Cache] Erro ao buscar chave ${key}:`, error.message);
      return null;
    }
  }

  async set(key, value, options = {}) {
    const client = await ensureReadyClient();
    if (!client) {
      console.warn(`[Cache] SET ${key}: Cliente Redis não disponível.`);
      return false;
    }

    const { ttl } = options;
    try {
      const valueToStore =
        typeof value === "string" ? value : JSON.stringify(value);

      console.log(
        `[Cache] SET ${key} (TTL: ${
          ttl && Number.isInteger(ttl) && ttl > 0 ? ttl + "s" : "Nenhum"
        })`
      );

      if (ttl && Number.isInteger(ttl) && ttl > 0) {
        await client.set(key, valueToStore, "EX", ttl);
      } else {
        await client.set(key, valueToStore);
    }
      return true;
    } catch (error) {
      console.error(`[Cache] Erro ao definir chave ${key}:`, error.message);
      return false;
    }
  }

  async del(key) {
    const client = await ensureReadyClient();
    if (!client) {
      console.warn(`[Cache] DEL ${key}: Cliente Redis não disponível.`);
      return false;
    }
    try {
      console.log(`[Cache] DEL ${key}`);
      await client.del(key);
      return true;
    } catch (error) {
      console.error(`[Cache] Erro ao deletar chave ${key}:`, error.message);
      return false;
    }
  }

  async disconnect() {
    const client = redisClient;
    if (client && client.status !== "end") {
      console.log("[Cache] Desconectando do Redis..."); 
      try {
        client.removeAllListeners();

        await client.quit();
        console.log("[Cache] Conexão Redis fechada via quit().");
t     } catch (err) {
        console.error("[Cache] Erro ao desconectar do Redis:", err.message);
      } finally {
        redisClient = null;
      }
    } else {
      redisClient = null;
    }
  }
}
=======
  async set(key, value, options = {}) {
    if (!this.client) return;
    const { ttl } = options;
    try {
      const valueToStore =
        typeof value === "string" ? value : JSON.stringify(value);

      console.log(
        `[Cache] SET ${key} (TTL: ${
          ttl && Number.isInteger(ttl) && ttl > 0 ? ttl + "s" : "Nenhum"
        })`
      );

      if (ttl && Number.isInteger(ttl) && ttl > 0) {
        await client.set(key, valueToStore, "EX", ttl);
      } else {
        await client.set(key, valueToStore);
      }
      return true;
    } catch (error) {
      console.error(`[Cache] Erro ao definir chave ${key}:`, error.message);
      return false;
    }
    return this.client.set(key, value);
  }

  // --- CORREÇÃO AQUI ---
  // Adicionando o método .del() que estava faltando
  async del(key) {
    const client = await ensureReadyClient();
    if (!client) {
      console.warn(`[Cache] DEL ${key}: Cliente Redis não disponível.`);
      return false;
    }
    try {
      console.log(`[Cache] DEL ${key}`);
      await client.del(key);
      return true;
    } catch (error) {
      console.error(`[Cache] Erro ao deletar chave ${key}:`, error.message);
      return false;
    }
  }
  // --- FIM DA CORREÇÃO ---

  async disconnect() {
    const client = redisClient;
    if (client && client.status !== "end") {
      console.log("[Cache] Desconectando do Redis...");
      try {
        client.removeAllListeners();

        await client.quit();
        console.log("[Cache] Conexão Redis fechada via quit().");
        t;
      } catch (err) {
        console.error("[Cache] Erro ao desconectar do Redis:", err.message);
      } finally {
        redisClient = null;
      }
    } else {
      redisClient = null;
    }
  }
}

module.exports = RedisCacheRepository;
>>>>>>> ac74577e24c01cb6576b44326ef20c19e70cd838
