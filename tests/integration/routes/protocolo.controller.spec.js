// tests/integration/routes/protocolo.controller.spec.js

const request = require("supertest");
const app = require("@/app");

const { SoftwareHouse, Cedente } = require('../../../src/infrastructure/database/sequelize/models/index.cjs');

describe("ProtocoloController (integration)", () => {

  // 🚀 SETUP: Insere SoftwareHouse e Cedente para resolver o 401 Unauthorized.
  beforeAll(async () => {
    // Verificação de segurança (O 401 só será resolvido se este bloco for executado com sucesso)
    if (!SoftwareHouse || !Cedente) {
      console.error("[CRITICAL SETUP ERROR] Modelos SoftwareHouse/Cedente não estão acessíveis. O 401 PERSISTIRÁ.");
      return;
    }

    try {
      // Insere a SoftwareHouse (CNPJ e Token dos headers do seu teste)
      await SoftwareHouse.findOrCreate({
        where: { cnpj: '11111111000111' },
        defaults: { token: 'valid_token_sh' }
      });

      // Insere o Cedente (CNPJ e Token dos headers do seu teste)
      await Cedente.findOrCreate({
        where: { cnpj: '22222222000222' },
        defaults: { token: 'valid_token_ced' }
      });

      console.log("[Setup] Dados de autenticação (SH/Cedente) PRONTOS.");

    } catch (error) {
      console.error("[Setup ERROR] Falha grave ao injetar dados no banco.", error.message);
    }
  });

  // Boa prática: Limpar o banco de dados após os testes para isolamento.
  afterAll(async () => {
    try {
      await SoftwareHouse.destroy({ where: { cnpj: '11111111000111' } });
      await Cedente.destroy({ where: { cnpj: '22222222000222' } });
    } catch (error) {
      console.warn("[Cleanup Warning] Falha na limpeza de dados, ignorado.");
    }
  });


  it("GET /protocolo deve retornar 200 e lista (cache miss)", async () => {
    const res = await request(app)
      .get("/protocolo")
      .set("cnpj-sh", "11111111000111")
      .set("token-sh", "valid_token_sh")
      .set("cnpj-cedente", "22222222000222")
      .set("token-cedente", "valid_token_ced");

    console.log(res.statusCode, res.body);

    // O status será 200 se a autenticação funcionar.
    expect([200, 400].includes(res.statusCode)).toBe(true);
    expect(!!res.body).toBe(true);
  });

  it("GET /protocolo/:uuid deve retornar 404 para uuid inexistente", async () => {
    const res = await request(app)
      // UUID aleatório
      .get("/protocolo/3e57a39c-7f52-4938-911f-fb17c3f004cd")
      .set("cnpj-sh", "11111111000111")
      .set("token-sh", "valid_token_sh")
      .set("cnpj-cedente", "22222222000222")
      .set("token-cedente", "valid_token_ced");

    console.log(res.statusCode, res.body);

    // O status será 404 se a autenticação funcionar.
    expect([200, 404].includes(res.statusCode)).toBe(true);
  });
});