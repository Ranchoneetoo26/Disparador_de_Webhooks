'use strict';

export default class IServicoRepository {
    /**
     * @param {Array<string>} ids
     * @param {number} cedenteId
     * @returns {Promise<Array<object>>}
     */
    async findByIdsAndCedente(ids, cedenteId) {
        throw new Error('Método "findByIdsAndCedente" não implementado');
    }
}
