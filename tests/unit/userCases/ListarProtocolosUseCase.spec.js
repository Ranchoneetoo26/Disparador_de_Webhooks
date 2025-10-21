import ListarProtocolosUseCase from "@/application/useCases/ListarProtocolosUseCase";
import { jest, describe, beforeEach, it, expect } from "@jest/globals";

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

  // *** CORREÇÃO 1: AJUSTE NA MENSAGEM ESPERADA E NA DESCRIÇÃO ***
  it("deve lançar InvalidRequestException se o intervalo de datas for maior que 30 dias", async () => {
    const input = { start_date: "2025-09-01", end_date: "2025-10-02" }; // Intervalo de 31 dias
    await expect(listarProtocolosUseCase.execute(input)).rejects.toThrow(
      "O intervalo entre as datas não pode ser maior que 30 dias." // <-- MENSAGEM CORRIGIDA
    );
  });
  // *** FIM DA CORREÇÃO 1 ***

  it("NÃO deve lançar erro para um intervalo de datas válido (exatamente 30 dias de diferença)", async () => { // Descrição ajustada
    const input = { start_date: "2025-09-01", end_date: "2025-10-01" }; // 30 dias de diferença
    const mockResult = [{ id: "proto1" }];
    mockWebhookReprocessadoRepository.listByDateRangeAndFilters.mockResolvedValue(
      mockResult
    );
    mockCacheRepository.get.mockResolvedValue(null);
    await expect(listarProtocolosUseCase.execute(input)).resolves.toEqual(
      mockResult
    );
  });

  it("NÃO deve lançar erro para um intervalo de datas válido (menos de 30 dias)", async () => { // Descrição ajustada
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
    // Verificações das datas convertidas
    expect(
        mockWebhookReprocessadoRepository.listByDateRangeAndFilters.mock.calls[0][0].startDate.toISOString().split("T")[0]
      ).toBe("2025-10-01");
    expect(
        mockWebhookReprocessadoRepository.listByDateRangeAndFilters.mock.calls[0][0].endDate.toISOString().split("T")[0]
      ).toBe("2025-10-15");
    expect(mockCacheRepository.set).toHaveBeenCalled();
  });

  it("deve chamar o repositório com as datas corretas e todos os filtros opcionais quando fornecidos", async () => {
    const input = {
      start_date: "2025-10-01",
      end_date: "2025-10-15",
      product: "boleto",
      id: "specific-id", // Lembrete: A lógica real de como 'id' filtra precisa ser validada
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

  it("deve retornar dados do repositório em cache miss e armazená-los no cache como string JSON", async () => { // Descrição ajustada
    const input = { start_date: "2025-10-10", end_date: "2025-10-20" };
    const expectedResult = [{ id: "abc", data: "some data" }];
    // Chave de cache agora usa JSON.stringify({}) para filtros vazios ordenados
    const expectedCacheKey = `protocolos:${input.start_date}:${input.end_date}:{}`;
    mockCacheRepository.get.mockResolvedValue(null); // Simula cache miss
    mockWebhookReprocessadoRepository.listByDateRangeAndFilters.mockResolvedValue(
      expectedResult
    );

    const result = await listarProtocolosUseCase.execute(input);

    expect(result).toEqual(expectedResult); // O UseCase retorna o objeto original
    expect(mockCacheRepository.get).toHaveBeenCalledWith(expectedCacheKey);
    expect(
      mockWebhookReprocessadoRepository.listByDateRangeAndFilters
    ).toHaveBeenCalledTimes(1);

    // *** CORREÇÃO 2: VERIFICAR SE O VALOR SALVO É A STRING JSON ***
    expect(mockCacheRepository.set).toHaveBeenCalledWith(
      expectedCacheKey,
      JSON.stringify(expectedResult), // <-- VALOR CORRIGIDO (string JSON)
      { ttl: 86400 }
    );
    // *** FIM DA CORREÇÃO 2 ***
  });

  it("deve retornar dados do cache (parseados) em cache hit e não chamar o repositório", async () => { // Descrição ajustada
    const input = { start_date: "2025-10-10", end_date: "2025-10-20" };
    const cachedResultObject = [{ id: "cached-abc", data: "cached data" }];
    const cachedResultString = JSON.stringify(cachedResultObject); // Simula o valor armazenado como string
    // Chave de cache agora usa JSON.stringify({}) para filtros vazios ordenados
    const expectedCacheKey = `protocolos:${input.start_date}:${input.end_date}:{}`;
    mockCacheRepository.get.mockResolvedValue(cachedResultString); // Simula cache hit com a string

    const result = await listarProtocolosUseCase.execute(input);

    // O UseCase deve parsear a string antes de retornar
    expect(result).toEqual(cachedResultObject);
    expect(mockCacheRepository.get).toHaveBeenCalledWith(expectedCacheKey);
    expect(
      mockWebhookReprocessadoRepository.listByDateRangeAndFilters
    ).not.toHaveBeenCalled();
    expect(mockCacheRepository.set).not.toHaveBeenCalled();
  });

  // Teste adicional para verificar a ordenação da chave de cache com filtros
  it("deve gerar a mesma chave de cache para filtros em ordens diferentes", async () => {
    const input1 = { start_date: "2025-11-01", end_date: "2025-11-10", type: "A", kind: "B"};
    const input2 = { start_date: "2025-11-01", end_date: "2025-11-10", kind: "B", type: "A"}; // Mesmos filtros, ordem diferente
    const expectedFiltersString = JSON.stringify({ kind: "B", type: "A" }); // Ordem alfabética
    const expectedCacheKey = `protocolos:2025-11-01:2025-11-10:${expectedFiltersString}`;

    mockCacheRepository.get.mockResolvedValue(null);
    mockWebhookReprocessadoRepository.listByDateRangeAndFilters.mockResolvedValue([]);

    await listarProtocolosUseCase.execute(input1);
    expect(mockCacheRepository.get).toHaveBeenCalledWith(expectedCacheKey);
    // Limpa a chamada anterior para verificar a próxima
    mockCacheRepository.get.mockClear();

    await listarProtocolosUseCase.execute(input2);
    expect(mockCacheRepository.get).toHaveBeenCalledWith(expectedCacheKey);
  });

});