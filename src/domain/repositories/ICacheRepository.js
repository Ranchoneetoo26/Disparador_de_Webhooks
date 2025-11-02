'use strict';
export default class ICacheRepository {
  /**
   * @param {string} key 
   * @returns {Promise<string | object | null>} 
   */
  async get(key) {
    throw new Error('Método "get" não implementado');
  }

  /**
   * @param {string} key - 
   * @param {string | object} value -
   * @param {object} [options] - 
   * @returns {Promise<boolean>} 
   */
  async set(key, value, options = {}) {
    throw new Error('Método "set" não implementado');
  }

  /**
   * @returns {Promise<void>}
   */
  async disconnect() {
    throw new Error('Método "disconnect" não implementado');
  }
}