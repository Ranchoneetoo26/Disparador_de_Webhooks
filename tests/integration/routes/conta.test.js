'use strict';
import { jest } from '@jest/globals';
import db from '@database';

const { Conta, Cedente, SoftwareHouse, sequelize } = db;

describe('Integration: Conta model', () => {
  jest.setTimeout(10000);

  beforeEach(async () => {
    await sequelize.sync({ force: true });
    const softwareHouse = await SoftwareHouse.create({
      cnpj: '11111111000111',
      token: 'TOKEN_DE_TESTE_SH',
      status: 'ativo'
    });
    await Cedente.create({
      id: 1,
      cnpj: '22222222000122',
      token: softwareHouse.id,
      status: 'ativo'
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('deve criar uma nova Conta associada a um Cedente', async () => {
    const payloadConta = {
      produto: 'boleto',
      banco_codigo: '341',
      status: 'ativa',
      cedente_id: 1,
    };
    const contaCriada = await Conta.create(payloadConta);
    expect(contaCriada).toBeDefined();
    expect(contaCriada.produto).toBe(payloadConta.produto);
    expect(contaCriada.cedente_id).toBe(1);
  });
});