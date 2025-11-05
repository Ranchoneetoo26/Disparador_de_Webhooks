"use strict";
const { models } = require("../models/index.cjs");

class SequelizeSoftwareHouseRepository {
  /**
   * @param {Object} params
   * @param {import('sequelize').Sequelize} params.sequelize - instância do Sequelize (opcional)
   */
  constructor() {
  }

  _getSoftwareHouseModel() {
    return models.SoftwareHouse;
  }

  async findByCnpjAndToken(cnpj, token) {
    if (!cnpj || !token) {
      return null;
    }

    const SoftwareHouse = this._getSoftwareHouseModel();

    return SoftwareHouse.findOne({
      where: {
        cnpj,
        token,
      },
    });
  }

}

module.exports = SequelizeSoftwareHouseRepository;
