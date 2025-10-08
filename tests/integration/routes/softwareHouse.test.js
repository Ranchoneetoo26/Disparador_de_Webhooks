import { Sequelize, DataTypes } from 'sequelize';

import defineSoftwareHouseModel from '../../../models/SoftwareHouse.js';

describe('Integration tests - SoftwareHouse model (Postgres)', () => {
  let sequelize;
  let SoftwareHouse;

  const databaseUrl = process.env.TEST_DATABASE_URL || 'postgres://postgres:postgres@localhost:5433/disparador_test';

  beforeAll(async () => {
    sequelize = new Sequelize(databaseUrl, {
      dialect: 'postgres',
      logging: false,
    });


    SoftwareHouse = defineSoftwareHouseModel(sequelize, DataTypes);

    await sequelize.sync({ force: true });
  }, 20000);

  afterAll(async () => {
    if (sequelize) {
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
    });

    expect(novo).toHaveProperty('id');
    expect(typeof novo.id).toBe('number');

    const encontrado = await SoftwareHouse.findByPk(novo.id);
    expect(encontrado).not.toBeNull();
    expect(encontrado.cnpj).toBe('12345678000199');
  });

  test('constraint unique em cnpj funciona (violação causa erro)', async () => {
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
  });
});
