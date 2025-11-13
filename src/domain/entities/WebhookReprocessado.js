"use strict";
class WebhookReprocessado {
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
    this.id = id;
    this.data = data;
    this.data_criacao = data_criacao;
    this.cedente_id = cedente_id;
    this.kind = kind;
    this.type = type;
    this.servico_id = servico_id;
    this.protocolo = protocolo;
    this.status = status;
  }

  /**
   * @param {object} dataObject
   * @returns {WebhookReprocessado}
   */
  static fromObject(dataObject) {
    if (!dataObject) return null;
    return new WebhookReprocessado(dataObject);
  }

  /**
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
module.exports = WebhookReprocessado;
