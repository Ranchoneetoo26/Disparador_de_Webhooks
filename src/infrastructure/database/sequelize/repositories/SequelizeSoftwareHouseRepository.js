import { models, sequelize } from '../models/index.cjs';

export default class SequelizeSoftwareHouseRepository {
  constructor() {
    this.db = sequelize;
  }

  async findByCnpjAndToken(cnpj, token) {
    if (!cnpj || !token) return null;
    return models.SoftwareHouse.findOne({ where: { cnpj, token } });
  }

  async findByToken(token) {
    if (!token) return null;

    return models.SoftwareHouse.findOne({ where: { token } });
  }

  async findById(id) {
    if (!id) return null;

    return models.SoftwareHouse.findByPk(id);
  }

  async listarTodas() {
    return models.SoftwareHouse.findAll();
  }
}
