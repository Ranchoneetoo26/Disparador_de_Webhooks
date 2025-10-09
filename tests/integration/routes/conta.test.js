// tests/integration/routes/conta.test.js
'use strict';

import * as db from '@database';
// DIFERENÇA 1: Importa os models Conta e Cedente
const { Conta, Cedente, sequelize } = db;

describe('Integration: Conta model', () => {
  jest.setTimeout(10000);

  // --- ESTRUTURA IGUAL ---
  beforeAll(async () => {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Limpa as tabelas usadas no teste
    await Conta.destroy({ where: {}, truncate: true });
    await Cedente.destroy({ where: {}, truncate: true });
  });
  // --- FIM DA ESTRUTURA IGUAL ---

  test('deve criar uma nova Conta associada a um Cedente', async () => {
    // DIFERENÇA 2: Precisa criar um pré-requisito (Cedente)
    const cedente = await Cedente.create({
      cnpj: '11111111000111',
      token: 1,
      status: 'ativo',
      configuracao_notificacao: {}
    });

    // DIFERENÇA 3: O payload (dados) é específico para Conta
    const payloadConta = {
      agencia: '0001',
      numero: '12345-6',
      cedenteId: cedente.id, // Usa o ID do pré-requisito
    };
    const contaCriada = await Conta.create(payloadConta);

    expect(contaCriada).toBeDefined();
    expect(contaCriada.agencia).toBe(payloadConta.agencia);
    expect(contaCriada.cedenteId).toBe(cedente.id);
  });
});