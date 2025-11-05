/* eslint-disable no-undef */
import { describe, test, expect, beforeAll } from '@jest/globals';

// --- CORREÇÃO AQUI ---
// 1. Importamos o 'dbCjs'
import dbCjs from '../../../src/infrastructure/database/sequelize/models/index.cjs';
// 2. O 'dbCjs' JÁ É o objeto que queremos. Não precisamos do '.default'.
const { Cedente, SoftwareHouse } = dbCjs.models;
// --- FIM DA CORREÇÃO ---

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

    const found = await Cedente.findByPk(cedente.id);
    expect(found.token).toBe(cedenteData.token);
  });
});