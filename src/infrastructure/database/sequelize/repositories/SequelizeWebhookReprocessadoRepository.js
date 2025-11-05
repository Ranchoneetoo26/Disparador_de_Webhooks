"use strict";
const { models, sequelize, Sequelize } = require("../models/index.cjs");

class SequelizeWebhookReprocessadoRepository {
  constructor() {
    this.sequelize = sequelize;
    this.Op = Sequelize.Op;
  }

  async listByDateRangeAndFilters({ startDate, endDate, filters }) {
    const { Op, sequelize } = this;

    const where = {
      data_criacao: {
        [Op.between]: [startDate, endDate],
      },
    };

    if (filters && filters.protocolo) {
      where.protocolo = filters.protocolo;
    }
    if (filters && filters.kind) {
      where.kind = filters.kind;
    }
    if (filters && filters.type) {
      where.type = filters.type;
    }

    if (filters && filters.product) {
      where[Op.and] = [
        sequelize.where(sequelize.literal("data->>'product'"), filters.product),
      ];
    }

    if (
      filters &&
      filters.id &&
      Array.isArray(filters.id) &&
      filters.id.length > 0
    ) {
      where.servico_id = {
        [Op.contains]: filters.id,
      };
    }

    return models.WebhookReprocessado.findAll({ where });
  }

  async findByProtocolo(protocolo) {
    if (!protocolo) {
      return null;
    }
    return models.WebhookReprocessado.findOne({
      where: { protocolo: protocolo.protocolo },
    });
  }

  async create(data) {
    if (!data) {
      throw new Error("Data is required for creation");
    }
    return models.WebhookReprocessado.create(data);
  }
}

module.exports = SequelizeWebhookReprocessadoRepository;
