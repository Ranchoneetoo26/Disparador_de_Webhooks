import { sequelize } from '../models/index.cjs';

export default class SequelizeSoftwareHouseRepository {
  constructor() {
    this.db = sequelize;
  }

  async findByToken(token) {
    if (!token) return null;

    return {
      id: 1,
      nome: 'Software House Mock',
      token,
      ativo: true,
    };
  }

  async findById(id) {
    if (!id) return null;

    return {
      id,
      nome: 'Software House de Teste',
      cnpj: '11.111.111/0001-11',
      ativo: true,
    };
  }

  async listarTodas() {
    return [
      { id: 1, nome: 'Software House 1', ativo: true },
      { id: 2, nome: 'Software House 2', ativo: false },
    ];
  }
}
