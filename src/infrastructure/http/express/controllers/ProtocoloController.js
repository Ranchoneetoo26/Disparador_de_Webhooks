import ListarProtocolosUseCase from "../../../../application/useCases/ListarProtocolosUseCase.js";
import ConsultarProtocoloUseCase from "../../../../application/useCases/ConsultarProtocoloUseCase.js"; // 1. Importar
import {
  webhookReprocessadoRepository,
  redisCacheRepository,
} from "../../../database/sequelize/repositories";

// Instância para Listagem (Já existia)
const listarProtocolosUseCase = new ListarProtocolosUseCase({
  webhookReprocessadoRepository,
  cacheRepository: redisCacheRepository,
});

// 2. Instância para Consulta Individual
const consultarProtocoloUseCase = new ConsultarProtocoloUseCase({
  webhookReprocessadoRepository,
  cacheRepository: redisCacheRepository,
});

export const listarProtocolos = async (req, res) => {
  try {
    const result = await listarProtocolosUseCase.execute(req.query);
    
    // O Use Case agora retorna o objeto direto, não { success, data }
    return res.status(200).json(result);

  } catch (error) {
    console.error("Erro ao listar protocolos:", error);
    // Usa o status do erro (ex: 400 Bad Request) ou 500
    return res.status(error.status || 500).json({ error: error.message || "Erro interno do servidor." });
  }
};

// 3. Nova função para Consulta Individual
export const consultarProtocolo = async (req, res) => {
  try {
    const { uuid } = req.params;
    const result = await consultarProtocoloUseCase.execute({ protocolo: uuid });
    return res.status(200).json(result);

  } catch (error) {
    console.error(`Erro ao consultar protocolo ${req.params.uuid}:`, error);
    // Usa o status do erro (ex: 400 Bad Request) ou 500
    return res.status(error.status || 500).json({ error: error.message || "Erro interno do servidor." });
  }
};
