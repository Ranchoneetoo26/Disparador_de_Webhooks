// tests/integration/routes/conta.test.js
'use strict';

import { jest } from '@jest/globals';
import db from '@database';
// MUDANÇA 1: Importar também a SoftwareHouse, pois ela é uma dependência
const { Conta, Cedente, SoftwareHouse, sequelize } = db;

describe('Integration: Conta model', () => {
  jest.setTimeout(10000);

  beforeAll(async () => {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  // MUDANÇA 2: O beforeEach agora cria a cadeia completa de dependências
  beforeEach(async () => {
    // Limpa as tabelas na ordem inversa para não dar erro de chave estrangeira
    await Conta.destroy({ where: {}, truncate: true });
    await Cedente.destroy({ where: {}, truncate: true });
    await SoftwareHouse.destroy({ where: {}, truncate: true });
  });

  test('deve criar uma nova Conta associada a um Cedente', async () => {
    // Arrange (Parte 1): Criar a cadeia de pré-requisitos
    const softwareHouse = await SoftwareHouse.create({
      cnpj: '11111111000111',
      token: 'TOKEN_DE_TESTE_SH',
      status: 'ativo'
    });

    const cedente = await Cedente.create({
      cnpj: '22222222000122',
      token: softwareHouse.id, // Usa o ID da SoftwareHouse que acabamos de criar
      status: 'ativo'
    });

    // Arrange (Parte 2): Preparar o payload da Conta com os campos corretos
    const payloadConta = {
      produto: 'boleto',        // Campo correto do seu model
      banco_codigo: '341',     // Campo correto do seu model
      status: 'ativa',
      cedente_id: cedente.id,  // Usa o ID do Cedente criado acima
    };

    // Act: Criar a conta
    const contaCriada = await Conta.create(payloadConta);

    // Assert: Verificar o resultado
    expect(contaCriada).toBeDefined();
    expect(contaCriada.produto).toBe(payloadConta.produto);
    expect(contaCriada.cedente_id).toBe(cedente.id);
  });
});