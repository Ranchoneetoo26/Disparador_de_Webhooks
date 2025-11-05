"use strict";
const { models } = require("../models/index.cjs");

// SequelizeSoftwareHouseRepository.js
// Repositório que acessa o model SoftwareHouse.
// Não lança erro no construtor se os models ainda não estiverem carregados:
// busca o model dinamicamente quando necessário.

class SequelizeSoftwareHouseRepository {
  /**
   * @param {Object} params
   * @param {import('sequelize').Sequelize} params.sequelize - instância do Sequelize (opcional)
   */
  constructor() {
  }

  _getSoftwareHouseModel() {
    // Atualiza referência a models se possível (caso global tenha sido populado depois)
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

  // Outros métodos que precisem do model podem usar _getSoftwareHouseModel()
}

module.exports = SequelizeSoftwareHouseRepository;
