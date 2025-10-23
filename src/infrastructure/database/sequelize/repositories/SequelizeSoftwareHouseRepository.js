// src/infrastructure/database/sequelize/repositories/SequelizeSoftwareHouseRepository.js
import db from '../models/index.cjs';

class SequelizeSoftwareHouseRepository {
    constructor() {
        this.softwareHouseModel = db.SoftwareHouse;
        if (!this.softwareHouseModel) {
            throw new Error('SoftwareHouseModel não encontrado.');
        }
    }

    /**
     * Encontra uma SoftwareHouse ativa pelo CNPJ e Token.
     */
    async findByCnpjAndToken(cnpj, token) {
        if (!cnpj || !token) {
            return null;
        }
        return this.softwareHouseModel.findOne({
            where: {
                cnpj: cnpj,
                token: token,
                // status: 'ativo' // Descomente se quiser validar status na query
            }
        });
    }

    /**
     * Encontra uma SoftwareHouse pela sua chave primária (ID).
     * @param {number | string} id - O ID da SoftwareHouse.
     * @returns {Promise<SoftwareHouse|null>}
     */
    async findById(id) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) return null;
        return this.softwareHouseModel.findByPk(numericId); // findByPk busca pela Primary Key
    }

    // Outros métodos do repositório...
}

export default new SequelizeSoftwareHouseRepository();