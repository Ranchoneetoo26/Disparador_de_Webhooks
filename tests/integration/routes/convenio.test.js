'use strict';

import { jest } from '@jest/globals';
// 1. CORREÇÃO PRINCIPAL: Importar o 'default' diretamente.
import db from '@database';

// Agora a desestruturação funciona. Importamos TUDO que vamos precisar.
const { Convenio, Conta, Cedente, SoftwareHouse, sequelize } = db;

describe('Integration: Convenio model', () => {
  jest.setTimeout(10000);

  beforeAll(async () => {
    // Isto agora vai funcionar
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
  });

  // 2. CORREÇÃO DA LÓGICA: Criar toda a cadeia de dependências
  beforeEach(async () => {
    // Limpa as tabelas na ordem inversa da criação para não violar as chaves estrangeiras
    await Convenio.destroy({ where: {}, truncate: true });
    await Conta.destroy({ where: {}, truncate: true });
    await Cedente.destroy({ where: {}, truncate: true });
    await SoftwareHouse.destroy({ where: {}, truncate: true });

    // Cria os dados necessários em cascata
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
      produto: 'boleto',
      banco_codigo: '341',
      cedente_id: cedente.id, // Usa o ID do cedente criado acima
      status: 'ativa'
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('deve criar um novo Convenio', async () => {
    // Arrange: Buscar a conta que criamos para usar o ID dela
    const contaExistente = await Conta.findOne();
    
    const payloadConvenio = {
      numero_convenio: '1234567',
      conta_id: contaExistente.id, // Usa o ID da conta criada no beforeEach
    };
    
    // Act
    const convenioCriado = await Convenio.create(payloadConvenio);

    // Assert
    expect(convenioCriado).toBeDefined();
    expect(convenioCriado.numero_convenio).toBe(payloadConvenio.numero_convenio);
  });
});