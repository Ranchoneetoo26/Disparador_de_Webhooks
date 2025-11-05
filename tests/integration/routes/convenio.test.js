// Importe os models no topo do arquivo
const {
  sequelize,
  models,
} = require("../../../src/infrastructure/database/sequelize/models/index.cjs");
const { describe, expect, beforeEach, test } = require("@jest/globals");

const { Convenio, Conta, Cedente, SoftwareHouse } = models;

describe("Integration: Convenio model", () => {
  let softwareHouse, cedente, conta;

  beforeEach(async () => {
    await sequelize.sync({ force: true });

    // 1. CRIE A SOFTWAREHOUSE
    softwareHouse = await SoftwareHouse.create({
      cnpj: "11111111000111",
      token: "valid_token_sh",
      status: "ativo",
      data_criacao: new Date(),
    });

    // 2. CRIE O CEDENTE
    cedente = await Cedente.create({
      cnpj: "22222222000122",
      token: "valid_token_ced",
      status: "ativo",
      data_criacao: new Date(),
      software_house_id: softwareHouse.id, // <--- CORREÇÃO 1
    });

    // 3. CRIE A CONTA
    conta = await Conta.create({
      produto: "pix",
      banco_codigo: "001",
      status: "ativo",
      data_criacao: new Date(),
      cedente_id: cedente.id, // <--- CORREÇÃO 2
    });
  });

  // ... (remova o afterAll daqui)

  test("deve criar um novo Convenio", async () => {
    // 4. AGORA TESTE O CONVENIO
    const convenio = await Convenio.create({
      numero_convenio: "1234567",
      data_criacao: new Date(),
      conta_id: conta.id, // <--- CORREÇÃO 3
    });

    expect(convenio).toBeDefined();
    expect(convenio.numero_convenio).toBe("1234567");
    expect(convenio.conta_id).toBe(conta.id);
  });
});
