// tests/integration/routes/softwareHouse.test.js
import { Sequelize, DataTypes } from 'sequelize';
import SoftwareHouseFactoryModule from '../../../models/SoftwareHouse.js'; // ajuste se necessário

describe('Integration tests - SoftwareHouse model (Postgres)', () => {
  let sequelize;
  let SoftwareHouse;

  // Constrói a URL de conexão a partir da env var TEST_DATABASE_URL (fallback local)
  const databaseUrl = process.env.TEST_DATABASE_URL || 'postgres://postgres:postgres@localhost:5433/disparador_test';

  beforeAll(async () => {
    // cria a conexão com Postgres (dialect postgres)
    sequelize = new Sequelize(databaseUrl, {
      dialect: 'postgres',
      logging: false,
    });

    // Normaliza export (pode ser default se model foi exportado com module.exports)
    const factory = SoftwareHouseFactoryModule && (SoftwareHouseFactoryModule.default || SoftwareHouseFactoryModule);
    SoftwareHouse = factory(sequelize, DataTypes);

    // Sincroniza o modelo no banco de teste (drop tabela se existir)
    await sequelize.sync({ force: true });
  }, 20000); // tempo maior caso o container demore a ficar pronto

  afterAll(async () => {
    if (sequelize) {
      // opcional: limpa o banco (drop) para manter ambiente limpo
      await sequelize.drop();
      await sequelize.close();
    }
  });

  test('modelo possui atributos com tipos e constraints corretos', () => {
    const attrs = SoftwareHouse.rawAttributes;

    // id
    expect(attrs).toHaveProperty('id');
    expect(['INTEGER', 'BIGINT']).toContain(attrs.id.type.key);
    expect(attrs.id.primaryKey).toBe(true);
    expect(attrs.id.autoIncrement).toBe(true);
    expect(attrs.id.allowNull).toBe(false);

    // data_criacao
    expect(attrs).toHaveProperty('data_criacao');
    expect(attrs.data_criacao.type.key).toBe('DATE');
    expect(attrs.data_criacao.allowNull).toBe(false);
    expect(attrs.data_criacao.defaultValue).toBeDefined();

    // cnpj
    expect(attrs).toHaveProperty('cnpj');
    expect(attrs.cnpj.type.key).toBe('STRING');
    if (attrs.cnpj.type.options && typeof attrs.cnpj.type.options.length !== 'undefined') {
      expect(attrs.cnpj.type.options.length).toBe(14);
    }
    expect(attrs.cnpj.allowNull).toBe(false);
    expect(attrs.cnpj.unique).toBe(true);

    // token
    expect(attrs).toHaveProperty('token');
    expect(attrs.token.type.key).toBe('STRING');
    expect(attrs.token.allowNull).toBe(false);

    // status
    expect(attrs).toHaveProperty('status');
    expect(attrs.status.type.key).toBe('STRING');
    expect(attrs.status.allowNull).toBe(false);
  });

  test('persistência: consegue criar e recuperar um registro', async () => {
    const novo = await SoftwareHouse.create({
      cnpj: '12345678000199',
      token: 'tokentest',
      status: 'ativo'
      // data_criacao será populado por default
    });

    expect(novo).toHaveProperty('id');
    expect(typeof novo.id).toBe('number');

    const encontrado = await SoftwareHouse.findByPk(novo.id);
    expect(encontrado).not.toBeNull();
    expect(encontrado.cnpj).toBe('12345678000199');
  });

  test('constraint unique em cnpj funciona (violação causa erro)', async () => {
    // já existe um registro com cnpj '12345678000199' do teste anterior
    let erro = null;
    try {
      await SoftwareHouse.create({
        cnpj: '12345678000199',
        token: 'outrotoken',
        status: 'ativo'
      });
    } catch (e) {
      erro = e;
    }
    expect(erro).toBeTruthy();
    // opcional: checar se é UniqueConstraintError
    // expect(erro.name).toBe('SequelizeUniqueConstraintError');
  });
});
