// src/application/useCases/ListarProtocolosUseCase.js
'use strict';

// --- CORREÇÃO AQUI ---
// Importamos 'endOfDay' para setar a data final para 23:59:59
import { subDays, differenceInDays, endOfDay } from "date-fns"; 
// --- FIM DA CORREÇÃO ---
import InvalidRequestException from "../../domain/exceptions/InvalidRequestException.js";

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
    
    // --- CORREÇÃO AQUI ---
    // Usamos endOfDay() para garantir que a data final inclua o dia inteiro
    const endDate = endOfDay(new Date(end_date));
    // --- FIM DA CORREÇÃO ---

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new InvalidRequestException("As datas fornecidas são inválidas.");
    }

    if (startDate > endDate) {
      throw new InvalidRequestException(
        "start_date não pode ser maior que end_date."
      );
    }

    // A validação de 31 dias (Regra de Negócio)
    const daysDiff = differenceInDays(endDate, startDate);
    if (daysDiff >= 31) {
      throw new InvalidRequestException(
        "O intervalo entre as datas não pode ser maior que 31 dias."
      );
    }

    // Lógica de Cache (que já estava correta)
    const restFilters = Object.fromEntries(
      Object.entries(filters).filter(
        ([key]) => !["start_date", "end_date"].includes(key)
      )
    );

    const sortedFilters = Object.keys(restFilters)
      .sort()
      .reduce((obj, key) => {
        obj[key] = restFilters[key];
        return obj;
      }, {});
      
    // Usamos a data original (string) na chave do cache
    const cacheKey = `protocolos:${start_date}:${end_date}:${JSON.stringify(
      sortedFilters
    )}`;

    const cachedData = await this.cacheRepository.get(cacheKey);

    if (cachedData) {
      if (typeof cachedData === "string") {
        try {
          return JSON.parse(cachedData); // Retorna do cache
        } catch (e) {
          console.error("Erro ao parsear dados do cache:", e);
        }
      } else {
        return cachedData; // Retorna do cache
      }
    }

    // Busca no banco (agora com as datas corretas)
    const protocolos =
      await this.webhookReprocessadoRepository.listByDateRangeAndFilters({
        startDate, // 30/10 00:00:00
        endDate,   // 30/10 23:59:59
        filters: restFilters,
      });

    // Salva no cache (Regra de Negócio: 1 dia)
    await this.cacheRepository.set(cacheKey, protocolos, { ttl: 86400 });

    return protocolos;
  }
}