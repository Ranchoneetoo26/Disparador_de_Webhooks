import ReenvioService from "../../../../services/ReenvioService.js";
import db from "../../../database/sequelize/models/index.cjs";
const { models } = db;

export default class WebhookController {
  constructor() {
    this.reenvioService = new ReenvioService();
    this.WebhookModel = models.WebhookModel;
  }

  async reenviar(req, res) {
    const { id: webhookId } = req.params;
    console.log(`[WebhookController] Recebida requisição para reenviar webhook ID: ${webhookId}`);

    try {
      if (!webhookId || isNaN(parseInt(webhookId, 10))) {
        console.error("[WebhookController] ID do webhook inválido ou não fornecido na URL.");
        return res.status(400).json({
          message: "ID do webhook inválido ou não fornecido na URL (ex: /webhooks/123/reenviar).",
        });
      }

      const webhook = await this.WebhookModel.findByPk(webhookId);

      if (!webhook) {
        console.log(`[WebhookController] Webhook ID ${webhookId} não encontrado no banco.`);
        return res.status(404).json({
          message: `Webhook com ID ${webhookId} não encontrado.`,
        });
      }
      console.log(`[WebhookController] Webhook ID ${webhookId} encontrado. Produto: ${webhook.product}, Kind: ${webhook.kind}`);

      const dataForService = {
        id: webhook.id,
        product: webhook.product,
        kind: webhook.kind,
        type: webhook.type,

      };

      const resultado = await this.reenvioService.reenviarWebhook(
        dataForService,
        req
      );

      console.log(`[WebhookController] Webhook ID ${webhookId} reenviado (simulado) com sucesso. Protocolo: ${resultado.protocolo}`);
      return res.status(200).json({
        message: "Webhook reenviado com sucesso.",
        protocolo: resultado.protocolo,
      });

    } catch (error) {
      console.error(`[WebhookController] Erro ao reenviar webhook ID ${webhookId}:`, error);
      const statusCode = error.statusCode || 500;
      return res.status(statusCode).json({
        message: error.message || "Falha interna ao processar o reenvio do webhook.",
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
      console.error("[WebhookController] Erro ao listar protocolos:", error);
      const statusCode = error.statusCode || 400;
      return res.status(statusCode).json({
        message: error.message || "Erro ao listar protocolos.",
      });
    }
  }

  async consultarProtocolo(req, res) {
    try {
      const { uuid } = req.params;
      const resultado = await this.reenvioService.consultarProtocolo(uuid);
      if (!resultado) {
        return res.status(404).json({ message: "Protocolo não encontrado." });
      }
      return res.status(200).json(resultado);
    } catch (error) {
      console.error("[WebhookController] Erro ao consultar protocolo:", error);
      const statusCode = error.statusCode || 400;
      return res.status(statusCode).json({
        message: error.message || "Erro ao consultar protocolo.",
      });
    }
  }

  async list(req, res) {
    console.log("[WebhookController] Rota GET / não implementada ou mapeada incorretamente.");
    return res.status(501).json({ message: "Listagem de webhooks não implementada." });
  }
}

