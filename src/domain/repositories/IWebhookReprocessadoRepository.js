// src/domain/repositories/IWebhookReprocessadoRepository.js
'use strict';

/**
 * Interface (Contrato) para o repositório de Webhooks Reprocessados.
 * Define os métodos que a camada de aplicação usa para interagir
 * com os registros de protocolo, sem saber sobre o Sequelize.
 */
export default class IWebhookReprocessadoRepository {
  /**
   * Lista os protocolos com base em um intervalo de datas e filtros.
   * @param {object} params
   * @param {Date} params.startDate - Data de início.
   * @param {Date} params.endDate - Data de fim.
   * @param {object} params.filters - Filtros adicionais (protocolo, kind, type, product, id).
   * @returns {Promise<Array<object>>} Uma lista de registros de protocolo.
   */
  async listByDateRangeAndFilters({ startDate, endDate, filters }) {
    throw new Error('Método "listByDateRangeAndFilters" não implementado');
  }

  /**
   * Busca um registro de protocolo específico pelo seu UUID.
   * @param {string} protocolo - O UUID do protocolo.
   * @returns {Promise<object | null>} O registro do protocolo ou null se não for encontrado.
   */
  async findByProtocolo(protocolo) {
    throw new Error('Método "findByProtocolo" não implementado');
  }

  /**
   * Cria um novo registro de webhook reprocessado.
   * @param {object} data - Os dados a serem salvos.
   * @returns {Promise<object>} O registro criado.
   */
  async create(data) {
    throw new Error('Método "create" não implementado');
  }
}