// --- INÍCIO DA CORREÇÃO ---
import db from "../../../src/infrastructure/database/sequelize/models/index.cjs";
const { sequelize, models } = db;
// --- FIM DA CORREÇÃO ---

import { describe, expect, beforeAll, afterAll, test } from "@jest/globals"; // 'it' foi trocado por 'test'
const { Convenio, Conta, Cedente, SoftwareHouse } = models;

describe("Integration: Convenio model", () => {
  let softwareHouse;
  let conta;
  let cedente;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    softwareHouse = await SoftwareHouse.create({
      cnpj: "11111111000111",
      token: "valid_token_sh",
      status: "ativo",
      data_criacao: new Date(),
    });

    cedente = await Cedente.create({
      cnpj: "22222222000122",
      token: "valid_token_ced",
      status: "ativo",
      softwarehouse_id: softwareHouse.id,
      data_criacao: new Date(),
    });

    conta = await Conta.create({
      cedente_id: cedente.id,
      produto: "boleto",
      banco_codigo: "341",
      status: "ativo",
      data_criacao: new Date(),
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test("deve criar um novo Convenio", async () => { // 'it' foi trocado por 'test'
    const convenioData = {
      numero_convenio: "1234567890",
      data_criacao: new Date(),
      conta_id: conta.id,
    };

    const convenioCriado = await Convenio.create(convenioData);

    expect(convenioCriado).toBeDefined();
    expect(convenioCriado.numero_convenio).toBe(convenioData.numero_convenio);
  });
});
