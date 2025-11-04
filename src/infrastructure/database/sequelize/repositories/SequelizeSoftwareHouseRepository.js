'use strict';

// SequelizeSoftwareHouseRepository.js
// Repositório que acessa o model SoftwareHouse.
// Não lança erro no construtor se os models ainda não estiverem carregados:
// busca o model dinamicamente quando necessário.

export default class SequelizeSoftwareHouseRepository {
  /**
   * @param {Object} params
   * @param {import('sequelize').Sequelize} params.sequelize - instância do Sequelize (opcional)
   */
  constructor({ sequelize } = {}) {
    this.db = sequelize || null;
    this.models = (this.db && this.db.models) ? this.db.models : (global.models || null);
  }

  _getSoftwareHouseModel() {
    // Atualiza referência a models se possível (caso global tenha sido populado depois)
    if (!this.models && this.db && this.db.models) {
      this.models = this.db.models;
    }
    if (!this.models && global && global.models) {
      this.models = global.models;
    }

    if (!this.models || !this.models.SoftwareHouse) {
      throw new Error('Model "SoftwareHouse" não foi carregado em SequelizeSoftwareHouseRepository (chamado em tempo de execução)');
    }

    return this.models.SoftwareHouse;
  }

  async findByCnpjAndToken(cnpj, token) {
    if (!cnpj || !token) {
      return null;
    }

    const SoftwareHouse = this._getSoftwareHouseModel();

    return SoftwareHouse.findOne({
      where: {
        cnpj,
        token
      }
    });
  }

  // Outros métodos que precisem do model podem usar _getSoftwareHouseModel()
}
