'use strict';

import * as dbCjs from '../models/index.cjs';
const db = dbCjs.default; 
const { models, Sequelize } = db;
const { Op } = Sequelize;
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