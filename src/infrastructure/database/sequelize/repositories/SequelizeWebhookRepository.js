<<<<<<< HEAD
export default class SequelizeWebhookRepository {
    constructor({ WebhookModel }) {
        this.webhookModel = WebhookModel;
    }

    async findByIds(product, ids) {
        if (!ids || ids.length === 0) {
            return [];
        }
        const webhooks = await this.webhookModel.findAll({
            where: {
                id: ids,
            },
        });
        return webhooks.map(w => w.get({ plain: true }));
    }

    async update(id, data) {
        return this.webhookModel.update(data, {
            where: { id },
        });
    }
}
=======
"use strict";

const { models, Sequelize } = require("../models/index.cjs");

class SequelizeWebhookRepository {
  constructor() {}

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
}

module.exports = SequelizeWebhookRepository;
>>>>>>> 929a7ec6c858b3cadf7036896999f620d5e879bb
