"use strict";

const { models } = require("../models/index.cjs");
class SequelizeCedenteRepository {
  /**
   * @param {Object} params
   * @param {import('sequelize').Sequelize} params.sequelize - instância do Sequelize (opcional)
   */
  constructor() {}

  /**
   * Internal helper: resolve e retorna o model Cedente ou lança um erro mais localizado
   */
  _getCedenteModel() {
    return models.Cedente;
  }

  /**
   * Busca um cedente pelo CNPJ e token
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
