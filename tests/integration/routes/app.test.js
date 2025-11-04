import { describe, it, expect, afterAll } from "@jest/globals";
import request from "supertest";
import app from "@/app";

// Ajuste esses imports conforme seus exports reais:
import dbCjs from "@/infrastructure/database/sequelize/models/index.cjs"; // o arquivo que você já usa
import redisCacheRepository from "@/infrastructure/cache/redis/RedisCacheRepository"; // export default do client/instance

const db = dbCjs.default || dbCjs;
const { sequelize } = db;

describe("Testes da API Principal", () => {
  it("deve responder com status 200 na rota GET /", async () => {
    const response = await request(app).get("/");
    expect(response.statusCode).toBe(200);
  });
});

afterAll(async () => {
  // fecha sequelize
  try {
    if (sequelize && typeof sequelize.close === "function") {
      await sequelize.close();
      // console.log('Sequelize closed');
    }
  } catch (err) {
    // console.warn('Erro fechando sequelize:', err);
  }

  // fecha redis (ajuste conforme a lib que você usa: node-redis ou ioredis)
  try {
    const client = redisCacheRepository; // se você exporta a instância default
    if (client) {
      if (typeof client.quit === "function") {
        // node-redis v3 callback style
        await new Promise((resolve) => client.quit(() => resolve()));
      } else if (typeof client.disconnect === "function") {
        client.disconnect();
      } else if (typeof client.quit === "object" && client.quit.constructor.name === 'AsyncFunction') {
        // ioredis ou node-redis v4 returning Promise
        await client.quit();
      }
    }
  } catch (err) {
    // console.warn('Erro fechando redis:', err);
  }
});
