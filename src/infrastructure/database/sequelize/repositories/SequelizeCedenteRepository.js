import { models, sequelize } from '../models/index.cjs';

export default class SequelizeCedenteRepository {
  constructor() {
    this.db = sequelize;
  }

  async findByCnpjAndToken(cnpj, token) {
    if (!cnpj || !token) return null;
    return models.Cedente.findOne({ where: { cnpj, token } });
  }

  async findByToken(token) {
    if (!token) return null;

    return models.Cedente.findOne({ where: { token } });
  }

  async findById(id) {
    if (!id) return null;

    return models.Cedente.findByPk(id);
  }

  async listarTodos() {
    return models.Cedente.findAll();
  }
}