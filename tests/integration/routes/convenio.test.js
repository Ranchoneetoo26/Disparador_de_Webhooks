import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import database from '@database'; 
// Assumindo que global.db foi definido em jest.setup.cjs
const { Convenio, Cedente, SoftwareHouse, Conta } = global.db; 

describe('Integration: Convenio model', () => {
  let softwareHouse;
  let conta; // Será necessário criar uma Conta antes de criar o Convênio
  let cedente;

  // Cria pré-requisitos: SoftwareHouse, Cedente e Conta
  beforeAll(async () => {
    await database.sequelize.sync({ force: true }); // Limpa o DB
    
    // 1. Cria SoftwareHouse
    softwareHouse = await SoftwareHouse.create({
      cnpj: '11111111000111',
      token: 'valid_token_sh', 
      status: 'ativo',
      data_criacao: new Date()
    });

    // 2. Cria Cedente (depende de SoftwareHouse)
    cedente = await Cedente.create({
      cnpj: '22222222000122',
      token: 'valid_token_ced',
      status: 'ativo',
      softwarehouse_id: softwareHouse.id, // CHAVE ESTRANGEIRA CORRETA
      data_criacao: new Date()
    });
    
    // 3. Cria Conta (depende de Cedente - Verifique o seu esquema para campos NOT NULL da Conta)
    conta = await Conta.create({
        cedente_id: cedente.id, // CHAVE ESTRANGEIRA CORRETA
        produto: 'boleto',
        banco_codigo: '341',
        status: 'ativo',
        data_criacao: new Date()
    });
  });

  afterAll(async () => {
    await database.sequelize.close(); // Fecha a conexão
  });

  it('deve criar um novo Convenio', async () => {
    // Arrange:
    const convenioData = {
      numero_convenio: '1234567890',
      data_criacao: new Date(),
      conta_id: conta.id, // CHAVE ESTRANGEIRA CORRETA para Conta
    };

    // Act
    const convenioCriado = await Convenio.create(convenioData);

    // Assert
    expect(convenioCriado).toBeDefined();
    expect(convenioCriado.numero_convenio).toBe(convenioData.numero_convenio);
    // ... adicione mais asserções ...
  });
  
  // Você deve incluir outros testes da suite aqui...
});