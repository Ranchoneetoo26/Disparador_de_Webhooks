import { sequelize } from '../models/index.cjs';

export default class SequelizeCedenteRepository {
  constructor() {
    this.db = sequelize;
  }

  async findByToken(token) {
    if (!token) return null;

    return {
      id: 1,
      nome: 'Cedente de Teste',
      token,
      ativo: true,
    };
  }

  async findById(id) {
    if (!id) return null;

    return {
      id,
      nome: 'Cedente Mock',
      cnpj: '00.000.000/0001-00',
      ativo: true,
    };
  }

  async listarTodos() {
    return [
      { id: 1, nome: 'Cedente 1', ativo: true },
      { id: 2, nome: 'Cedente 2', ativo: false },
    ];
  }
}