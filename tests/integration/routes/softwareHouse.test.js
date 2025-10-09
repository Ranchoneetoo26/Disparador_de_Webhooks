// tests/integration/routes/softwareHouse.test.js
'use strict';

import * as db from '@database';
// Pega o model e o sequelize da sua conexão central
const { SoftwareHouse, sequelize } = db;

describe('Integration: SoftwareHouse model', () => {
  jest.setTimeout(10000);

  beforeAll(async () => {
    // Usa a conexão já existente
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  // Limpa a tabela antes de cada teste para evitar interferência
  beforeEach(async () => {
      await SoftwareHouse.destroy({ where: {}, truncate: true });
  });

  test('deve criar e recuperar uma SoftwareHouse', async () => {
    const payload = {
      cnpj: '12345678000199',
      token: 'tokentest-1234',
      status: 'ativo',
    };

    const created = await SoftwareHouse.create(payload);
    expect(created).toBeDefined();
    expect(created.cnpj).toBe(payload.cnpj);

    const found = await SoftwareHouse.findByPk(created.id);
    expect(found).not.toBeNull();
    expect(found.status).toBe('ativo');
  });

  test('deve falhar ao criar uma SoftwareHouse com CNPJ duplicado', async () => {
    const payload = {
      cnpj: '99887766000155',
      token: 'token-unico-1',
      status: 'ativo',
    };
    // Cria o primeiro registro
    await SoftwareHouse.create(payload);

    // Tenta criar o segundo com o mesmo CNPJ
    // O uso de expect.assertions garante que o catch foi executado
    expect.assertions(1); 
    try {
      await SoftwareHouse.create({ ...payload, token: 'token-unico-2' });
    } catch (error) {
      // Verifica se o erro é de violação de constraint única
      expect(error.name).toContain('UniqueConstraintError');
    }
  });
});