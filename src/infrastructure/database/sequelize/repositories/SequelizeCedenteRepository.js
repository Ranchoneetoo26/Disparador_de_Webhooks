"use strict";

const { models } = require("../models/index.cjs");

class SequelizeCedenteRepository {
  /**
   * @param {Object} params
   * @param {import('sequelize').Sequelize} params.sequelize - instância do Sequelize (opcional)
   */
  constructor() {}

  _getCedenteModel() {
    return models.Cedente;
  }

  /**
   * @param {string} cnpj
   * @param {string} token
   * @returns {Promise<Object|null>}
   */
  async findByCnpjAndToken(cnpj, token) {
    if (!cnpj || !token) {
      return null;
    }

    const Cedente = this._getCedenteModel();

    return Cedente.findOne({
      where: {
        cnpj: cnpj,
        token: token,
      },
    });
  }
}

module.exports = SequelizeCedenteRepository;
