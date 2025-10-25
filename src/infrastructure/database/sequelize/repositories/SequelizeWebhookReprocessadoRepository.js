import { Op } from 'sequelize';

export default class SequelizeWebhookReprocessadoRepository {
    constructor({ WebhookReprocessadoModel }) {
        if (!WebhookReprocessadoModel) {
            throw new Error('WebhookReprocessadoModel is required in constructor');
        }
        this.webhookReprocessadoModel = WebhookReprocessadoModel;
    }

    // Método para listar protocolos com filtros (usado por ListarProtocolosUseCase)
    async listByDateRangeAndFilters({ startDate, endDate, filters }) {
        const where = {
            data_criacao: {
                [Op.between]: [startDate, endDate] // Usa as datas já convertidas
            }
        };

        // Aplica filtros opcionais
        if (filters.protocolo) { // Assumindo que o filtro 'id' na query string se refere ao 'protocolo' nos filtros internos
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

    // Método para buscar um protocolo específico (usado por ConsultarProtocoloUseCase)
    async findByProtocolo(protocolo) {
        if (!protocolo) {
            return null;
        }
        return this.webhookReprocessadoModel.findOne({
            where: { protocolo: protocolo }
        });
    }

    // Método para criar um registro (usado por ReenviarWebhookUseCase)
    async create(data) {
       if (!data) {
           throw new Error('Data is required for creation');
       }
       return this.webhookReprocessadoModel.create(data);
    }
}