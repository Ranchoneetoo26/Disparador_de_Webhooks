'use strict';
import { jest } from '@jest/globals';
import db from '@database';

const { Convenio, Conta, Cedente, SoftwareHouse, sequelize } = db;

describe('Integration: Convenio model', () => {
  jest.setTimeout(10000);

  beforeEach(async () => {
    await sequelize.sync({ force: true });
    const softwareHouse = await SoftwareHouse.create({
      cnpj: '11111111000111',
      token: 'TOKEN_SH_TESTE',
      status: 'ativo'
    });
    const cedente = await Cedente.create({
      cnpj: '22222222000122',
      token: softwareHouse.id,
      status: 'ativo'
    });
    await Conta.create({
      id: 1,
      produto: 'boleto',
      banco_codigo: '341',
      cedente_id: cedente.id,
      status: 'ativa'
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('deve criar um novo Convenio', async () => {
    const payloadConvenio = {
      numero_convenio: '1234567',
      conta_id: 1,
    };
    const convenioCriado = await Convenio.create(payloadConvenio);
    expect(convenioCriado).toBeDefined();
    expect(convenioCriado.numero_convenio).toBe(payloadConvenio.numero_convenio);
  });
});