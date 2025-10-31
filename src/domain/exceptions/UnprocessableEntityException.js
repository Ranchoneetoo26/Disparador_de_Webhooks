'use strict';

/**
 * Exceção customizada para erros de "Unprocessable Entity" (422).
 * Usada quando a requisição é sintaticamente correta (passa no Joi),
 * mas falha em uma regra de negócio (ex: status inválido).
 */
export default class UnprocessableEntityException extends Error {
  constructor(message, ids_invalidos = null) {
    super(message);
    this.name = 'UnprocessableEntityException';
    this.status = 422;
    this.ids_invalidos = ids_invalidos; // O controller vai usar isso no 'detalhes'
  }
}