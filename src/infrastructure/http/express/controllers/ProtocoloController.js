// src/infrastructure/http/express/controllers/ProtocoloController.js
'use strict';

// Importa as exceções de domínio para tratamento de erro
import InvalidRequestException from '../../../../domain/exceptions/InvalidRequestException.js';
// --- CORREÇÃO AQUI ---
// Importamos como um "named export" (com chaves), que é o que o erro indica
import { ProtocoloNaoEncontradoException } from '../../../../domain/exceptions/ProtocoloNaoEncontradoException.js';
// --- FIM DA CORREÇÃO ---

export default class ProtocoloController {
  // Recebe os UseCases via injeção de dependência
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

  /**
   * Lida com a rota GET /protocolo
   * Lista os protocolos com base nos filtros (query params).
   */
  async listarProtocolos(req, res) {
    try {
      // Passa todos os filtros (req.query) para o UseCase
      const protocolos = await this.listarProtocolosUseCase.execute(req.query);
      return res.status(200).json(protocolos);

    } catch (err) {
      // Captura erros de validação (ex: datas faltando, intervalo > 31 dias)
      if (err instanceof InvalidRequestException) {
        console.warn(`[ProtocoloController] Erro de validação: ${err.message}`);
        return res.status(400).json({ 
          success: false, 
          message: err.message 
        });
      }

      // Captura qualquer outro erro
      console.error('Erro ao listar protocolos:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor.' 
      });
    }
  }

  /**
   * Lida com a rota GET /protocolo/{uuid}
   * Consulta um protocolo específico.
   */
  async consultarProtocolo(req, res) {
    try {
      const { uuid } = req.params;
      const protocolo = await this.consultarProtocoloUseCase.execute({ protocolo: uuid });

      // O UseCase já trata o caso de "não encontrado" jogando uma exceção
      return res.status(200).json(protocolo);

    } catch (err) {
      // Captura o erro específico de "não encontrado"
      if (err instanceof ProtocoloNaoEncontradoException) {
        console.warn(`[ProtocoloController] Protocolo não encontrado: ${req.params.uuid}`);
        return res.status(404).json({ 
          success: false, 
          message: err.message 
        });
      }

      // Captura qualquer outro erro
      console.error('Erro ao consultar protocolo:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor.' 
      });
    }
  }
}