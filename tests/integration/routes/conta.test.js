import { jest } from '@jest/globals';
import db from '@database';

const { Conta, Cedente, SoftwareHouse, sequelize } = db;

describe('Integration: Conta model', () => {
  let softwareHouse;
  jest.setTimeout(10000);

  beforeEach(async () => {
    await sequelize.sync({ force: true });
    
    // 1. CRIAÇÃO DO PRÉ-REQUISITO: SoftwareHouse (Necessária para a FK do Cedente)
    softwareHouse = await SoftwareHouse.create({
      data_criacao: new Date(),
      cnpj: '11111111000111',
      token: 'TOKEN_DE_TESTE_SH',
      status: 'ativo'
    });
    
    // 2. CRIAÇÃO DO CEDENTE (Agora com a FK e campos NOT NULL corretos)
    await Cedente.create({
      data_criacao: new Date(),
      id: 1,
      cnpj: '22222222000122',
      
      token: 'TOKEN_CEDENTE_1', 
      softwarehouse_id: softwareHouse.id,
      status: 'ativo'
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('deve criar uma nova Conta associada a um Cedente', async () => {
    const payloadConta = {
      data_criacao: new Date(),
      produto: 'boleto',
      banco_codigo: '341',
      status: 'ativa',
      cedente_id: 1, // ID do Cedente criado acima
    };
    const contaCriada = await Conta.create(payloadConta);
    expect(contaCriada).toBeDefined();
    expect(contaCriada.produto).toBe(payloadConta.produto);
    expect(contaCriada.cedente_id).toBe(1);
  });
});
