// src/domain/repositories/ICedenteRepository.js
'use strict';

/**
 * Interface (Contrato) para o repositório de Cedentes.
 * Usado principalmente para autenticação.
 */
export default class ICedenteRepository {
  /**
   * Busca um cedente pelo CNPJ e Token.
   * @param {string} cnpj
   * @param {string} token
   * @returns {Promise<object | null>} O cedente ou null.
   */
  async findByCnpjAndToken(cnpj, token) {
    throw new Error('Método "findByCnpjAndToken" não implementado');
  }

  /**
   * Busca um cedente pelo ID.
   * @param {number} id
   * @returns {Promise<object | null>} O cedente ou null.
   */
  async findById(id) {
    throw new Error('Método "findById" não implementado');
  }

  // Outros métodos como listAll() podem ser adicionados se necessário.
}