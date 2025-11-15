"use strict";

const Redis = require("ioredis");

class RedisCacheRepository {
  constructor() {
    try {
      this.client = new Redis({
        host: process.env.REDIS_HOST || "localhost",
        port: process.env.REDIS_PORT || 6379,
        db: process.env.REDIS_DB || 0,
        maxRetriesPerRequest: 3,
        connectTimeout: 5000,
        enableReadyCheck: true,
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
      this.client = null;
    }
  }

  async get(key) {
    if (!this.client) return null;
    try {
      return await this.client.get(key);
    } catch (error) {
      console.error(`[Cache] Erro ao buscar chave ${key}:`, error.message);
      return null;
    }
  }

  async set(key, value, options = {}) {
    if (!this.client) return false;
    
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
        await this.client.set(key, valueToStore, "EX", ttl);
      } else {
        await this.client.set(key, valueToStore);
      }
      return true;
    } catch (error) {
      console.error(`[Cache] Erro ao definir chave ${key}:`, error.message);
      return false;
    }
  }

  async del(key) {
    if (!this.client) return false;
    
    try {
      console.log(`[Cache] DEL ${key}`);
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error(`[Cache] Erro ao deletar chave ${key}:`, error.message);
      return false;
    }
  }

  async disconnect() {
    if (this.client && this.client.status !== "end") {
      console.log("[Cache] Desconectando do Redis...");
      try {
        this.client.removeAllListeners();
        await this.client.quit();
        console.log("[Cache] Conexão Redis fechada via quit().");
      } catch (err) {
        console.error("[Cache] Erro ao desconectar do Redis:", err.message);
      } finally {
        this.client = null;
      }
    }
  }
}

module.exports = RedisCacheRepository;