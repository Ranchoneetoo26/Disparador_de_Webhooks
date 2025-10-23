// src/infrastructure/database/sequelize/repositories/SequelizeWebhookReprocessadoRepository.js
import { Op } from 'sequelize';
import db from '../models/index.cjs'; // <<< Importa o 'db' que contém os models

export default class SequelizeWebhookReprocessadoRepository {
    constructor() { // <<< Ajustado para não precisar receber o model, pega direto do db importado
        // Pega o model diretamente do objeto db importado
        this.webhookReprocessadoModel = db.WebhookReprocessado;
        if (!this.webhookReprocessadoModel) {
            throw new Error('WebhookReprocessadoModel não encontrado. Verifique a exportação em models/index.cjs.');
        }
    }

    // Método para listar protocolos com filtros (usado por ListarProtocolosUseCase)
    async listByDateRangeAndFilters({ startDate, endDate, filters }) {
        const where = {
            data_criacao: {
                [Op.between]: [startDate, endDate]
            }
        };

        // Aplica filtros opcionais
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
            // Assume PostgreSQL e JSONB no campo 'data'
            // Acessa a propriedade 'product' dentro do JSON 'data'
             where[Op.and] = where[Op.and] || []; // Garante que where[Op.and] seja um array
             where[Op.and].push(
                 // Use db.sequelize.json para acessar campos JSON de forma segura
                 // db.sequelize.json('data.product', filters.product) // Sintaxe mais antiga
                  db.sequelize.where(db.sequelize.json('data.product'), filters.product) // Sintaxe preferida
             );

             // Alternativa (menos segura ou específica do dialect):
             // where['data.product'] = filters.product; // Pode funcionar em alguns casos simples
             // where[`data::jsonb ->> 'product'`] = filters.product; // Específico do PostgreSQL
        }

        // TODO: Adicionar lógica para filtrar por filters.id (array de servico_id) se necessário


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

    // Método para criar um registro (usado por CriarReprocessamentoUseCase)
    async create(data) {
       if (!data) {
           throw new Error('Data is required for creation');
       }
       // Garante que o ID seja o protocolo se não for passado explicitamente
       if (!data.id && data.protocolo) {
           data.id = data.protocolo;
       }
       return this.webhookReprocessadoModel.create(data);
    }

    /**
     * Atualiza o status de um registro WebhookReprocessado pelo protocolo.
     * @param {string} protocolo - O UUID do protocolo a ser atualizado.
     * @param {string} novoStatus - O novo status (ex: 'SENT', 'FAILED').
     * @returns {Promise<[number]>} Retorna um array com o número de linhas afetadas.
     */
    async updateStatus(protocolo, novoStatus) {
        if (!protocolo || !novoStatus) {
            throw new Error('Protocolo e novoStatus são obrigatórios para updateStatus.');
        }
        return this.webhookReprocessadoModel.update(
            { status: novoStatus }, // Objeto com os campos a serem atualizados
            {
                where: { protocolo: protocolo } // Condição para encontrar o registro
            }
        );
    }

}