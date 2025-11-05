"use strict";

const axios = require("axios");

class HttpClient {
  constructor() {
    this.client = axios.create();
  }

  /**
   * @param {string} url
   * @param {object} data
   * @param {object} [config]
   * @returns {Promise<object>}
   */
  async post(url, data, config = {}) {
    try {
      return await this.client.post(url, data, config);
    } catch (error) {
      if (error.response) {
        return error.response;
      }
      throw error;
    }
  }
}

module.exports = new HttpClient();
