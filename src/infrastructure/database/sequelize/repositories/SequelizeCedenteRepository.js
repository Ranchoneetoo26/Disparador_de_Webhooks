// src/infrastructure/database/sequelize/repositories/SequelizeCedenteRepository.js
import db from '../models/index.cjs';

class SequelizeCedenteRepository {
    constructor() {
        this.cedenteModel = db.Cedente;
        if (!this.cedenteModel) {
            throw new Error('CedenteModel não encontrado.');
        }
    }

    /**
     * Encontra um Cedente ativo pelo CNPJ, Token e ID da SoftwareHouse associada.
     */
    async findByCnpjTokenAndSoftwareHouseId(cnpj, token, softwareHouseId) {
        if (!cnpj || !token || !softwareHouseId) {
            return null;
        }
        return this.cedenteModel.findOne({
            where: {
                cnpj: cnpj,
                token: token,
                softwarehouse_id: softwareHouseId,
                // status: 'ativo' // Descomente se quiser validar status na query
            }
        });
    }

    /**
     * Encontra um Cedente ativo pelo CNPJ e Token. (Método antigo, mantido se necessário)
     */
    async findByCnpjAndToken(cnpj, token) {
        if (!cnpj || !token) {
            return null;
        }
        return this.cedenteModel.findOne({
            where: {
                cnpj: cnpj,
                token: token,
                // status: 'ativo' // Se necessário
            }
        });
    }

    /**
     * Encontra um Cedente pela sua chave primária (ID).
     * @param {number | string} id - O ID do Cedente.
     * @returns {Promise<Cedente|null>}
     */
    async findById(id) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) return null;
        return this.cedenteModel.findByPk(numericId); // findByPk busca pela Primary Key
    }

    // Outros métodos do repositório...
}

export default new SequelizeCedenteRepository();