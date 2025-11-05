"use strict";
class ConflictException extends Error {
  constructor(message) {
    super(message);
    this.name = "ConflictException";
    this.status = 409; 
    this.ids_invalidos = null; 
  }
}

module.exports = ConflictException;
