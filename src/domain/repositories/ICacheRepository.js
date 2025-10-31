// src/domain/repositories/ICacheRepository.js
'use strict';

/**
 * Interface (Contrato) para um repositório de cache.
 * Define os métodos que qualquer implementação de cache (ex: Redis, Em memória)
 * deve fornecer para ser usada pela camada de aplicação (UseCases).
 */
export default class ICacheRepository {
  /**
   * Busca um valor no cache pela chave.
   * @param {string} key - A chave a ser buscada.
   * @returns {Promise<string | object | null>} O valor armazenado (parseado, se for JSON) ou null.
   */
  async get(key) {
    throw new Error('Método "get" não implementado');
  }

  /**
   * Armazena um valor no cache.
   * @param {string} key - A chave para armazenar.
   * @param {string | object} value - O valor a ser armazenado.
   * @param {object} [options] - Opções, como { ttl: 3600 } (tempo em segundos).
   * @returns {Promise<boolean>} True se foi salvo com sucesso, false caso contrário.
   */
  async set(key, value, options = {}) {
    throw new Error('Método "set" não implementado');
  }

  /**
   * Desconecta o cliente do cache.
   * @returns {Promise<void>}
   */
  async disconnect() {
    throw new Error('Método "disconnect" não implementado');
  }
}