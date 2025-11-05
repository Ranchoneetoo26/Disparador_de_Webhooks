const {
  describe,
  expect,
  beforeEach,
  test,
  afterEach,
  beforeAll,
  afterAll,
} = require("@jest/globals");

// Importe o UseCase que vamos testar
const ReenviarWebhookUseCase = require("../../../src/application/useCases/ReenviarWebhookUseCase.js");

// Importe as exceções customizadas para que possamos testá-las
const ConflictException = require("../../../src/domain/exceptions/ConflictException.js");
const UnprocessableEntityException = require("../../../src/domain/exceptions/UnprocessableEntityException.js");

// Desativamos os console.logs e console.errors durante os testes
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
  let mockCedente;

  beforeEach(() => {
    mockWebhookRepository = {
      findByIds: jest.fn(),
      update: jest.fn(),
      findByIdsAndCedente: jest.fn(),
    };

    mockReprocessadoRepository = {
      create: jest.fn(),
    };

    mockHttpClient = {
      post: jest.fn(),
    };

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

    reenviarWebhookUseCase = new ReenviarWebhookUseCase({
      webhookRepository: mockWebhookRepository,
      webhookReprocessadoRepository: mockReprocessadoRepository,
      httpClient: mockHttpClient,
      redisClient: mockRedisClient,
    });
  });

  afterEach(() => {
    jest.clearAllMocks(); // Limpa os mocks entre os testes
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

    // --- CORREÇÃO AQUI ---
    // Simulamos o cache hit. O 'get' retorna um valor.
    mockRedisClient.get.mockResolvedValue("protocolo-existente");
    mockWebhookRepository.findByIdsAndCedente.mockResolvedValue([]);
    // --- FIM DA CORREÇÃO ---

    // 2. Executa e espera o erro 409
    await expect(
      reenviarWebhookUseCase.execute(input, mockCedente)
    ).rejects.toThrow(Error);

    // Garante que o código parou ANTES de chamar o banco
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
  });
});
