"use strict";

const InvalidRequestException = require("../../../../domain/exceptions/InvalidRequestException.js");
const {
  ProtocoloNaoEncontradoException,
} = require("../../../../domain/exceptions/ProtocoloNaoEncontradoException.js");

class ProtocoloController {
  constructor({ listarProtocolosUseCase, consultarProtocoloUseCase }) {
    if (!listarProtocolosUseCase) {
      throw new Error("listarProtocolosUseCase é obrigatório");
    }
    if (!consultarProtocoloUseCase) {
      throw new Error("consultarProtocoloUseCase é obrigatório");
    }
    this.listarProtocolosUseCase = listarProtocolosUseCase;
    this.consultarProtocoloUseCase = consultarProtocoloUseCase;
  }

  async listarProtocolos(req, res) {
    try {
      const protocolos = await this.listarProtocolosUseCase.execute(req.query);
      return res.status(200).json(protocolos);
    } catch (err) {
      if (err instanceof InvalidRequestException) {
        console.warn(`[ProtocoloController] Erro de validação: ${err.message}`);
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }

      console.error("Erro ao listar protocolos:", err);
      return res.status(500).json({
        success: false,
        message: "Erro interno do servidor.",
      });
    }
  }

  async consultarProtocolo(req, res) {
    try {
      const { uuid } = req.params;
      const protocolo = await this.consultarProtocoloUseCase.execute({
        protocolo: uuid,
      });

      return res.status(200).json(protocolo);
    } catch (err) {
      if (err instanceof ProtocoloNaoEncontradoException) {
        console.warn(
          `[ProtocoloController] Protocolo não encontrado: ${req.params.uuid}`
        );
        return res.status(404).json({
          success: false,
          message: err.message,
        });
      }

      console.error("Erro ao consultar protocolo:", err);
      return res.status(500).json({
        success: false,
        message: "Erro interno do servidor.",
      });
    }
  }
}

module.exports = ProtocoloController;
