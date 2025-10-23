// src/domain/exceptions/DuplicateRequestException.js
export default class DuplicateRequestException extends Error {
  constructor(message = "Requisição idêntica já processada recentemente. Aguarde 1 hora.") {
    super(message);
    this.name = "DuplicateRequestException";
  }
}