const ListarProtocolosUseCase = require("@/application/useCases/ListarProtocolosUseCase");
const { describe, beforeEach, it, expect } = require("@jest/globals");

// Nota: ajuste os mocks abaixo caso seu cache retorne JSON string em vez de objeto/array.

let mockWebhookReprocessadoRepository;
let mockCacheRepository;
let listarProtocolosUseCase;

describe("ListarProtocolosUseCase", () => {
  beforeEach(() => {
    mockWebhookReprocessadoRepository = {
      listByDateRangeAndFilters: jest.fn(),
    };
    mockCacheRepository = {
      get: jest.fn(),
      set: jest.fn(),
    };
    listarProtocolosUseCase = new ListarProtocolosUseCase({
      webhookReprocessadoRepository: mockWebhookReprocessadoRepository,
      cacheRepository: mockCacheRepository,
    });
  });

  it("deve lançar InvalidRequestException se start_date estiver faltando", async () => {
    const input = { end_date: "2025-10-18" };
    await expect(listarProtocolosUseCase.execute(input)).rejects.toThrow(
      'Os filtros "start_date" e "end_date" são obrigatórios.'
    );
  });

  it("deve lançar InvalidRequestException se end_date estiver faltando", async () => {
    const input = { start_date: "2025-10-01" };
    await expect(listarProtocolosUseCase.execute(input)).rejects.toThrow(
      'Os filtros "start_date" e "end_date" são obrigatórios.'
    );
  });

  it("deve lançar InvalidRequestException se as datas tiverem formato inválido", async () => {
    const input = { start_date: "data-invalida", end_date: "2025-10-18" };
    await expect(listarProtocolosUseCase.execute(input)).rejects.toThrow(
      "As datas fornecidas são inválidas."
    );
  });

  it("deve lançar InvalidRequestException se start_date for posterior a end_date", async () => {
    const input = { start_date: "2025-10-18", end_date: "2025-10-17" };
    await expect(listarProtocolosUseCase.execute(input)).rejects.toThrow(
      "start_date não pode ser maior que end_date."
    );
  });

  it("deve lançar InvalidRequestException se o intervalo de datas for maior que 31 dias", async () => {
    const input = { start_date: "2025-09-01", end_date: "2025-10-02" };
    await expect(listarProtocolosUseCase.execute(input)).rejects.toThrow(
      "O intervalo entre as datas não pode ser maior que 31 dias."
    );
  });

  it("NÃO deve lançar erro para um intervalo de datas válido (exatamente 31 dias)", async () => {
    const input = { start_date: "2025-09-01", end_date: "2025-10-01" };
    const mockResult = [{ id: "proto1" }];
    mockWebhookReprocessadoRepository.listByDateRangeAndFilters.mockResolvedValue(
      mockResult
    );
    mockCacheRepository.get.mockResolvedValue(null);
    await expect(listarProtocolosUseCase.execute(input)).resolves.toEqual(
      mockResult
    );
  });

  it("NÃO deve lançar erro para um intervalo de datas válido (menos de 31 dias)", async () => {
    const input = { start_date: "2025-10-01", end_date: "2025-10-15" };
    const mockResult = [{ id: "proto2" }];
    mockWebhookReprocessadoRepository.listByDateRangeAndFilters.mockResolvedValue(
      mockResult
    );
    mockCacheRepository.get.mockResolvedValue(null);
    await expect(listarProtocolosUseCase.execute(input)).resolves.toEqual(
      mockResult
    );
  });

  it("deve chamar o repositório com as datas corretas e sem filtros quando apenas datas são fornecidas", async () => {
    const input = { start_date: "2025-10-01", end_date: "2025-10-15" };
    const mockResult = [{ id: "proto3" }];
    mockWebhookReprocessadoRepository.listByDateRangeAndFilters.mockResolvedValue(
      mockResult
    );
    mockCacheRepository.get.mockResolvedValue(null);

    await listarProtocolosUseCase.execute(input);

    expect(
      mockWebhookReprocessadoRepository.listByDateRangeAndFilters
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        startDate: expect.any(Date),
        endDate: expect.any(Date),
        filters: {},
      })
    );

    // Verifica que as datas informadas foram convertidas corretamente (dd de UTC)
    const calledArgs =
      mockWebhookReprocessadoRepository.listByDateRangeAndFilters.mock
        .calls[0][0];
    expect(calledArgs.startDate.toISOString().split("T")[0]).toBe("2025-10-01");
    expect(calledArgs.endDate.toISOString().split("T")[0]).toBe("2025-10-15");
    expect(mockCacheRepository.set).toHaveBeenCalled();
  });

  it("deve chamar o repositório com as datas corretas e todos os filtros opcionais quando fornecidos", async () => {
    const input = {
      start_date: "2025-10-01",
      end_date: "2025-10-15",
      product: "boleto",
      id: "specific-id",
      kind: "notification",
      type: "payment",
    };
    const mockResult = [{ id: "proto4" }];
    mockWebhookReprocessadoRepository.listByDateRangeAndFilters.mockResolvedValue(
      mockResult
    );
    mockCacheRepository.get.mockResolvedValue(null);

    await listarProtocolosUseCase.execute(input);

    expect(
      mockWebhookReprocessadoRepository.listByDateRangeAndFilters
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        startDate: expect.any(Date),
        endDate: expect.any(Date),
        filters: {
          product: "boleto",
          id: "specific-id",
          kind: "notification",
          type: "payment",
        },
      })
    );
    expect(mockCacheRepository.set).toHaveBeenCalled();
  });

  it("deve retornar dados do repositório em cache miss e armazená-los no cache", async () => {
    const input = { start_date: "2025-10-10", end_date: "2025-10-20" };
    const expectedResult = [{ id: "abc", data: "some data" }];
    // Se o cache armazenar JSON string no projeto real, troque para JSON.stringify(expectedResult)
    mockCacheRepository.get.mockResolvedValue(null);
    mockWebhookReprocessadoRepository.listByDateRangeAndFilters.mockResolvedValue(
      expectedResult
    );

    const result = await listarProtocolosUseCase.execute(input);
    expect(result).toEqual(expectedResult);

    const expectedCacheKey = `protocolos:${input.start_date}:${
      input.end_date
    }:${JSON.stringify({})}`;
    expect(mockCacheRepository.get).toHaveBeenCalledWith(expectedCacheKey);
    expect(
      mockWebhookReprocessadoRepository.listByDateRangeAndFilters
    ).toHaveBeenCalledTimes(1);
    expect(mockCacheRepository.set).toHaveBeenCalledWith(
      expectedCacheKey,
      expectedResult,
      { ttl: 86400 }
    );
  });

  it("deve retornar dados do cache em cache hit e não chamar o repositório", async () => {
    const input = { start_date: "2025-10-10", end_date: "2025-10-20" };
    const cachedResult = [{ id: "cached-abc", data: "cached data" }];
    // se cache retorna string no seu projeto, use JSON.stringify(cachedResult)
    mockCacheRepository.get.mockResolvedValue(cachedResult);

    const result = await listarProtocolosUseCase.execute(input);
    expect(result).toEqual(cachedResult);
    const expectedCacheKey = `protocolos:${input.start_date}:${
      input.end_date
    }:${JSON.stringify({})}`;
    expect(mockCacheRepository.get).toHaveBeenCalledWith(expectedCacheKey);
    expect(
      mockWebhookReprocessadoRepository.listByDateRangeAndFilters
    ).not.toHaveBeenCalled();
    expect(mockCacheRepository.set).not.toHaveBeenCalled();
  });

  it("deve gerar a mesma chave de cache para filtros em ordens diferentes", async () => {
    const input1 = {
      start_date: "2025-11-01",
      end_date: "2025-11-10",
      type: "A",
      kind: "B",
    };
    const input2 = {
      start_date: "2025-11-01",
      end_date: "2025-11-10",
      kind: "B",
      type: "A",
    };

    // o UseCase deve ordenar filtros antes de serializar; ajustamos expectativa para
    // JSON.stringify({ kind: "B", type: "A" })
    const expectedFiltersString = JSON.stringify({ kind: "B", type: "A" });
    const expectedCacheKey = `protocolos:2025-11-01:2025-11-10:${expectedFiltersString}`;

    mockCacheRepository.get.mockResolvedValue(null);
    mockWebhookReprocessadoRepository.listByDateRangeAndFilters.mockResolvedValue(
      []
    );

    await listarProtocolosUseCase.execute(input1);
    expect(mockCacheRepository.get).toHaveBeenCalledWith(expectedCacheKey);
    mockCacheRepository.get.mockClear();

    await listarProtocolosUseCase.execute(input2);
    expect(mockCacheRepository.get).toHaveBeenCalledWith(expectedCacheKey);
  });
});
