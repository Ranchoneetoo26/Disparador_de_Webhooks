'use strict';

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
} // <-- Esta é a chave '}' final correta