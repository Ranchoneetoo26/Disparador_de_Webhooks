// Importe os models no topo do arquivo
import {
  sequelize,
  models,
} from "../../../src/infrastructure/database/sequelize/models/index.cjs";
import {
  jest,
  describe,
  expect,
  beforeEach,
  test,
} from "@jest/globals";
// ... seus outros imports (app, supertest, etc.)

const { WebhookModel, Cedente, SoftwareHouse } = models;

describe("Integration Tests for webhookRoutes", () => {
  let softwareHouse, cedente, webhook;
  // ... suas outras variáveis (app, server, request)

  beforeEach(async () => {
    await sequelize.sync({ force: true });

    try {
      // 1. CRIE A SOFTWAREHOUSE PRIMEIRO
      softwareHouse = await SoftwareHouse.create({
        cnpj: "11111111000111",
        token: "valid_token_sh",
        status: "ativo",
        data_criacao: new Date(),
      });

      // 2. AGORA CRIE O CEDENTE, USANDO O ID DA SOFTWAREHOUSE
      cedente = await Cedente.create({
        cnpj: "22222222000222",
        token: "valid_token_ced",
        status: "ativo",
        data_criacao: new Date(),
        software_house_id: softwareHouse.id, // <--- A CORREÇÃO
      });

      // 3. (Opcional) Crie o webhook se os testes precisarem que ele exista
      webhook = await WebhookModel.create({
        id: 'webhook-teste-123',
        url: 'http://example.com/hook',
        cedente_id: cedente.id,
        // ...outros campos necessários...
      });

    } catch (error) {
      console.error(
        "Sequelize Data Error - Falha ao criar pré-requisitos:",
        error.message
      );
    }
  });

  // ... (remova o afterAll daqui)

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