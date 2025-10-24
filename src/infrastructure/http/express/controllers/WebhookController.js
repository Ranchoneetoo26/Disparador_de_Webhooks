import ReenvioService from '@services/ReenvioService.js';

export default class WebhookController {
  constructor() {
    this.reenvioService = new ReenvioService();
  }

  async reenviar(req, res) {
    try {
      const { product, id, kind, type } = req.body;
      const resultado = await this.reenvioService.reenviarWebhook(
        { product, id, kind, type },
        req
      );

      return res.status(200).json({
        message: 'Webhook reenviado com sucesso.',
        protocolo: resultado.protocolo,
      });
    } catch (error) {
      console.error('Erro no controlador de reenvio:', error);
      return res.status(400).json({
        message: error.message || 'Falha ao reenviar webhook.',
      });
    }
  }

  async listarProtocolos(req, res) {
    try {
      const { start_date, end_date, product, id, kind, type } = req.query;

      const resultado = await this.reenvioService.listarProtocolos({
        start_date,
        end_date,
        product,
        id,
        kind,
        type,
      });

      return res.status(200).json(resultado);
    } catch (error) {
      console.error('Erro ao listar protocolos:', error);
      return res.status(400).json({
        message: error.message || 'Erro ao listar protocolos.',
      });
    }
  }

  async consultarProtocolo(req, res) {
    try {
      const { uuid } = req.params;
      const resultado = await this.reenvioService.consultarProtocolo(uuid);

      if (!resultado) {
        return res.status(404).json({ message: 'Protocolo não encontrado.' });
      }

      return res.status(200).json(resultado);
    } catch (error) {
      console.error('Erro ao consultar protocolo:', error);
      return res.status(400).json({
        message: error.message || 'Erro ao consultar protocolo.',
      });
    }
  }
}