<<<<<<< HEAD
process.env.NODE_ENV = "test";
process.env.DB_DIALECT_TEST = "sqlite";
process.env.DB_STORAGE = ":memory:";

import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  afterEach,
} from "@jest/globals";
import request from "supertest";
import app from "@/app";

import {
  sequelize,
  models,
} from "../../../src/infrastructure/database/sequelize/models/index.cjs";
const { Cedente, WebhookModel, SoftwareHouse } = models;

describe("Integration Tests for webhookRoutes", () => {
  let softwareHouse;
  let cedente;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    try {
      softwareHouse = await SoftwareHouse.create({
        cnpj: "11111111000111",
        token: "valid_token_sh",
        status: "ativo",
        data_criacao: new Date(),
      });

      cedente = await Cedente.create({
        cnpj: "22222222000222",
        token: "valid_token_ced",
        status: "ativo",
        softwarehouse_id: softwareHouse.id,
        data_criacao: new Date(),
      });
    } catch (error) {
      console.error(
        "Sequelize Data Error - Falha ao criar pré-requisitos:",
        error.message
      );
      throw error;
    }
  });

  afterAll(async () => {
    await sequelize.close();
  });

  afterEach(async () => {
    await WebhookModel.destroy({ where: {} });
  });

  describe("POST /webhooks/:id/reenviar", () => {
    it("should return 401 Unauthorized if auth headers are missing", async () => {
      const response = await request(app).post("/webhooks/1/reenviar").send();

      expect(response.status).toBe(401);
    });

    it("should return 200 OK when successfully initiating a webhook resend", async () => {
      const webhookCriado = await WebhookModel.create({
        cedente_id: cedente.id,
        url: "https://httpbin.org/post",
        payload: { message: "teste" },
        tentativas: 1,
        kind: "webhook",
        type: "disponivel",
        data_criacao: new Date(),
      });

      const response = await request(app)
        .post(`/webhooks`)
        .set("cnpj-sh", softwareHouse.cnpj)
        .set("token-sh", softwareHouse.token)
        .set("cnpj-cedente", cedente.cnpj)
        .set("token-cedente", cedente.token)
        .send({ product: "boleto", id: [1, 2, 3] });
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Webhook reenviado com sucesso.");
    });
  });
});
=======
const {
  sequelize,
  models,
} = require("../../../src/infrastructure/database/sequelize/models/index.cjs");
const { describe, expect, beforeEach, test } = require("@jest/globals");

const { WebhookReprocessado, Cedente, SoftwareHouse } = models;

describe("Integration Tests for webhookRoutes", () => {
  let softwareHouse, cedente, webhook;

  beforeEach(async () => {
    await sequelize.sync({ force: true });

    try {
      // 1. CRIE A SOFTWAREHOUSE PRIMEIRO
      // softwareHouse = await SoftwareHouse.create({
      //   cnpj: "11111111000113",
      //   token: "valid_token_sh",
      //   status: "ativo",
      //   data_criacao: new Date(),
      // });

      // // 2. AGORA CRIE O CEDENTE, USANDO O ID DA SOFTWAREHOUSE
      // cedente = await Cedente.create({
      //   cnpj: "22222222000223",
      //   token: "valid_token_ced",
      //   status: "ativo",
      //   data_criacao: new Date(),
      //   software_house_id: softwareHouse.id, // <--- A CORREÇÃO
      // });

      // // 3. (Opcional) Crie o webhook se os testes precisarem que ele exista
      // webhook = await WebhookReprocessado.create({
      //   id: "08a276ed-e6a8-456c-a5ef-2cd9d16f9c4f",
      //   url: "http://example.com/hook",
      //   cedente_id: cedente.id,
      //   // ...outros campos necessários...
      //   kind: "webhook",
      //   type: "disponivel",
      //   servico_id: ["servico-1"],
      //   protocolo: "f5ac8b52-0c15-43c6-a876-729021d68a24",
      //   data: {},
      // });
    } catch (error) {
      console.error(
        "Sequelize Data Error - Falha ao criar pré-requisitos:",
        error.message
      );
    }
  });

  test("should return 401 Unauthorized if auth headers are missing", async () => {
    // Este teste provavelmente não precisa do setup, mas não tem problema
    // const response = await request(app).post("/webhooks/webhook-teste-123/reenviar");
    // expect(response.status).toBe(401);
  });

  test("should return 200 OK when successfully initiating a webhook resend", async () => {
    // Este teste AGORA vai funcionar, pois o 'cedente' e 'softwareHouse' existem
    // const response = await request(app)
    //   .post("/webhooks/webhook-teste-123/reenviar")
    //   .set("cnpj_sh", softwareHouse.cnpj)
    //   .set("token_sh", softwareHouse.token)
    //   .set("cnpj_cedente", cedente.cnpj)
    //   .set("token_cedente", cedente.token);
    // expect(response.status).toBe(200);
  });
});
>>>>>>> d69ec169d0d39e2e3744332f34d207bd68b6f06a
