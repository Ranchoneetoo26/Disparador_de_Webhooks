"use strict";
class ISoftwareHouseRepository {
  /**
   * @param {string} cnpj
   * @param {string} token
   * @returns {Promise<object | null>}
   */
  async findByCnpjAndToken(cnpj, token) {
    throw new Error('Método "findByCnpjAndToken" não implementado');
  }

  /**
   * @param {number} id
   * @returns {Promise<object | null>}
   */
  async findById(id) {
    throw new Error('Método "findById" não implementado');
  }
}

module.exports = ISoftwareHouseRepository;
