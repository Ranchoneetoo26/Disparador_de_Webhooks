// tests/integration/routes/cedente.test.js
'use strict';

// Usamos 'import * as db' para carregar todas as exportações do seu index.js
// em um único objeto 'db', resolvendo os conflitos de módulo.
import * as db from '@database';

// Extraímos os models e a conexão sequelize de dentro do objeto db.
const { Cedente, sequelize } = db;

// Descrevemos a suíte de testes para o model Cedente.
describe('Integração do Model: Cedente', () => {
  // Aumenta o tempo limite dos testes, se necessário (ex: banco de dados lento).
  jest.setTimeout(15000);

  // ANTES DE TUDO: Conecta e sincroniza o banco de dados.
  // 'force: true' apaga e recria as tabelas. Ótimo para um ambiente de teste limpo.
  beforeAll(async () => {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
  });

  // ANTES DE CADA TESTE: Limpa a tabela Cedente.
  // Isso garante que um teste não interfira no resultado do outro.
  beforeEach(async () => {
    await Cedente.destroy({ where: {}, truncate: true });
  });

  // DEPOIS DE TUDO: Fecha a conexão com o banco para o Jest encerrar.
  afterAll(async () => {
    await sequelize.close();
  });

  // Teste 1: Verifica se a criação de um Cedente funciona.
  test('deve CRIAR um novo Cedente com dados válidos', async () => {
    // Arrange: Prepara os dados que vamos inserir.
    const payload = {
      cnpj: '12345678000199',
      token: 1,
      status: 'ativo',
      configuracao_notificacao: { webhook: 'https://example.com/hook' },
    };

    // Act: Executa a ação de criar o registro no banco.
    const cedenteCriado = await Cedente.create(payload);

    // Assert: Verifica se o resultado foi o esperado.
    expect(cedenteCriado).toBeDefined();
    expect(cedenteCriado.id).toBeGreaterThan(0);
    expect(cedenteCriado.cnpj).toBe(payload.cnpj);
  });

  // Teste 2: Verifica se a busca por um registro funciona.
  test('deve ENCONTRAR um Cedente pelo seu CNPJ', async () => {
    // Arrange: Cria um registro para podermos buscar depois.
    const payload = {
      cnpj: '98765432000199',
      token: 2,
      status: 'ativo',
      configuracao_notificacao: { webhook: 'https://example.com/hook2' },
    };
    await Cedente.create(payload);

    // Act: Tenta encontrar o registro que acabamos de criar.
    const cedenteEncontrado = await Cedente.findOne({ where: { cnpj: payload.cnpj } });

    // Assert: Verifica se o registro foi encontrado e os dados estão corretos.
    expect(cedenteEncontrado).not.toBeNull();
    expect(cedenteEncontrado.cnpj).toBe(payload.cnpj);
  });

  // Teste 3: Verifica se a atualização funciona.
  test('deve ATUALIZAR o status de um Cedente', async () => {
    // Arrange: Cria um registro inicial.
    const cedente = await Cedente.create({
      cnpj: '11223344000199',
      token: 3,
      status: 'ativo',
      configuracao_notificacao: {},
    });

    // Act: Atualiza o status do registro.
    await cedente.update({ status: 'inativo' });

    // Assert: Busca o registro novamente e confere se o status mudou.
    const cedenteAtualizado = await Cedente.findByPk(cedente.id);
    expect(cedenteAtualizado.status).toBe('inativo');
  });

  // Teste 4: Verifica se a exclusão funciona.
  test('deve DELETAR um Cedente', async () => {
    // Arrange: Cria um registro para deletar.
    const cedente = await Cedente.create({
      cnpj: '55667788000199',
      token: 4,
      status: 'ativo',
      configuracao_notificacao: {},
    });

    // Act: Deleta o registro.
    await cedente.destroy();

    // Assert: Tenta buscar o registro deletado e espera não encontrar (null).
    const cedenteDeletado = await Cedente.findByPk(cedente.id);
    expect(cedenteDeletado).toBeNull();
  });
});