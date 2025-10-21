import { subDays, differenceInDays } from "date-fns";
import InvalidRequestException from "@/domain/exceptions/InvalidRequestException";

export default class ListarProtocolosUseCase {
  constructor({ webhookReprocessadoRepository, cacheRepository }) {
    if (!webhookReprocessadoRepository) {
      throw new Error("webhookReprocessadoRepository is required");
    }
    if (!cacheRepository) {
      throw new Error("cacheRepository is required");
    }
    this.webhookReprocessadoRepository = webhookReprocessadoRepository;
    this.cacheRepository = cacheRepository;
  }

  async execute(filters) {
    const { start_date, end_date } = filters;

    if (!start_date || !end_date) {
      throw new InvalidRequestException(
        'Os filtros "start_date" e "end_date" são obrigatórios.'
      );
    }

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new InvalidRequestException("As datas fornecidas são inválidas.");
    }

    if (startDate > endDate) {
      throw new InvalidRequestException(
        "start_date não pode ser maior que end_date."
      );
    }

    // A diferença deve ser MENOR que 31, então >= 31 é inválido.
    // Ex: 1 a 31 (inclusive) = 30 dias de diferença. 1 a 1 do mês seguinte = 31 dias.
    const daysDiff = differenceInDays(endDate, startDate);
    if (daysDiff >= 31) { // Mantém a lógica original que valida <= 30 dias de intervalo
      throw new InvalidRequestException(
        "O intervalo entre as datas não pode ser maior que 30 dias." // Mensagem ajustada para clareza
      );
    }

    // Filtros restantes (excluindo datas)
    const restFilters = Object.fromEntries(
      Object.entries(filters).filter(
        ([key]) => !["start_date", "end_date"].includes(key)
      )
    );

    // *** AJUSTE DA CHAVE DE CACHE ***
    // Ordena as chaves dos filtros restantes para garantir consistência
    const sortedFilters = Object.keys(restFilters).sort().reduce((obj, key) => {
      obj[key] = restFilters[key];
      return obj;
    }, {});
    const cacheKey = `protocolos:${start_date}:${end_date}:${JSON.stringify(sortedFilters)}`;
    // *** FIM DO AJUSTE ***

    const cachedData = await this.cacheRepository.get(cacheKey);

    if (cachedData) {
      if (typeof cachedData === "string") {
        try {
           return JSON.parse(cachedData);
        } catch (e) {
           console.error("Erro ao parsear dados do cache:", e);
           // Se não conseguir parsear, busca novamente (cache inválido)
        }
      } else {
        return cachedData; // Retorna se já for objeto/array
      }
    }

    // Busca no repositório se não houver cache válido
    const protocolos =
      await this.webhookReprocessadoRepository.listByDateRangeAndFilters({
        startDate,
        endDate,
        filters: restFilters, // Passa os filtros não ordenados, a ordenação é só para a chave
      });

    // Salva no cache por 1 dia (86400 segundos)
    await this.cacheRepository.set(cacheKey, JSON.stringify(protocolos), { ttl: 86400 }); // Salva como string

    return protocolos;
  }
}