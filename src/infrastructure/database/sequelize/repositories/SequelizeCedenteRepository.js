'use strict';

import * as dbCjs from '../models/index.cjs';
const db = dbCjs.default;
const { models, sequelize } = db;

export default class SequelizeCedenteRepository {
  constructor() {
    this.db = sequelize;
    if (!models || !models.Cedente) {
      throw new Error('Model "Cedente" não foi carregado em SequelizeCedenteRepository');
    }
  }
  async findByCnpjAndToken(cnpj, token) {
    if (!cnpj || !token) return null;
    return models.Cedente.findOne({ where: { cnpj, token } });
  }
  async findById(id) {
    if (!id) return null;
    return models.Cedente.findByPk(id);
  }
  async listarTodos() {
    return models.Cedente.findAll();
  }
}