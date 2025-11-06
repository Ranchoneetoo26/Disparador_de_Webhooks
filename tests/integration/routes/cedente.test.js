const { describe, expect, beforeEach, test } = require("@jest/globals");

const { Cedente, SoftwareHouse } = global.db.models;

describe("Integração do Model: Cedente", () => {
  let softwareHouse;
  jest.setTimeout(15000);

  beforeEach(async () => {
    await global.db.sequelize.sync({ force: true });

    softwareHouse = await SoftwareHouse.create({
      data_criacao: new Date(),
      cnpj: "11111111000111",
      token: "TOKEN_DE_TESTE_SH",
      status: "ativo",
    });
  });

  test("deve CRIAR um novo Cedente com dados válidos", async () => {
    const payload = {
      data_criacao: new Date(),
      cnpj: "12345678000199",
      token: "TOKEN_CEDENTE_TESTE",
      status: "ativo",
      software_house_id: softwareHouse.id,
    };

    const cedenteCriado = await Cedente.create(payload);

    expect(cedenteCriado).toBeDefined();
    expect(cedenteCriado.cnpj).toBe(payload.cnpj);
    expect(cedenteCriado.token).toBe(payload.token);
    expect(cedenteCriado.software_house_id).toBe(softwareHouse.id);
  });
});
