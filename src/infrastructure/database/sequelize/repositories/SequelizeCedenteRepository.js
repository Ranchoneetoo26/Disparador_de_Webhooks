// src/infrastructure/database/sequelize/repositories/SequelizeCedenteRepository.js
'use strict';

// CORREÇÃO: Importamos 'db' como o export default do arquivo .cjs
import db from '../models/index.cjs';
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
    // CORREÇÃO: Usamos 'models' que foi desestruturado do 'db' importado
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