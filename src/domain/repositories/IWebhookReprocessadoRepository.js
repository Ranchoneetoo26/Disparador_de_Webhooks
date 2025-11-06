"use strict";
class IWebhookReprocessadoRepository {
  /**
   * @param {object} params
   * @param {Date} params.startDate
   * @param {Date} params.endDate
   * @param {object} params.filters
   * @returns {Promise<Array<object>>}
   */
  async listByDateRangeAndFilters({ startDate, endDate, filters }) {
    throw new Error('Método "listByDateRangeAndFilters" não implementado');
  }

  /**
   * @param {string} protocolo -
   * @returns {Promise<object | null>}
   */
  async findByProtocolo(protocolo) {
    throw new Error('Método "findByProtocolo" não implementado');
  }

  /**
   * @param {object} data -
   * @returns {Promise<object>}
   */
  async create(data) {
    throw new Error('Método "create" não implementado');
  }
}

module.exports = IWebhookReprocessadoRepository;
