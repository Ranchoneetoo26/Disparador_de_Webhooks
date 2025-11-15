const request = require("supertest");
const app = require("../../../src/app.js");
const {
  models,
} = require("../../../src/infrastructure/database/sequelize/models/index.cjs");

const { SoftwareHouse, Cedente } = models;

describe("ProtocoloController (integration)", () => {
  
  // Antes de rodar os testes, criamos os dados que o AuthMiddleware precisa
  beforeAll(async () => {
    const sh = await SoftwareHouse.create({
      cnpj: "11111111000111",
      token: "valid_token_sh",
      status: "ativo",
      data_criacao: new Date(),
    });

    await Cedente.create({
      cnpj: "22222222000222",
      token: "valid_token_ced",
      status: "ativo",
      software_house_id: sh.id,
      data_criacao: new Date(),
    });
  });

  it("GET /protocolo deve retornar 200 e lista (cache miss)", async () => {
    const res = await request(app)
      // CORREÇÃO AQUI: Adicionamos as query strings obrigatórias
      .get("/protocolo?start_date=2025-01-01&end_date=2025-01-30")
      .set("cnpj-sh", "11111111000111")
      .set("token-sh", "valid_token_sh")
      .set("cnpj-cedente", "22222222000222")
      .set("token-cedente", "valid_token_ced");

    if (res.statusCode !== 200) {
      console.error("Erro na requisição de teste:", res.body);
    }

    expect(res.statusCode).toBe(200);
    // O Controller provavelmente retorna um array direto ou um objeto com propriedade 'data'
    // Ajuste conforme a sua resposta real se necessário
    expect(Array.isArray(res.body) || Array.isArray(res.body.data)).toBe(true);
  });

  it("GET /protocolo/:uuid deve retornar 404 para uuid inexistente", async () => {
    const res = await request(app)
      .get("/protocolo/3e57a39c-7f52-4938-911f-fb17c3f004cd")
      .set("cnpj-sh", "11111111000111")
      .set("token-sh", "valid_token_sh")
      .set("cnpj-cedente", "22222222000222")
      .set("token-cedente", "valid_token_ced");

    expect(res.statusCode).toBe(404);
  });
});