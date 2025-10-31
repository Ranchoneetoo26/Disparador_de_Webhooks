// src/domain/repositories/ISoftwareHouseRepository.js
'use strict';

/**
 * Interface (Contrato) para o repositório de Software Houses.
 * Usado principalmente para autenticação.
 */
export default class ISoftwareHouseRepository {
  /**
   * Busca uma Software House pelo CNPJ e Token.
   * @param {string} cnpj
   * @param {string} token
   * @returns {Promise<object | null>} A Software House ou null.
   */
  async findByCnpjAndToken(cnpj, token) {
    throw new Error('Método "findByCnpjAndToken" não implementado');
  }

  /**
   * Busca uma Software House pelo ID.
   * @param {number} id
   * @returns {Promise<object | null>} A Software House ou null.
   */
  async findById(id) {
    throw new Error('Método "findById" não implementado');
  }
}