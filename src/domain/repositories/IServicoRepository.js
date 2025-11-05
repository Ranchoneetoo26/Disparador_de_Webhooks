"use strict";

class IServicoRepository {
  /**
   * @param {Array<string>} ids
   * @param {number} cedenteId
   * @returns {Promise<Array<object>>}
   */
  async findByIdsAndCedente(ids, cedenteId) {
    throw new Error('Método "findByIdsAndCedente" não implementado');
  }
}

module.exports = IServicoRepository;
