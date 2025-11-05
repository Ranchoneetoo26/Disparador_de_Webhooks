"use strict";

/**
 * Exceção customizada para erros de "Conflict" (409).
 * Usada quando a requisição é válida, mas conflita com o estado
 * atual do servidor (ex: uma requisição duplicada dentro do tempo limite).
 */
class ConflictException extends Error {
  constructor(message) {
    super(message);
    this.name = "ConflictException";
    this.status = 409; // HTTP 409 Conflict
    this.ids_invalidos = null; // O controller usa isso, definimos como null
  }
}

module.exports = ConflictException;
