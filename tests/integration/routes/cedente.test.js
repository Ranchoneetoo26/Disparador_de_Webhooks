<<<<<<< HEAD
/* eslint-disable no-undef */
import { describe, test, expect, beforeAll } from '@jest/globals';
=======
const { describe, expect, beforeEach, test } = require("@jest/globals");
>>>>>>> ac74577e24c01cb6576b44326ef20c19e70cd838

// --- CORREÇÃO AQUI ---
// 1. Importamos o 'dbCjs'
import dbCjs from '../../../src/infrastructure/database/sequelize/models/index.cjs';
// 2. O 'dbCjs' JÁ É o objeto que queremos. Não precisamos do '.default'.
const { Cedente, SoftwareHouse } = dbCjs.models;
// --- FIM DA CORREÇÃO ---

<<<<<<< HEAD
describe('Integration: Cedente Model Tests', () => {
  let softwareHouse;

  // Cria a SoftwareHouse (dependência)
  beforeAll(async () => {
    // O jest.setup.cjs já limpou o banco (sync: force)
  	 softwareHouse = await SoftwareHouse.create({
      cnpj: '12345678000199',
      token: 'sh_token_teste',
      status: 'ativo',
    });
  });
=======
describe("Integração do Model: Cedente", () => {
  let softwareHouse;
  jest.setTimeout(15000);
>>>>>>> ac74577e24c01cb6576b44326ef20c19e70cd838

  test('deve criar e recuperar um Cedente com dados válidos', async () => {
    const cedenteData = {
      cnpj: '98765432000188',
      token: 'ced_token_teste',
      status: 'ativo',
      software_house_id: softwareHouse.id,
    };
    const cedente = await Cedente.create(cedenteData);

    expect(cedente.id).toBeDefined();
    expect(cedente.cnpj).toBe(cedenteData.cnpj);

<<<<<<< HEAD
    const found = await Cedente.findByPk(cedente.id);
    expect(found.token).toBe(cedenteData.token);
  });
});
=======
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
>>>>>>> ac74577e24c01cb6576b44326ef20c19e70cd838
