import {
  sequelize,
  models,
} from "../../../src/infrastructure/database/sequelize/models/index.cjs";
import { describe, expect, afterAll, jest } from "@jest/globals";
const { Conta, Cedente, SoftwareHouse } = models;

describe("Integration: Conta model", () => {
  let softwareHouse;
  jest.setTimeout(10000);

  beforeEach(async () => {
    await sequelize.sync({ force: true });

    softwareHouse = await SoftwareHouse.create({
      data_criacao: new Date(),
      cnpj: "11111111000111",
      token: "TOKEN_DE_TESTE_SH",
      status: "ativo",
    });

    await Cedente.create({
      data_criacao: new Date(),
      id: 1,
      cnpj: "22222222000122",
      token: "TOKEN_CEDENTE_1",
      softwarehouse_id: softwareHouse.id,
      status: "ativo",
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test("deve criar uma nova Conta associada a um Cedente", async () => {
    const payloadConta = {
      data_criacao: new Date(),
      produto: "boleto",
      banco_codigo: "341",
      status: "ativa",
      cedente_id: 1,
    };

    const contaCriada = await Conta.create(payloadConta);

    expect(contaCriada).toBeDefined();
    expect(contaCriada.produto).toBe(payloadConta.produto);
    expect(contaCriada.cedente_id).toBe(1);
  });
});
