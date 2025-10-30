// src/infrastructure/database/sequelize/repositories/SequelizeCedenteRepository.js
'use strict';

// --- CORREÇÃO AQUI ---
import * as dbCjs from '../models/index.cjs';
const db = dbCjs.default; // O export real está no '.default'
// --- FIM DA CORREÇÃO ---
const { models, sequelize } = db;

export default class SequelizeCedenteRepository {
  constructor() {
    this.db = sequelize;
    if (!models || !models.Cedente) {
      throw new Error('Model "Cedente" não foi carregado em SequelizeCedenteRepository');
    }
  }
  // ... (Resto dos métodos findByCnpjAndToken, etc)
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