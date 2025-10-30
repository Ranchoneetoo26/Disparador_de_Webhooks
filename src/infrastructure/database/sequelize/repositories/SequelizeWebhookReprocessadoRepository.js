import { Op } from 'sequelize';

export default class SequelizeWebhookReprocessadoRepository {
    constructor({ WebhookReprocessadoModel }) {
        if (!WebhookReprocessadoModel) {
            throw new Error('WebhookReprocessadoModel is required in constructor');
        }
        this.webhookReprocessadoModel = WebhookReprocessadoModel;
    }

    async listByDateRangeAndFilters({ startDate, endDate, filters }) {
        const where = {
            data_criacao: {
                [Op.between]: [startDate, endDate] 
            }
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
              // Ajuste conforme a estrutura real do seu JSON 'data' e o dialeto do DB
              // Exemplo mais seguro para PostgreSQL usando notação de path em JSONB
              where[`data::jsonb ->> 'produto'`] = filters.product;
         }


        return this.webhookReprocessadoModel.findAll({ where });
    }

    async findByProtocolo(protocolo) {
        if (!protocolo) {
            return null;
        }
        return this.webhookReprocessadoModel.findOne({
            where: { protocolo: protocolo }
        });
    }

    async create(data) {
       if (!data) {
           throw new Error('Data is required for creation');
       }
       return this.webhookReprocessadoModel.create(data);
    }
}