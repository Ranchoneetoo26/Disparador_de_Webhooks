'use strict';

// SequelizeCedenteRepository.js
// Repositório que acessa o model Cedente.
// Nota: não lança erro no construtor se os models ainda não estiverem carregados.
// Em vez disso, busca models dinamicamente quando necessário.

export default class SequelizeCedenteRepository {
  /**
   * @param {Object} params
   * @param {import('sequelize').Sequelize} params.sequelize - instância do Sequelize (opcional)
   */
  constructor({ sequelize } = {}) {
    // Armazena a instância do Sequelize se fornecida
    this.db = sequelize || null;

    // Tenta obter models a partir do sequelize ou global (jest.setup pode popular global.models)
    this.models = (this.db && this.db.models) ? this.db.models : (global.models || null);
  }

  /**
   * Internal helper: resolve e retorna o model Cedente ou lança um erro mais localizado
   */
  _getCedenteModel() {
    // Sempre tenta atualizar a referência a models (caso global tenha sido populado depois)
    if (!this.models && this.db && this.db.models) {
      this.models = this.db.models;
    }
    if (!this.models && global && global.models) {
      this.models = global.models;
    }

    if (!this.models || !this.models.Cedente) {
      throw new Error('Model "Cedente" não foi carregado em SequelizeCedenteRepository (chamado em tempo de execução)');
    }

    return this.models.Cedente;
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
        token: token
      }
    });
  }

  // Outros métodos do repositório que precisarem do model podem usar _getCedenteModel()
}
