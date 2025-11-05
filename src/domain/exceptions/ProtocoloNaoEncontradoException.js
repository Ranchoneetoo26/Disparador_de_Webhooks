"use strict";
class ProtocoloNaoEncontradoException extends Error {
  constructor(message) {
    super(message);
    this.name = "ProtocoloNaoEncontradoException";
    this.status = 404;
  }
}

module.exports = { ProtocoloNaoEncontradoException };
