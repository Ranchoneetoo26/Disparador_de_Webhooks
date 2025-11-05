"use strict";

const { models, Sequelize } = require("../models/index.cjs");

class SequelizeWebhookRepository {
  constructor() {}

<<<<<<< HEAD
import * as dbCjs from '../models/index.cjs';
const db = dbCjs.default; 
const { models, Sequelize } = db;
const { Op } = Sequelize;

export default class SequelizeWebhookRepository {
  constructor() {
    this.webhookModel = models.WebhookModel;
    this.Op = Op; // Adicionado para garantir que o 'Op' esteja no 'this'
    if (!this.webhookModel) {
      throw new Error('Model "WebhookModel" não foi carregado corretamente.');
     }
  }

  async findById(id) {
    return this.webhookModel.findByPk(id);
  }

  async findByIds(ids) {
    return this.webhookModel.findAll({
      where: {
        id: {
          [this.Op.in]: ids,
        },
      },
    });
  }

  async update(id, data) {
    await this.webhookModel.update(data, {
      where: { id: id },
    });
  }

  // --- MÉTODO NOVO ADICIONADO ---
  // O ReenviarWebhookUseCase precisa deste método para
  // validar se os IDs pertencem ao cedente que está logado.
  async findByIdsAndCedente(ids, cedenteId) {
    if (!ids || ids.length === 0 || !cedenteId) {
      return [];
    }
    return this.webhookModel.findAll({
      where: {
        id: {
          [this.Op.in]: ids
        },
        cedente_id: cedenteId
      }
    });
  }
}
=======
  async findById(id) {
    if (!id) return null;
    return models.WebhookReprocessado.findByPk(id);
  }

  async findByIds(ids) {
    return models.WebhookReprocessado.findAll({
      where: {
        id: {
          [Sequelize.Op.in]: ids,
        },
      },
    });
  }

  async update(id, data) {
    await models.WebhookReprocessado.update(data, {
      where: { id: id },
    });
  }

  // --- MÉTODO NOVO ADICIONADO ---
  // O ReenviarWebhookUseCase precisa deste método para
  // validar se os IDs pertencem ao cedente que está logado.
  async findByIdsAndCedente(ids, cedenteId) {
    if (!ids || ids.length === 0 || !cedenteId) {
      return [];
    }
    return models.WebhookReprocessado.findAll({
      where: {
        id: {
          [Sequelize.Op.in]: ids,
        },
        cedente_id: cedenteId,
      },
    });
  }
} // <-- Esta é a chave '}' final correta

module.exports = SequelizeWebhookRepository;
>>>>>>> ac74577e24c01cb6576b44326ef20c19e70cd838
