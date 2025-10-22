// src/infrastructure/database/sequelize/repositories/SequelizeWebhookRepository.js
import { Op } from 'sequelize';

export default class SequelizeWebhookRepository {
    constructor({ WebhookModel }) {
        if (!WebhookModel) {
            throw new Error('WebhookModel is required in constructor');
        }
        this.webhookModel = WebhookModel;
    }

    async findByIds(product, ids) {
        return this.webhookModel.findAll({
            where: {
                id: {
                    [Op.in]: ids 
                }
            }
        });
    }

    async update(id, data) {
        return this.webhookModel.update(data, {
            where: { id: id }
        });
    }
}