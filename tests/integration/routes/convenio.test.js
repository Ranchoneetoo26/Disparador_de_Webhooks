// tests/integration/routes/convenio.test.js
'use strict';

import * as db from '@database';
// DIFERENÇA 1: Importa apenas o model Convenio
const { Convenio, sequelize } = db;

describe('Integration: Convenio model', () => {
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
    // Limpa a tabela usada no teste
    await Convenio.destroy({ where: {}, truncate: true });
  });
  // --- FIM DA ESTRUTURA IGUAL ---

  test('deve criar um novo Convenio', async () => {
    // DIFERENÇA 2: Não precisa criar pré-requisitos

    // DIFERENÇA 3: O payload (dados) é específico para Convenio
    const payloadConvenio = {
      numero: '1234567',
      descricao: 'Convênio com Banco Exemplo',
    };
    const convenioCriado = await Convenio.create(payloadConvenio);

    expect(convenioCriado).toBeDefined();
    expect(convenioCriado.numero).toBe(payloadConvenio.numero);
    expect(convenioCriado.descricao).toBe(payloadConvenio.descricao);
  });
});