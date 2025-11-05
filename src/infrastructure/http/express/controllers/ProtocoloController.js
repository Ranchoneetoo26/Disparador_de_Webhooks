'use strict';

import InvalidRequestException from '../../../../domain/exceptions/InvalidRequestException.js';
import { ProtocoloNaoEncontradoException } from '../../../../domain/exceptions/ProtocoloNaoEncontradoException.js';

export default class ProtocoloController {
  constructor({ listarProtocolosUseCase, consultarProtocoloUseCase }) {
    if (!listarProtocolosUseCase) {
      throw new Error('listarProtocolosUseCase é obrigatório');
    }
    if (!consultarProtocoloUseCase) {
      throw new Error('consultarProtocoloUseCase é obrigatório');
    }
    this.listarProtocolosUseCase = listarProtocolosUseCase;
    this.consultarProtocoloUseCase = consultarProtocoloUseCase;
  }

  async listarProtocolos(req, res) {
    try {
      // Passa req.query (que tem start_date, end_date, etc)
      const protocolos = await this.listarProtocolosUseCase.execute(req.query);
      return res.status(200).json(protocolos);

    } catch (err) {
      if (err instanceof InvalidRequestException) {
        console.warn(`[ProtocoloController] Erro de validação: ${err.message}`);
        return res.status(400).json({ 
          success: false, 
          message: err.message 
        });
      }

      console.error('Erro ao listar protocolos:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor.' 
      });
    }
  }

  async consultarProtocolo(req, res) {
    try {
      const { uuid } = req.params;
      
      // --- CORREÇÃO AQUI ---
      // Estávamos passando o objeto { protocolo: uuid }
      // O UseCase agora espera apenas a string 'uuid'
      const protocolo = await this.consultarProtocoloUseCase.execute(uuid);

      return res.status(200).json(protocolo);

    } catch (err) {
      if (err instanceof ProtocoloNaoEncontradoException) {
        console.warn(`[ProtocoloController] Protocolo não encontrado: ${req.params.uuid}`);
        return res.status(404).json({ 
          success: false, 
          message: err.message 
        });
      }

      console.error('Erro ao consultar protocolo:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor.' 
      });
    }
  }
}