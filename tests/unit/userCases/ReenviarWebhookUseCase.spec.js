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
  consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => { });
  consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => { });
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
  let mockServicoRepository;

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

    mockServicoRepository = {
      findByIdsAndCedente: jest.fn(),
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
      servicoRepository: mockServicoRepository,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should throw an error if id is not provided", async () => {
    mockServicoRepository.findByIdsAndCedente.mockResolvedValue([]);
    await expect(
      reenviarWebhookUseCase.execute(
        { cedente: { id: 1 }, id: [] }
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

    mockServicoRepository.findByIdsAndCedente.mockResolvedValue([]);
    mockRedisClient.get.mockResolvedValue(null);

    await expect(
      reenviarWebhookUseCase.execute(input)
    ).rejects.toThrow(
      "Não foi possível gerar a notificação. Os seguintes IDs não foram encontrados ou não pertencem ao cedente."
    );
  });

  test("should re-send the webhook successfully on a 2xx response", async () => {
    const fakeId = "boleto-123";

    // O mock simula o OBJETO SERVIÇO retornado pelo servicoRepository
    const fakeServico = {
      id: fakeId,
      status: "LIQUIDADO", // <--- DEVE SER IGUAL ao MAPA_SITUACAO["boleto"]["pago"]
      payload: { data: "test" }, // Conteúdo do payload a ser enviado
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

    mockServicoRepository.findByIdsAndCedente.mockResolvedValue([fakeServico]);
    mockRedisClient.get.mockResolvedValue(null);
    mockHttpClient.post.mockResolvedValue({ status: 200 });

    const result = await reenviarWebhookUseCase.execute(input);

    expect(result.protocolo).toBeDefined();
    expect(mockHttpClient.post).toHaveBeenCalledWith(
      fakeServico.url,
      fakeServico.payload,
      expect.anything()
    );
    expect(mockWebhookRepository.update).toHaveBeenCalled();
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
    mockServicoRepository.findByIdsAndCedente.mockResolvedValue([]);

    await expect(
      reenviarWebhookUseCase.execute(input)
    ).rejects.toThrow();

    expect(mockServicoRepository.findByIdsAndCedente).not.toHaveBeenCalled();
    expect(mockHttpClient.post).not.toHaveBeenCalled();
  });

  test("should update webhook but not save to reprocessado on HTTP error", async () => {
    const fakeId = "boleto-123";
    const fakeServico = {
      id: fakeId,
      status: "LIQUIDADO", // <--- Status correto para evitar a exceção prematura
      payload: { data: "test" },
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

    mockServicoRepository.findByIdsAndCedente.mockResolvedValue([fakeServico]);
    mockRedisClient.get.mockResolvedValue(null);

    // Rejeita a chamada HTTP para simular erro de reenvio
    mockHttpClient.post.mockRejectedValue(new Error("Network Error 500"));

    // Agora o fluxo deve chegar à chamada post e rejeitar
    await expect(reenviarWebhookUseCase.execute(input)).rejects.toThrow();

    expect(mockHttpClient.post).toHaveBeenCalled();
    expect(mockWebhookRepository.update).toHaveBeenCalled();
    expect(mockReprocessadoRepository.create).not.toHaveBeenCalled();
  });
});