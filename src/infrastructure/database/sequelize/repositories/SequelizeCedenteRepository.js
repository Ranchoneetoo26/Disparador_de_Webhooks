"use strict";

const { models } = require("../models/index.cjs");

// SequelizeCedenteRepository.js
// Repositório que acessa o model Cedente.
// Nota: não lança erro no construtor se os models ainda não estiverem carregados.
// Em vez disso, busca models dinamicamente quando necessário.

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

    // Supondo que o campo no model seja cnpj e token, ajuste se for outro nome
    return Cedente.findOne({
      where: {
        cnpj: cnpj,
        token: token,
      },
    });
  }

  // Outros métodos do repositório que precisarem do model podem usar _getCedenteModel()
}

module.exports = SequelizeCedenteRepository;
