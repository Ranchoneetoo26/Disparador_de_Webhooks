const { describe, it, expect, afterAll } = require("@jest/globals");
const request = require("supertest");
const app = require("@/app");

const {
  sequelize,
} = require("@/infrastructure/database/sequelize/models/index.cjs");
const redisCacheRepository = require("@/infrastructure/cache/redis/RedisCacheRepository");

describe("Testes da API Principal", () => {
  it("deve responder com status 200 na rota GET /", async () => {
    const response = await request(app).get("/");
    expect(response.statusCode).toBe(200);
  });
});

afterAll(async () => {
  try {
    if (sequelize && typeof sequelize.close === "function") {
      await sequelize.close();
    }
  } catch (err) {}

  try {
    const client = redisCacheRepository;
    if (client) {
      if (typeof client.quit === "function") {
        await new Promise((resolve) => client.quit(() => resolve()));
      } else if (typeof client.disconnect === "function") {
        client.disconnect();
      } else if (
        typeof client.quit === "object" &&
        client.quit.constructor.name === "AsyncFunction"
      ) {
        await client.quit();
      }
    }
  } catch (err) {}
});
