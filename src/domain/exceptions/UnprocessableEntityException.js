'use strict';

export default class UnprocessableEntityException extends Error {
  constructor(message = "Entidade não processável", ids_invalidos = null) {
    super(message);
    this.name = "UnprocessableEntityException";
    this.status = 422;
    this.ids_invalidos = ids_invalidos;
  }
}
