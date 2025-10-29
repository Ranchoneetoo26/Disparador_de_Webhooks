// src/infrastructure/http/providers/AxiosProvider.js
'use strict';

import axios from 'axios';

/**
 * Um provider simples para o cliente HTTP (Axios).
 * Isso abstrai o 'axios' para que o UseCase não dependa
 * diretamente da biblioteca, mas sim de um 'httpClient'
 * que tenha um método 'post'.
 */
class HttpClient {
  constructor() {
    this.client = axios.create();
  }

  /**
   * Realiza uma requisição POST.
   * @param {string} url
   * @param {object} data - O payload (body) da requisição.
   * @param {object} [config] - Configurações do Axios (ex: { timeout: 5000 }).
   * @returns {Promise<object>} A resposta do axios (ex: { status, data }).
   */
  async post(url, data, config = {}) {
    try {
      return await this.client.post(url, data, config);
    } catch (error) {
      // Se o servidor responder com um erro (4xx, 5xx), o axios joga um 'error'.
      // Nós queremos capturar a resposta que veio no erro (se existir).
      if (error.response) {
        return error.response;
      }
      // Se for um erro de rede (ex: timeout), joga o erro para o UseCase tratar.
      throw error;
    }
  }
}

// Exportamos uma instância única (Singleton)
export default new HttpClient();