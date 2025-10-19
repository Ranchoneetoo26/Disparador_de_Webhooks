import { Op } from 'sequelize';

export default class SequelizeWebhookReprocessadoRepository {
    constructor({ WebhookReprocessadoModel }) {
        this.webhookReprocessadoModel = WebhookReprocessadoModel;
    }

    async findByFilters(filters) {
        const where = {
            data_criacao: {
                [Op.between]: [new Date(filters.start_date), new Date(filters.end_date)]
            }
        };

        if (filters.id) {
            where.protocolo = filters.id;
        }
        if (filters.kind) {
            where.kind = filters.kind;
        }
        if (filters.type) {
            where.type = filters.type;
        }
        if (filters.product) {
            where['data.produto'] = filters.product;
        }

        return this.webhookReprocessadoModel.findAll({ where });
    }
}