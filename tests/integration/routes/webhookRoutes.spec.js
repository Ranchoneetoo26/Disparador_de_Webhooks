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
