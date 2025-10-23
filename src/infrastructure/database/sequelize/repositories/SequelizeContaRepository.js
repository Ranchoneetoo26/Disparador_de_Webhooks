// src/infrastructure/database/sequelize/repositories/SequelizeContaRepository.js
import db from '../models/index.cjs';

class SequelizeContaRepository {
    constructor() {
        this.contaModel = db.Conta; // Usa o model Conta
        if (!this.contaModel) {
           throw new Error('ContaModel não encontrado.');
        }
    }

    /**
     * Encontra uma Conta pela sua chave primária (ID).
     * @param {number} id - O ID da Conta.
     * @returns {Promise<Conta|null>}
     */
    async findById(id) {
        if (!id) return null;
        return this.contaModel.findByPk(id);
    }

    // Adicione outros métodos se necessário (ex: findByCedenteId, create, etc.)
}

export default new SequelizeContaRepository();