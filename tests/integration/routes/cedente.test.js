// tests/integration/routes/cedente.test.js
'use strict';

import * as db from '@database';
const { Cedente, sequelize } = db;
describe('Integration: Cedente model', () => {
  // aumenta timeout se necessário (opcional)
  jest.setTimeout(10000);

  beforeAll(async () => {
    // garante que a conexão está ok
    await sequelize.authenticate();

    // cria as tabelas a partir dos models. Se você usa migrations no teste, remova/ajuste isso.
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    // fecha a conexão para o Jest encerrar corretamente
    await sequelize.close();
  });

  test('cria, recupera e deleta um Cedente', async () => {
    // dados de teste (cnpj deve ser único)
    const payload = {
      cnpj: `0000000000${Date.now()}`.slice(0, 14),
      token: 1, // ajuste se tiver FK validando; em ambiente de teste simples, pode ser qualquer inteiro
      status: 'ativo',
      configuracao_notificacao: { webhook: 'https://example.com/hook' },
    };

    // cria
    const created = await Cedente.create(payload);

    // checa se foi criado
    expect(created).toBeDefined();
    expect(created.id).toBeGreaterThan(0);
    expect(created.cnpj).toBe(payload.cnpj);
    expect(created.status).toBe(payload.status);

    // busca pelo CNPJ
    const found = await Cedente.findOne({ where: { cnpj: payload.cnpj } });
    expect(found).not.toBeNull();
    expect(found.cnpj).toBe(payload.cnpj);
    expect(found.configuracao_notificacao).toMatchObject(payload.configuracao_notificacao);

    // atualiza um campo e verifica
    await found.update({ status: 'inativo' });
    const updated = await Cedente.findByPk(found.id);
    expect(updated.status).toBe('inativo');

    // remove
    await updated.destroy();
    const afterDelete = await Cedente.findByPk(found.id);
    expect(afterDelete).toBeNull();
  });
});
