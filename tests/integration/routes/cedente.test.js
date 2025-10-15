import { jest, describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import db from '@database';

const { Cedente, SoftwareHouse, sequelize } = db;

describe('Integração do Model: Cedente', () => {
  let softwareHouse; // Variável para armazenar o pré-requisito
  jest.setTimeout(15000);

  beforeEach(async () => {
    // Recria as tabelas em cada teste
    await sequelize.sync({ force: true });

    // CRIAÇÃO DO PRÉ-REQUISITO: SoftwareHouse
    softwareHouse = await SoftwareHouse.create({

      data_criacao: new Date(),
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
      data_criacao: new Date(), // Adicionado data_criacao
      cnpj: '12345678000199',

      token: 'TOKEN_CEDENTE_TESTE',
      status: 'ativo',
      // CHAVE ESTRANGEIRA NECESSÁRIA:
      softwarehouse_id: softwareHouse.id,
    };

    // Act
    const cedenteCriado = await Cedente.create(payload);

    // Assert
    expect(cedenteCriado).toBeDefined();
    expect(cedenteCriado.cnpj).toBe(payload.cnpj);
    expect(cedenteCriado.token).toBe(payload.token);
    expect(cedenteCriado.softwarehouse_id).toBe(softwareHouse.id);
  });
});
