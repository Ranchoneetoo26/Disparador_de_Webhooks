<<<<<<< HEAD
// src/application/dtos/ReenviarWebhookOutput.js
=======

>>>>>>> e8eb97ff05622b90f384c5fbc829e82218ca52c7
'use strict';

export default class ReenviarWebhookOutput {
  constructor({ success, protocolo = null, message = null, error = null }) {
    this.success = success;
    this.protocolo = protocolo;
    this.message = message;
    this.error = error;
  }

  static success(protocolo, message = 'Webhook reenviado com sucesso.') {
    return new ReenviarWebhookOutput({
      success: true,
      protocolo,
      message,
    });
  }

<<<<<<< HEAD
  // Requisito: Retorna o status de erro e, opcionalmente, os IDs inválidos (detalhes)
=======
>>>>>>> e8eb97ff05622b90f384c5fbc829e82218ca52c7
  static error(status, message, detalhes = null) {
    return new ReenviarWebhookOutput({
      success: false,
      message,
      error: {
        status,
        detalhes,
      },
    });
  }

  toJSON() {
    return {
      success: this.success,
      protocolo: this.protocolo,
      message: this.message,
      error: this.error,
    };
  }
<<<<<<< HEAD
}
=======
}
>>>>>>> e8eb97ff05622b90f384c5fbc829e82218ca52c7
