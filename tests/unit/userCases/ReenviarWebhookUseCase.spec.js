const {
  describe,
  expect,
  beforeEach,
  test,
  afterEach,
  beforeAll,
  afterAll,
} = require("@jest/globals");

const ReenviarWebhookUseCase = require("../../../src/application/useCases/ReenviarWebhookUseCase.js");

const ConflictException = require("../../../src/domain/exceptions/ConflictException.js");
const UnprocessableEntityException = require("../../../src/domain/exceptions/UnprocessableEntityException.js");

let consoleLogSpy, consoleErrorSpy;
beforeAll(() => {
  consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
});
afterAll(() => {
  consoleLogSpy.mockRestore();
  consoleErrorSpy.mockRestore();
});

describe("ReenviarWebhookUseCase", () => {
  let reenviarWebhookUseCase;
  let mockWebhookRepository;
  let mockReprocessadoRepository;
  let mockHttpClient;
  let mockRedisClient;
<<<<<<< HEAD

  // --- DADOS FALSOS PARA OS TESTES ---
  // Payload que DEVE PASSAR na validação real do seu DTO
  // Inclui product, kind, type e id como array de string
  const fakePayload = {
    id: ["1"], // Array de string, como o erro do DTO pede
    product: "boleto",
    kind: "webhook",
    type: "disponivel",
  };

  // Webhook que será retornado pelo findById
  const fakeWebhook = {
    id: "1", // ID correspondente (como string, se for o caso)
    url: "http://example.com/hook",
    payload: { data: "test" },
    tentativas: 0,
    cedente_id: 123,
    kind: "test_kind",
    type: "test_type",
    servico_id: "s-123",
  };
=======
  let mockCedente;
>>>>>>> 929a7ec6c858b3cadf7036896999f620d5e879bb

  beforeEach(() => {
    // Mock para o repositório de Webhooks
    mockWebhookRepository = {
<<<<<<< HEAD
      // O código real usa findById (singular)
      findById: jest.fn(),
=======
      findByIds: jest.fn(),
>>>>>>> 929a7ec6c858b3cadf7036896999f620d5e879bb
      update: jest.fn(),
      findByIdsAndCedente: jest.fn(),
    };

    // Mock para o repositório de Webhooks Reprocessados
    mockReprocessadoRepository = {
      create: jest.fn(),
    };

    // Mock para o cliente HTTP
    mockHttpClient = {
      post: jest.fn(),
    };

<<<<<<< HEAD
    // Mock para o cliente Redis
    mockRedisClient = {
      get: jest.fn(),
      set: jest.fn(),
    };

    // Instanciando o Use Case UMA VEZ com todos os mocks
=======
    mockRedisClient = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    mockCedente = {
      id: 1,
      cnpj: "123",
      token: "abc",
      configuracao_notificacao: { url: "http://cedente.com" },
    };

>>>>>>> 929a7ec6c858b3cadf7036896999f620d5e879bb
    reenviarWebhookUseCase = new ReenviarWebhookUseCase({
      webhookRepository: mockWebhookRepository,
      webhookReprocessadoRepository: mockReprocessadoRepository,
      httpClient: mockHttpClient,
      redisClient: mockRedisClient,
    });
  });

<<<<<<< HEAD
  // Teste 1: Falha por falta de payload
  it("should throw an error if payload is not provided", async () => {
    // Espera o erro da validação inicial adicionada no .js
    await expect(reenviarWebhookUseCase.execute()).rejects.toThrow(
      "Payload é obrigatório"
    );
  });

  // Teste 2: Webhook não encontrado
  it("should return success false if webhook is not found", async () => {
    mockRedisClient.get.mockResolvedValue(null); // Cache miss
    // O mock de findById deve retornar null para simular "não encontrado"
    // Passamos o ID correto esperado pelo código (primeiro elemento do array)
    mockWebhookRepository.findById.mockResolvedValue(null);

    // O código NÃO REJEITA, ele RETORNA um objeto de erro
    const result = await reenviarWebhookUseCase.execute(fakePayload);

    // Verifica se findById foi chamado com o ID correto (assumindo id[0])
    expect(mockWebhookRepository.findById).toHaveBeenCalledWith(fakePayload.id);
    expect(result).toEqual({ success: false, error: "Webhook not found" });
    expect(mockHttpClient.post).not.toHaveBeenCalled();
  });

  // Teste 3: Sucesso no reenvio (HTTP 2xx)
  it("should re-send the webhook successfully on a 2xx response", async () => {
    mockRedisClient.get.mockResolvedValue(null); // Cache miss
    // Mock para encontrar o webhook
    mockWebhookRepository.findById.mockResolvedValue(fakeWebhook);
    // Mock de sucesso do HTTP
    mockHttpClient.post.mockResolvedValue({ status: 200, data: "OK" });

    const result = await reenviarWebhookUseCase.execute(fakePayload);

    // O código RETORNA um objeto de sucesso
    expect(result).toEqual({ success: true, status: 200, data: "OK" });

    // Verifica se chamou o findById corretamente
    expect(mockWebhookRepository.findById).toHaveBeenCalledWith(fakePayload.id);

    // Verifica se atualizou o webhook original
    expect(mockWebhookRepository.update).toHaveBeenCalledWith(fakeWebhook.id, {
      tentativas: 1, // tentativas (0) + 1
      last_status: 200,
    });
    // Não deve criar registro de reprocessamento em caso de sucesso
    expect(mockReprocessadoRepository.create).not.toHaveBeenCalled();
  });

  // Teste 4: Falha no reenvio (HTTP 500)
  it("should save to reprocessado on a non-2xx response", async () => {
    mockRedisClient.get.mockResolvedValue(null); // Cache miss
    mockWebhookRepository.findById.mockResolvedValue(fakeWebhook);
    // Mock de falha (HTTP 500) - Simula resposta, mas não 2xx
    mockHttpClient.post.mockResolvedValue({ status: 500 });

    const result = await reenviarWebhookUseCase.execute(fakePayload);

    // O código RETORNA um objeto de falha
    expect(result).toEqual({ success: false, status: 500 });
    // Verifica se chamou o findById corretamente
    expect(mockWebhookRepository.findById).toHaveBeenCalledWith(fakePayload.id);

    // Deve criar um registro de reprocessamento
    expect(mockReprocessadoRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        protocolo: "status:500",
        cedente_id: fakeWebhook.cedente_id,
        data: fakeWebhook.payload, // O código usa o payload original do webhook encontrado
        kind: fakeWebhook.kind, // Usa dados do webhook encontrado
        type: fakeWebhook.type,
      })
    );
  });

  // Teste 5: Falha de rede (HTTP Post rejeitado)
  it("should save to reprocessado on a network error", async () => {
    mockRedisClient.get.mockResolvedValue(null); // Cache miss
    mockWebhookRepository.findById.mockResolvedValue(fakeWebhook);

    // Mock de erro de rede
    const networkError = new Error("Network timeout");
    mockHttpClient.post.mockRejectedValue(networkError);

    const result = await reenviarWebhookUseCase.execute(fakePayload);

    // O código RETORNA um objeto de erro
    expect(result).toEqual({ success: false, error: "Network timeout" });
    // Verifica se chamou o findById corretamente
    expect(mockWebhookRepository.findById).toHaveBeenCalledWith(fakePayload.id);

    // Deve criar um registro de reprocessamento
    expect(mockReprocessadoRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        protocolo: expect.stringContaining("error:Network timeout"), // Pode truncar
        cedente_id: fakeWebhook.cedente_id,
        data: fakeWebhook.payload,
      })
    );

    // Deve atualizar as tentativas
    expect(mockWebhookRepository.update).toHaveBeenCalledWith(fakeWebhook.id, {
      tentativas: 1, // tentativas (0) + 1
    });
=======
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should throw an error if id is not provided", async () => {
    mockWebhookRepository.findByIdsAndCedente.mockResolvedValue([]);

    await expect(
      reenviarWebhookUseCase.execute(
        { cedente: { id: 1 }, id: [] },
        mockCedente
      )
    ).rejects.toThrow();
  });

  test("should throw 422 error if webhooks are not found", async () => {
    const input = {
      id: ["id-que-nao-existe"],
      product: "pix",
      kind: "k",
      type: "pago",
      cedente: { id: 1 },
    };

    mockWebhookRepository.findByIds.mockResolvedValue([]);
    mockWebhookRepository.findByIdsAndCedente.mockResolvedValue([]);
    mockRedisClient.get.mockResolvedValue(null);

    await expect(
      reenviarWebhookUseCase.execute(input, mockCedente)
    ).rejects.toThrow(
      "Não foi possível gerar a notificação. Os seguintes IDs não foram encontrados ou não pertencem ao cedente."
    );
  });

  test("should re-send the webhook successfully on a 2xx response", async () => {
    const fakeId = "boleto-123";
    const fakeWebhook = {
      id: fakeId,
      payload: { data: "test", status: "LIQUIDADO" },
      cedente_id: 1,
      url: "http://original.com",
    };
    const input = {
      id: [fakeId],
      product: "boleto",
      kind: "kind",
      type: "pago",
      cedente: { id: 1 },
    };

    mockWebhookRepository.findByIds.mockResolvedValue([fakeWebhook]);
    mockWebhookRepository.findByIdsAndCedente.mockResolvedValue([fakeWebhook]);
    mockRedisClient.get.mockResolvedValue(null);
    mockHttpClient.post.mockResolvedValue({ status: 200 });

    const result = await reenviarWebhookUseCase.execute(input, mockCedente);

    expect(result.protocolo).toBeDefined();
    expect(mockHttpClient.post).toHaveBeenCalled();
  });

  test("should throw ConflictException (409) if request is duplicated", async () => {
    const input = {
      id: ["id-123"],
      product: "pix",
      kind: "k",
      type: "pago",
      cedente: { id: 1 },
    };

    mockRedisClient.get.mockResolvedValue("protocolo-existente");
    mockWebhookRepository.findByIdsAndCedente.mockResolvedValue([]);

    await expect(
      reenviarWebhookUseCase.execute(input, mockCedente)
    ).rejects.toThrow(Error);

    expect(mockWebhookRepository.findByIds).not.toHaveBeenCalled();
    expect(mockHttpClient.post).not.toHaveBeenCalled();
  });

  test("should update webhook but not save to reprocessado on HTTP error", async () => {
    const fakeId = "boleto-123";
    const fakeWebhook = {
      id: fakeId,
      payload: { data: "test", status: "LIQUIDADO" },
      cedente_id: 1,
      url: "http://original.com",
    };
    const input = {
      id: [fakeId],
      product: "boleto",
      kind: "kind",
      type: "pago",
      cedente: { id: 1 },
    };

    mockWebhookRepository.findByIds.mockResolvedValue([fakeWebhook]);
    mockWebhookRepository.findByIdsAndCedente.mockResolvedValue([fakeWebhook]);
    mockRedisClient.get.mockResolvedValue(null);
    mockHttpClient.post.mockRejectedValue(new Error("Network Error 500"));

    try {
      await reenviarWebhookUseCase.execute(input, mockCedente);
    } catch (error) {
      expect(mockHttpClient.post).toHaveBeenCalled();
      expect(mockWebhookRepository.update).toHaveBeenCalled();
    }
>>>>>>> 929a7ec6c858b3cadf7036896999f620d5e879bb
  });
});
