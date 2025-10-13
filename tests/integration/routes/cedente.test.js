'use strict';

import { jest } from '@jest/globals';
import db from '@database';

const { Cedente, SoftwareHouse, sequelize } = db;

describe('Integração do Model: Cedente', () => {
  jest.setTimeout(15000);

  beforeEach(async () => {
   
    await sequelize.sync({ force: true });

    await SoftwareHouse.create({
      id: 1, // ID fixo para facilitar a referência no teste
      cnpj: '11111111000111',
      token: 'TOKEN_DE_TESTE_SH',
      status: 'ativo',
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('deve CRIAR um novo Cedente com dados válidos', async () => {
    // Arrange
    const payload = {
      cnpj: '12345678000199',
      token: 1,
      status: 'ativo',
    };

    // Act
    const cedenteCriado = await Cedente.create(payload);

    // Assert
    expect(cedenteCriado).toBeDefined();
    expect(cedenteCriado.cnpj).toBe(payload.cnpj);
    expect(cedenteCriado.token).toBe(1);
  });
});