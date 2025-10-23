// src/infrastructure/database/sequelize/repositories/SequelizeServicoRepository.js
import { Op } from 'sequelize';
import db from '../models/index.cjs';

class SequelizeServicoRepository {
    constructor() {
        this.servicoModel = db.Servico;
        if (!this.servicoModel) {
            throw new Error('ServicoModel não encontrado.');
        }
    }

    /**
     * Encontra múltiplos serviços pelos seus IDs.
     * Retorna apenas os serviços encontrados.
     * @param {string[]} ids - Array de IDs dos serviços a buscar.
     * @returns {Promise<Servico[]>} Array com as instâncias de Servico encontradas.
     */
    async findByIds(ids) {
        if (!ids || ids.length === 0) {
            return [];
        }
        // Converte IDs para número, se necessário (depende do tipo no banco)
        const numericIds = ids.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
        if (numericIds.length === 0) return [];

        return this.servicoModel.findAll({
            where: {
                id: {
                    [Op.in]: numericIds
                }
            }
        });
    }

    /**
     * Encontra um Serviço pela sua chave primária (ID).
     * @param {number | string} id - O ID do Serviço.
     * @returns {Promise<Servico|null>}
     */
    async findById(id) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) return null;
        return this.servicoModel.findByPk(numericId); // findByPk busca pela Primary Key
    }

    // Outros métodos do repositório...
}

export default new SequelizeServicoRepository();