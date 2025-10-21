export class ProtocoloNaoEncontradoException extends Error {
  constructor(message = 'Protocolo não encontrado') {
    super(message);
    this.name = 'ProtocoloNaoEncontradoException';
  }
}
