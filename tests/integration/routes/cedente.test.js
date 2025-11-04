import { jest, describe, expect, beforeEach, test } from "@jest/globals";

// --- CORREÇÃO AQUI ---
// Importamos os models do 'global' que o jest.setup.cjs (provavelmente) criou.
// Se isso não funcionar, mude para a importação direta:
// const { Cedente, SoftwareHouse } = require("../../../src/infrastructure/database/sequelize/models/index.cjs").models;
const { Cedente, SoftwareHouse } = global.db.models;
// --- FIM DA CORREÇÃO ---


describe("Integração do Model: Cedente", () => {
  let softwareHouse;
  jest.setTimeout(15000);

  beforeEach(async () => {
    await global.db.sequelize.sync({ force: true });

    // Correto: Precisamos criar a SoftwareHouse ANTES de criar o Cedente
    softwareHouse = await SoftwareHouse.create({
      data_criacao: new Date(),
      cnpj: "11111111000111",
      token: "TOKEN_DE_TESTE_SH",
      status: "ativo",
    });
  });

  // afterAll foi removido (corretamente)

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