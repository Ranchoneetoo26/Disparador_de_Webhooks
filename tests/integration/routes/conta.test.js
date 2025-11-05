const { describe, expect, beforeEach, test } = require("@jest/globals");
const {
  sequelize,
  models,
} = require("../../../src/infrastructure/database/sequelize/models/index.cjs");

// Importamos todos os models necessários para a cadeia
const { Conta, Cedente, SoftwareHouse } = models;

describe("Integration: Conta model", () => {
  let cedente; // Vamos precisar do ID do cedente

  beforeEach(async () => {
    await sequelize.sync({ force: true });

    // --- CORREÇÃO AQUI ---
    // 1. Crie a SoftwareHouse primeiro
    const softwareHouse = await SoftwareHouse.create({
      data_criacao: new Date(),
      cnpj: "11111111000111",
      token: "TOKEN_SH_TESTE",
      status: "ativo",
    });

    // 2. Crie o Cedente, usando o ID da SoftwareHouse
    cedente = await Cedente.create({
      data_criacao: new Date(),
      // id: 1, // Deixe o SERIAL cuidar disso
      cnpj: "22222222000122",
      token: "TOKEN_CED_TESTE",
      status: "ativo",
      software_house_id: softwareHouse.id, // Passe o ID
    });
    // --- FIM DA CORREÇÃO ---
  });

  // afterAll foi removido (corretamente)

  test("deve criar uma nova Conta associada a um Cedente", async () => {
    const payload = {
      data_criacao: new Date(),
      produto: "pix",
      banco_codigo: "341",
      status: "ativo",
      cedente_id: cedente.id, // Use o ID do cedente criado no beforeEach
    };

    const contaCriada = await Conta.create(payload);

    expect(contaCriada).toBeDefined();
    expect(contaCriada.produto).toBe("pix");
    expect(contaCriada.cedente_id).toBe(cedente.id);
  });
});
