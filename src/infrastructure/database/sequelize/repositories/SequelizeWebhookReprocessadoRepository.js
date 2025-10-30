// src/infrastructure/database/sequelize/repositories/SequelizeWebhookReprocessadoRepository.js
'use strict';

export default class SequelizeWebhookReprocessadoRepository {
  constructor({ WebhookReprocessadoModel, sequelize, Op }) {
    if (!WebhookReprocessadoModel) {
      throw new Error('WebhookReprocessadoModel is required in constructor');
    }
    if (!sequelize) {
      throw new Error('sequelize is required in constructor');
    }
    if (!Op) {
      throw new Error('Op is required in constructor');
    }
    this.webhookReprocessadoModel = WebhookReprocessadoModel;
    this.sequelize = sequelize;
    this.Op = Op;
  }
  // ... (Resto dos métodos)
  async listByDateRangeAndFilters({ startDate, endDate, filters }) {
    const { Op } = this;
    const where = {
      data_criacao: {
        [Op.between]: [startDate, endDate],
      },
    };
    if (filters.protocolo) {
      where.protocolo = filters.protocolo;
    }
    if (filters.kind) {
      where.kind = filters.kind;
    }
    if (filters.type) {
      where.type = filters.type;
    }
    if (filters.product) {
      where[Op.and] = [
        this.sequelize.json("data.produto", filters.product)
      ];
    }
    if (filters.id && Array.isArray(filters.id) && filters.id.length > 0) {
      where.servico_id = {
        [Op.contains]: filters.id,
      };
    }
    return this.webhookReprocessadoModel.findAll({ where });
  }
  async findByProtocolo(protocolo) {
    if (!protocolo) {
      return null;
    }
    return this.webhookReprocessadoModel.findOne({
      where: { protocolo: protocolo },
    });
  }
  async create(data) {
    if (!data) {
      throw new Error('Data is required for creation');
    }
    return this.webhookReprocessadoModel.create(data);
  }
}