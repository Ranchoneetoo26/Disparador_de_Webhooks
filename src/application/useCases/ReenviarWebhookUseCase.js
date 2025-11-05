"use strict";

const { v4: uuidv4 } = require("uuid");
const UnprocessableEntityException = require("../../domain/exceptions/UnprocessableEntityException.js");

const MAPA_SITUACAO = {
  boleto: {
    disponivel: "REGISTRADO",
    cancelado: "BAIXADO",
    pago: "LIQUIDADO",
  },
  pagamento: {
    disponivel: "SCHEDULED_ACTIVE",
    cancelado: "CANCELLED",
    pago: "PAID",
  },
  pix: {
    disponivel: "ACTIVE",
    cancelado: "REJECTED",
    pago: "LIQUIDATED",
  },
};

class ReenviarWebhookUseCase {
  constructor({
    servicoRepository,
    webhookRepository,
    webhookReprocessadoRepository,
    httpClient,
    redisClient,
  } = {}) {
    if (!servicoRepository) throw new Error("servicoRepository missing");
    if (!webhookRepository) throw new Error("webhookRepository missing");
    if (!webhookReprocessadoRepository)
      throw new Error("webhookReprocessadoRepository missing");
    if (!httpClient) throw new Error("httpClient missing");
    if (!redisClient) throw new Error("redisClient missing");

    this.servicoRepository = servicoRepository;
    this.webhookRepository = webhookRepository;
    this.reprocessadoRepository = webhookReprocessadoRepository;
    this.httpClient = httpClient;
    this.redisClient = redisClient;
  }

  async execute(input) {
    const { product, id: ids, kind, type } = input;
    const { cedente } = input;

    const cacheKey = `reenvio:${cedente.id}:${JSON.stringify(input)}`;
    const cachedRequest = await this.redisClient.get(cacheKey);

    if (cachedRequest) {
      const err = new Error(
        "Requisição duplicada. Aguarde 1 hora para reenviar os mesmos dados."
      );
      err.status = 429;
      throw err;
    }
    await this.redisClient.set(cacheKey, "processing", { ttl: 3600 });

    const servicos = await this.servicoRepository.findByIdsAndCedente(
      ids,
      cedente.id
    );

    const servicosEncontradosMap = new Map(
      servicos.map((s) => [s.id.toString(), s])
    );
    const idsNaoEncontrados = ids.filter(
      (id) => !servicosEncontradosMap.has(id.toString())
    );

    if (idsNaoEncontrados.length > 0) {
      throw new UnprocessableEntityException(
        "Não foi possível gerar a notificação. Os seguintes IDs não foram encontrados ou não pertencem ao cedente.",
        idsNaoEncontrados
      );
    }

    const situacaoEsperada = MAPA_SITUACAO[product]?.[type];
    if (!situacaoEsperada) {
      const err = new Error(
        `Mapeamento de situação inválido para product '${product}' e type '${type}'.`
      );
      err.status = 400;
      throw err;
    }

    const idsSituacaoErrada = servicos
      .filter((servico) => {
        const statusReal = servico.status;
        return statusReal !== situacaoEsperada;
      })
      .map((servico) => servico.id);

    if (idsSituacaoErrada.length > 0) {
      throw new UnprocessableEntityException(
        `Não foi possível gerar a notificação. A situação do ${product} diverge do tipo de notificação solicitado (esperado: ${situacaoEsperada}).`,
        idsSituacaoErrada
      );
    }

    const protocoloLote = uuidv4();

    const reenviosPromises = servicos.map((servico) => {
      console.log(
        `[Reenvio] Processando ID: ${servico.id}, URL: ${servico.url}`
      );
      return this.processarReenvio(servico, cedente, null);
    });

    const resultados = await Promise.allSettled(reenviosPromises);

    const sucessos = resultados.filter((r) => r.status === "fulfilled");
    if (sucessos.length === 0) {
      const err = new Error(
        "Não foi possível gerar a notificação. Tente novamente mais tarde."
      );
      err.status = 400;
      await this.redisClient.del(cacheKey);
      throw err;
    }

    const registroProtocolo = {
      id: uuidv4(),
      protocolo: protocoloLote,
      data: { product, ids_solicitados: ids, kind, type },
      data_criacao: new Date(),
      cedente_id: cedente.id,
      kind: kind,
      type: type,
      servico_id: JSON.stringify(ids),
      status: "sent",
    };
    await this.reprocessadoRepository.create(registroProtocolo);
    return { protocolo: protocoloLote };
  }

  async processarReenvio(servico, cedente, conta) {
    let response;
    try {
      response = await this.httpClient.post(servico.url, servico.payload, {
        timeout: 5000,
      });
      const isSuccess =
        response && response.status >= 200 && response.status < 300;
      if (isSuccess) {
        await this.webhookRepository.update(servico.id, {
          tentativas: (servico.tentativas || 0) + 1,
          last_status: response.status,
        });
        return {
          id: servico.id,
          status: "fulfilled",
          httpStatus: response.status,
        };
      } else {
        throw new Error(`HTTP Status ${response.status}`);
      }
    } catch (err) {
      console.error(
        `[ProcessarReenvio] Falha ao enviar ID ${servico.id}: ${err.message}`
      );
      await this.webhookRepository.update(servico.id, {
        tentativas: (servico.tentativas || 0) + 1,
        last_status: response?.status || null,
      });
      throw new Error(`Falha no reenvio para ${servico.id}: ${err.message}`);
    }
  }
}

module.exports = ReenviarWebhookUseCase;