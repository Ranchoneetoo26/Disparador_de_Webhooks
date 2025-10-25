import ReenvioService from "../../../../services/ReenvioService.js";
// --- INÍCIO DA CORREÇÃO ---
// Precisamos dos models para buscar o webhook pelo ID
import db from "../../../database/sequelize/models/index.cjs"; 
const { models } = db;
// --- FIM DA CORREÇÃO ---

export default class WebhookController {
  constructor() {
    this.reenvioService = new ReenvioService();
    // Injetar o model diretamente seria melhor em projetos maiores
    this.WebhookModel = models.WebhookModel; 
  }

  async reenviar(req, res) {
    const { id: webhookId } = req.params; // Pega o ID da URL e renomeia para clareza
    console.log(`[WebhookController] Recebida requisição para reenviar webhook ID: ${webhookId}`);

    try {
      // Validação básica do ID
      if (!webhookId || isNaN(parseInt(webhookId, 10))) {
         console.error("[WebhookController] ID do webhook inválido ou não fornecido na URL.");
         return res.status(400).json({
            message: "ID do webhook inválido ou não fornecido na URL (ex: /webhooks/123/reenviar).",
         });
      }

      // --- INÍCIO DA LÓGICA DE BUSCA ---
      // 1. Buscar o webhook no banco de dados pelo ID
      const webhook = await this.WebhookModel.findByPk(webhookId);

      // 2. Verificar se o webhook foi encontrado
      if (!webhook) {
         console.log(`[WebhookController] Webhook ID ${webhookId} não encontrado no banco.`);
         return res.status(404).json({
            message: `Webhook com ID ${webhookId} não encontrado.`,
         });
      }
      console.log(`[WebhookController] Webhook ID ${webhookId} encontrado. Produto: ${webhook.product}, Kind: ${webhook.kind}`);

      // 3. Montar o objeto 'data' esperado pelo ReenvioService
      //    (Presumindo que 'product' existe no seu WebhookModel. Ajuste se necessário)
      //    O serviço também espera 'id', que pode ser o ID do webhook mesmo.
      const dataForService = {
          id: webhook.id,          // O ID do próprio webhook
          product: webhook.product, // O campo 'product' do webhook (VERIFIQUE SE EXISTE!)
          kind: webhook.kind,       // Incluindo kind e type, caso o serviço precise futuramente
          type: webhook.type,
          // Adicione outros campos do 'webhook' que o serviço possa precisar aqui
          // Ex: payload: webhook.payload, url: webhook.url
      };
      // --- FIM DA LÓGICA DE BUSCA ---

      // 4. Chamar o serviço com os dados corretos
      const resultado = await this.reenvioService.reenviarWebhook(
         dataForService, // Passa o objeto construído
         req             // Passa o 'req' se o serviço precisar
      );

      // (Tratamento de 'não encontrado' movido para antes da chamada do serviço)

      console.log(`[WebhookController] Webhook ID ${webhookId} reenviado (simulado) com sucesso. Protocolo: ${resultado.protocolo}`);
      // Retorna sucesso 200
      return res.status(200).json({
        message: "Webhook reenviado com sucesso.", // Mensagem genérica de sucesso
        protocolo: resultado.protocolo,
      });

    } catch (error) {
      console.error(`[WebhookController] Erro ao reenviar webhook ID ${webhookId}:`, error);
      const statusCode = error.statusCode || 500; // Usar 500 como padrão se não for erro específico
      return res.status(statusCode).json({
        message: error.message || "Falha interna ao processar o reenvio do webhook.",
      });
    }
  }

  // --- Métodos listarProtocolos e consultarProtocolo (sem alterações) ---
  async listarProtocolos(req, res) {
    // ... seu código ...
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
    // ... seu código ...
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

  // --- Método list (sem alterações) ---
   async list(req, res) {
      console.log("[WebhookController] Rota GET / não implementada ou mapeada incorretamente.");
      return res.status(501).json({ message: "Listagem de webhooks não implementada." });
   }
}

