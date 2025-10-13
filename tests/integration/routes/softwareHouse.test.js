'use strict';
import { jest } from '@jest/globals';
import db from '@database';

const { SoftwareHouse, sequelize } = db;

describe('Integration: SoftwareHouse model', () => {
  jest.setTimeout(10000);

  beforeEach(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('deve criar e recuperar uma SoftwareHouse', async () => {
    const payload = {
      cnpj: '11111111000111',
      token: 'TOKEN_DE_TESTE_SH',
      status: 'ativo'
    };
    const softwareHouseCriada = await SoftwareHouse.create(payload);
    const softwareHouseEncontrada = await SoftwareHouse.findByPk(softwareHouseCriada.id);
    expect(softwareHouseEncontrada).toBeDefined();
    expect(softwareHouseEncontrada.cnpj).toBe(payload.cnpj);
  });
});