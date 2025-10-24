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
<<<<<<< HEAD
         if (filters.product) {
              // Ajuste conforme a estrutura real do seu JSON 'data' e o dialeto do DB
              // Exemplo mais seguro para PostgreSQL usando notação de path em JSONB
              where[`data::jsonb ->> 'produto'`] = filters.product;
         }

=======
        if (filters.product) {
             // Exemplo para PostgreSQL (ajuste se a chave 'produto' estiver em outro nível no JSON 'data')
             // Esta sintaxe busca a chave 'produto' na raiz do JSONB 'data'
             where[`data::jsonb ->> 'produto'`] = filters.product;
        }

        // --- LÓGICA DO FILTRO DE ID (ARRAY) ATIVADA ---
        // Assume que filters.id é um array de strings vindo da query
        // E que a coluna 'servico_id' no banco de dados é do tipo JSONB (PostgreSQL)
        if (filters.id && Array.isArray(filters.id) && filters.id.length > 0) {
            // Op.contains (PostgreSQL): Verifica se o campo JSONB 'servico_id'
            // contém PELO MENOS UM dos elementos do array 'filters.id'.
            where.servico_id = {
                [Op.contains]: filters.id // Filtro ativado!
            };
        }
        // --- FIM DA LÓGICA ATIVADA ---
>>>>>>> e8eb97ff05622b90f384c5fbc829e82218ca52c7

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