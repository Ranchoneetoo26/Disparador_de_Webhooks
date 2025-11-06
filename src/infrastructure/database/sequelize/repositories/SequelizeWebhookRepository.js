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
