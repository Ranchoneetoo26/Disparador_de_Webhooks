import ListarProtocolosUseCase from "../../../../application/useCases/ListarProtocolosUseCase";
import {
  webhookReprocessadoRepository,
  redisCacheRepository,
} from "../../../database/sequelize/repositories";
const listarProtocolosUseCase = new ListarProtocolosUseCase({
  webhookReprocessadoRepository,
  cacheRepository: redisCacheRepository,
});

export const listarProtocolos = async (req, res) => {
  try {
    const result = await listarProtocolosUseCase.execute(req.query);

    if (!result.success) {
      return res.status(result.status || 400).json({ error: result.error });
    }

    return res.status(200).json(result.data);
  } catch (error) {
    console.error("Erro ao listar protocolos:", error);
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
};
