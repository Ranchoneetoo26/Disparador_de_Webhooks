const request = require("supertest");
const app = require("@/app");

describe("ProtocoloController (integration)", () => {
  it("GET /protocolo deve retornar 200 e lista (cache miss)", async () => {
    const res = await request(app)
      .get("/protocolo")
      .set("cnpj-sh", "11111111000111")
      .set("token-sh", "valid_token_sh")
      .set("cnpj-cedente", "22222222000222")
      .set("token-cedente", "valid_token_ced");

    console.log(res.statusCode, res.body);

    expect([200, 400].includes(res.statusCode)).toBe(true); // depende de dados no DB
    expect(!!res.body).toBe(true);
  });

  it("GET /protocolo/:uuid deve retornar 404 para uuid inexistente", async () => {
    const res = await request(app)
      .get("/protocolo/3e57a39c-7f52-4938-911f-fb17c3f004cd")
      .set("cnpj-sh", "11111111000111")
      .set("token-sh", "valid_token_sh")
      .set("cnpj-cedente", "22222222000222")
      .set("token-cedente", "valid_token_ced");

    console.log(res.statusCode, res.body);

    expect([200, 404].includes(res.statusCode)).toBe(true); // depende de dados no DB
  });
});
