import {
  sequelize,
  models,
} from "../../../src/infrastructure/database/sequelize/models/index.cjs";
import { describe, expect, afterAll, jest } from "@jest/globals";
const { Cedente, SoftwareHouse } = models;

describe("Integração do Model: Cedente", () => {
  let softwareHouse;
  jest.setTimeout(15000);

  beforeEach(async () => {
    await sequelize.sync({ force: true });

    softwareHouse = await SoftwareHouse.create({
      data_criacao: new Date(),
      cnpj: "11111111000111",
      token: "TOKEN_DE_TESTE_SH",
      status: "ativo",
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test("deve CRIAR um novo Cedente com dados válidos", async () => {
    const payload = {
      data_criacao: new Date(),
      cnpj: "12345678000199",
      token: "TOKEN_CEDENTE_TESTE",
      status: "ativo",
      softwarehouse_id: softwareHouse.id,
    };

    const cedenteCriado = await Cedente.create(payload);

    expect(cedenteCriado).toBeDefined();
    expect(cedenteCriado.cnpj).toBe(payload.cnpj);
    expect(cedenteCriado.token).toBe(payload.token);
    expect(cedenteCriado.softwarehouse_id).toBe(softwareHouse.id);
  });
});
