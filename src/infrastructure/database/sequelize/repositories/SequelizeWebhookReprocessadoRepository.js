// src/infrastructure/database/sequelize/repositories/SequelizeWebhookRepository.js
'use strict';

// CORREÇÃO: Importamos 'db' como o export default do arquivo .cjs
import db from '../models/index.cjs';
const { models, sequelize } = db;
const { Op } = db.Sequelize; // Pegando o Op do Sequelize importado

export default class SequelizeWebhookRepository {
  constructor() {
    this.webhookModel = models.WebhookModel;
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
          [Op.in]: ids,
        },
      },
    });
  }

  async update(id, data) {
    await this.webhookModel.update(data, {
      where: { id: id },
    });
  }
}