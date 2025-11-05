const { describe, expect, beforeEach, test } = require("@jest/globals");
const {
  sequelize,
  models,
} = require("../../../src/infrastructure/database/sequelize/models/index.cjs");

const { Conta, Cedente, SoftwareHouse } = models;

describe("Integration: Conta model", () => {
  let cedente; 

  beforeEach(async () => {
    await sequelize.sync({ force: true });

    const softwareHouse = await SoftwareHouse.create({
      data_criacao: new Date(),
      cnpj: "11111111000111",
      token: "TOKEN_SH_TESTE",
      status: "ativo",
    });

    cedente = await Cedente.create({
      data_criacao: new Date(),
      cnpj: "22222222000122",
      token: "TOKEN_CED_TESTE",
      status: "ativo",
      software_house_id: softwareHouse.id, 
    });
  });

  test("deve criar uma nova Conta associada a um Cedente", async () => {
    const payload = {
      data_criacao: new Date(),
      produto: "pix",
      banco_codigo: "341",
      status: "ativo",
      cedente_id: cedente.id, 
    };

    const contaCriada = await Conta.create(payload);

    expect(contaCriada).toBeDefined();
    expect(contaCriada.produto).toBe("pix");
    expect(contaCriada.cedente_id).toBe(cedente.id);
  });
});
