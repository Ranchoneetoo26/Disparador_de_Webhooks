// src/infrastructure/database/sequelize/repositories/SequelizeConvenioRepository.js
import db from '../models/index.cjs';

class SequelizeConvenioRepository {
    constructor() {
        this.convenioModel = db.Convenio; // Usa o model Convenio
        if (!this.convenioModel) {
           throw new Error('ConvenioModel não encontrado.');
        }
    }

    /**
     * Encontra um Convenio pela sua chave primária (ID).
     * @param {number} id - O ID do Convenio.
     * @returns {Promise<Convenio|null>}
     */
    async findById(id) {
        if (!id) return null;
        return this.convenioModel.findByPk(id); // findByPk busca pela Primary Key
    }

    // Adicione outros métodos se necessário (ex: findByNumero, create, etc.)
}

export default new SequelizeConvenioRepository();