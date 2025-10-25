process.env.NODE_ENV = "test";
import path from 'path'; // Manter para logging
import {
  describe,
  it,
  expect,
  // beforeAll, // Removido pois usamos beforeEach
  afterAll,
  // afterEach, // Removido pois usamos beforeEach com force: true
  beforeEach,
  jest
} from "@jest/globals";
import request from "supertest";
import app from "../../../src/app.js";

// Correção da importação (manter)
import db from "../../../src/infrastructure/database/sequelize/models/index.cjs";
const { sequelize, models } = db;

const { Cedente, WebhookModel, SoftwareHouse } = models; // WebhookModel é o correto aqui

describe("Integration Tests for webhookRoutes", () => {
  let softwareHouse;
  let cedente;
  let webhookParaReenviar; // Variável para guardar o webhook criado

  // Usar beforeEach para limpar e criar dados antes de CADA teste
  beforeEach(async () => {
    jest.setTimeout(15000); // Definir timeout aqui
    try {
      // Limpar tabelas antes de cada teste
      await sequelize.sync({ force: true });
      // Adiciona verificação de nome de teste apenas se estiver dentro de um teste
      const testName = expect.getState().currentTestName || 'beforeEachSetup';
      console.log(`[${path.basename(testName)}] sequelize.sync completed.`);

      // Criar dados necessários
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

      // Criar um webhook que será usado no teste de reenviar
      webhookParaReenviar = await WebhookModel.create({ // Usar WebhookModel
        cedente_id: cedente.id,
        url: "https://httpbin.org/post", // URL de exemplo
        payload: JSON.stringify({ message: "teste inicial" }), // Payload como string JSON
        tentativas: 1,
        status: 'falhou', // Marcar como falhou para ter motivo para reenviar
        kind: "webhook_exemplo", // Ajustar kind/type conforme seu modelo
        type: "tipo_exemplo",
        // --- INÍCIO DA CORREÇÃO FINAL ---
        product: "boleto", // Adiciona o campo product que faltava
        // --- FIM DA CORREÇÃO FINAL ---
        protocolo: `PROTO-${Date.now()}`, // Protocolo único
        data_criacao: new Date(),
      });
      console.log(`[${path.basename(testName)}] Dados de teste criados. Webhook ID: ${webhookParaReenviar.id}`);

    } catch (error) {
      // Adiciona verificação de nome de teste apenas se estiver dentro de um teste
      const testName = expect.getState().currentTestName || 'beforeEachSetup';
      console.error(
        `[${path.basename(testName)}] Erro no beforeEach:`,
        error.message
      );
      throw error;
    }
  });

  afterAll(async () => {
    if (sequelize) {
      await sequelize.close();
    }
  });

  describe("POST /webhooks/:id/reenviar", () => {
    it("should return 401 Unauthorized if auth headers are missing", async () => {
      const testName = expect.getState().currentTestName; // Pega nome do teste atual
      // Usa o ID do webhook criado no beforeEach
      const response = await request(app)
        .post(`/webhooks/${webhookParaReenviar.id}/reenviar`)
        .send(); // Sem headers

      expect(response.status).toBe(401);
    });

    it("should return 200 OK when successfully initiating a webhook resend", async () => {
      const testName = expect.getState().currentTestName; // Pega nome do teste atual
      console.log(`[${path.basename(testName)}] Testando reenviar webhook ID: ${webhookParaReenviar.id}`);
      const response = await request(app)
        .post(`/webhooks/${webhookParaReenviar.id}/reenviar`) // <-- URL Correta com ID
        .set("cnpj-sh", softwareHouse.cnpj)
        .set("token-sh", softwareHouse.token)
        .set("cnpj-cedente", cedente.cnpj)
        .set("token-cedente", cedente.token)
        .send();

      console.log(`[${path.basename(testName)}] Resposta do reenviar:`, response.status, response.body);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain("Webhook reenviado");
    });

    it("should return 404 Not Found if webhook ID does not exist", async () => {
      const testName = expect.getState().currentTestName; // Pega nome do teste atual
      const nonExistentId = 99999;
      const response = await request(app)
        .post(`/webhooks/${nonExistentId}/reenviar`)
        .set("cnpj-sh", softwareHouse.cnpj)
        .set("token-sh", softwareHouse.token)
        .set("cnpj-cedente", cedente.cnpj)
        .set("token-cedente", cedente.token)
        .send();

      expect(response.status).toBe(404);
    });
  });
});

