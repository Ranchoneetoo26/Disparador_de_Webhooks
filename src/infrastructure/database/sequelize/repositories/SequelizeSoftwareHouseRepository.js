// src/infrastructure/database/sequelize/repositories/SequelizeSoftwareHouseRepository.js
'use strict';

// --- CORREÇÃO AQUI ---
import * as dbCjs from '../models/index.cjs';
const db = dbCjs.default; // O export real está no '.default'
// --- FIM DA CORREÇÃO ---
const { models, sequelize } = db;

export default class SequelizeSoftwareHouseRepository {
  constructor() {
    this.db = sequelize;
    if (!models || !models.SoftwareHouse) {
      throw new Error('Model "SoftwareHouse" não foi carregado em SequelizeSoftwareHouseRepository');
    }
  }
  // ... (Resto dos métodos)
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
  async listarTodos() {
    return models.SoftwareHouse.findAll();
  }
}