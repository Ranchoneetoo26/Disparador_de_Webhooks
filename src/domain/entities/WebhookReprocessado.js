// src/domain/entities/WebhookReprocessado.js
'use strict';

/**
 * Representa a Entidade de Domínio para um WebhookReprocessado.
 * É um objeto simples (POJO) que carrega os dados
 * entre a camada de infraestrutura e a camada de aplicação.
 * Não contém lógica de banco de dados (Sequelize).
 */
export default class WebhookReprocessado {
  constructor({
    id,
    data,
    data_criacao,
    cedente_id,
    kind,
    type,
    servico_id,
    protocolo,
    status,
  }) {
    this.id = id; // UUID
    this.data = data; // JSONB
    this.data_criacao = data_criacao; // Date
    this.cedente_id = cedente_id; // Integer
    this.kind = kind; // String
    this.type = type; // String
    this.servico_id = servico_id; // JSONB (Array de strings)
    this.protocolo = protocolo; // String (UUID da requisição)
    this.status = status; // String (ex: 'pending', 'sent', 'error')
  }

  /**
   * Um "Factory Method" opcional para criar uma entidade
   * a partir de um objeto de dados (ex: vindo do Sequelize).
   * @param {object} dataObject
   * @returns {WebhookReprocessado}
   */
  static fromObject(dataObject) {
    if (!dataObject) return null;
    return new WebhookReprocessado(dataObject);
  }

  /**
   * Converte a entidade para um objeto simples.
   * @returns {object}
   */
  toJSON() {
    return {
      id: this.id,
      data: this.data,
      data_criacao: this.data_criacao,
      cedente_id: this.cedente_id,
      kind: this.kind,
      type: this.type,
      servico_id: this.servico_id,
      protocolo: this.protocolo,
      status: this.status,
    };
  }
}