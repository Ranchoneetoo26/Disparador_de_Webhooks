import { Op } from 'sequelize';

export default class SequelizeWebhookRepository {
    constructor({ WebhookModel }) {
        if (!WebhookModel) {
            throw new Error('WebhookModel is required in constructor');
        }
        this.webhookModel = WebhookModel;
    }

    // Usado pelo ReenviarWebhookUseCase para buscar os registros originais
    async findByIds(product, ids) {
        // Implementação para buscar os registros na tabela Webhooks
        return this.webhookModel.findAll({
            where: {
                id: {
                    [Op.in]: ids 
                }
            }
        });
    }

    // Usado pelo ReenviarWebhookUseCase em caso de falha para incrementar tentativas
    async update(id, data) {
        return this.webhookModel.update(data, {
            where: { id: id }
        });
    }
}