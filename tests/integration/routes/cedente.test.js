import path from 'path';
import {
  jest,
  describe,
  expect,
  afterAll,
  beforeEach,
  test,
} from "@jest/globals";

import db from "../../../src/infrastructure/database/sequelize/models/index.cjs";
const { sequelize, models } = db;

const { Cedente, SoftwareHouse } = models;

describe("Integração do Model: Cedente", () => {
  let softwareHouse;
  jest.setTimeout(15000);

  beforeEach(async () => {

    try {
      console.log(`[${path.basename(expect.getState().testPath)}] Running sequelize.sync({ force: true })...`);
      await sequelize.sync({ force: true });
      console.log(`[${path.basename(expect.getState().testPath)}] sequelize.sync completed.`);
    } catch (syncError) {
      console.error(`[${path.basename(expect.getState().testPath)}] ERRO no sequelize.sync:`, syncError.message);
      throw syncError;
    }

    softwareHouse = await SoftwareHouse.create({
      data_criacao: new Date(),
      cnpj: "11111111000111",
      token: "TOKEN_DE_TESTE_SH",
      status: "ativo",
    });
  });

  afterAll(async () => {
    if (sequelize) {
      await sequelize.close();
    }
  });

  test("deve CRIAR um novo Cedente com dados válidos", async () => {
    const payload = {
      data_criacao: new Date(),
      cnpj: "12345678000199",
      token: "TOKEN_CEDENTE_TESTE",
      softwarehouse_id: softwareHouse.id,
      status: "ativo",
    };

    const cedente = await Cedente.create(payload);

    expect(cedente).toBeDefined();
    expect(cedente.id).toBeDefined();
    expect(cedente.cnpj).toBe(payload.cnpj);
    expect(cedente.token).toBe(payload.token);
    expect(cedente.softwarehouse_id).toBe(softwareHouse.id);
  });
});
