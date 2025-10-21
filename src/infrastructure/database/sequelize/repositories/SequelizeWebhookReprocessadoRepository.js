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
        if (filters.protocolo) { // Assumindo que o filtro 'id' na query string se refere ao 'protocolo'
            where.protocolo = filters.protocolo;
        }
        if (filters.kind) {
            where.kind = filters.kind;
        }
        if (filters.type) {
            where.type = filters.type;
        }
        // Exemplo para filtrar dentro do JSONB 'data' (requer sintaxe específica do dialect, ex: PostgreSQL)
        // Atenção: A forma 'data.produto' pode não funcionar diretamente com Sequelize sem configuração adicional
        // if (filters.product && this.webhookReprocessadoModel.sequelize.options.dialect === 'postgres') {
        //     where['data.produto'] = filters.product; // Pode funcionar para queries simples
        //     // Para queries mais complexas dentro do JSON, pode ser necessário usar Sequelize.json ou Op.contains
        //     // Ex: where.data = { [Op.contains]: { produto: filters.product } };
        // }
         if (filters.product) {
              // Ajuste conforme a estrutura real do seu JSON 'data' e o dialeto do DB
              // Exemplo mais seguro para PostgreSQL usando notação de path em JSONB
              where[`data::jsonb ->> 'produto'`] = filters.product;
         }

        // Adicione aqui a lógica para filtrar pelo array `filters.id` (IDs de serviço) se necessário.
        // Isso pode ser complexo dependendo de como `servico_id` está armazenado (TEXT vs JSONB)
        // Exemplo conceitual se servico_id fosse JSONB no PostgreSQL:
        // if (filters.id && Array.isArray(filters.id) && filters.id.length > 0 && this.webhookReprocessadoModel.sequelize.options.dialect === 'postgres') {
        //    where.servico_id = { [Op.contains]: filters.id }; // Verifica se o array JSONB contém ALGUM dos IDs
        // }


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

    // Deprecado: Renomeado para listByDateRangeAndFilters para clareza
    // async findByFilters(filters) { ... }
}