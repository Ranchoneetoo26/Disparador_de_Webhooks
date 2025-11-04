'use strict';

// SequelizeWebhookRepository.js
// Repositório que acessa o model WebhookModel.
// Não lança erro no construtor se os models ainda não estiverem carregados.

export default class SequelizeWebhookRepository {
  constructor({ sequelize } = {}) {
    this.db = sequelize || null;
    this.models = (this.db && this.db.models) ? this.db.models : (global.models || null);
    this.webhookModel = this.models && this.models.WebhookModel ? this.models.WebhookModel : null;
  }

  _getWebhookModel() {
    if (!this.webhookModel) {
      if (this.db && this.db.models && this.db.models.WebhookModel) {
        this.webhookModel = this.db.models.WebhookModel;
      } else if (global && global.models && global.models.WebhookModel) {
        this.webhookModel = global.models.WebhookModel;
      }
    }

    if (!this.webhookModel) {
      throw new Error('Model "WebhookModel" não foi carregado corretamente.');
    }
    return this.webhookModel;
  }

  async findById(id) {
    if (!id) return null;
    const WebhookModel = this._getWebhookModel();
    return WebhookModel.findByPk(id);
  }

  async create(data) {
    if (!data) throw new Error('Data is required to create webhook');
    const WebhookModel = this._getWebhookModel();
    return WebhookModel.create(data);
  }

  // adicione outros métodos necessários usando _getWebhookModel()
}
