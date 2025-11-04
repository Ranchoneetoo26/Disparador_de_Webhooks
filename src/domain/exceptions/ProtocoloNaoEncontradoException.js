'use strict';

// --- CORREÇÃO AQUI ---
// Mudamos de "export default class" para "export class"
// Isso cria um "named export"
export class ProtocoloNaoEncontradoException extends Error {
// --- FIM DA CORREÇÃO ---
  constructor(message) {
    super(message);
    this.name = 'ProtocoloNaoEncontradoException';
    this.status = 404; 
  }
}