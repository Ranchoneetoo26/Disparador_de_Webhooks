"use strict";

class ReenviarWebhookOutput {
  constructor({ success, protocolo = null, message = null, error = null }) {
    this.success = success;
    this.protocolo = protocolo;
    this.message = message;
    this.error = error;
  }

  static success(protocolo, message = "Webhook reenviado com sucesso.") {
    return new ReenviarWebhookOutput({
      success: true,
      protocolo,
      message,
    });
  }

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

module.exports = ReenviarWebhookOutput;
>>>>>>> d69ec169d0d39e2e3744332f34d207bd68b6f06a
