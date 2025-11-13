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
    // CORREÇÃO AQUI: Estrutura do objeto simulado atualizada para ter 'data.payload'
    const fakeWebhook = {
      id: fakeId,
      cedente_id: 1,
      data: {
        url: "http://original.com",
        payload: { data: "test", status: "LIQUIDADO" },
      },
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

    // CORREÇÃO AQUI: Espera o novo formato de resposta { success: true, ... }
    expect(result).toEqual({
      success: true,
      protocolo: expect.any(String),
      message: "Webhook reenviado com sucesso.",
    });
    expect(mockHttpClient.post).toHaveBeenCalledWith(
      "http://original.com",
      { data: "test", status: "LIQUIDADO" },
      { timeout: 5000 }
    );
    expect(mockReprocessadoRepository.create).toHaveBeenCalled();
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
    // CORREÇÃO AQUI: Estrutura do objeto simulado atualizada
    const fakeWebhook = {
      id: fakeId,
      cedente_id: 1,
      data: {
        url: "http://original.com",
        payload: { data: "test", status: "LIQUIDADO" },
      },
      tentativas: 1,
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
        // Esperado cair aqui
    }
    
    expect(mockHttpClient.post).toHaveBeenCalled();
    // Verifica se atualizou tentivas para 2
    expect(mockWebhookRepository.update).toHaveBeenCalledWith(fakeId, {
      tentativas: 2,
      last_status: null,
    });
    expect(mockReprocessadoRepository.create).not.toHaveBeenCalled();
  });
});