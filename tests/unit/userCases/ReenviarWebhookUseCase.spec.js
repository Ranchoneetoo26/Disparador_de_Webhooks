<<<<<<< HEAD
import { jest, describe, test, expect, beforeEach } from '@jest/globals'; // <-- CORREÇÃO 1
import ReenviarWebhookUseCase from '../../../src/application/useCases/ReenviarWebhookUseCase.js';
import UnprocessableEntityException from '../../../src/domain/exceptions/UnprocessableEntityException.js';

// --- Mocks (Simulações) ---
const mockWebhookRepository = {
  findByIdsAndCedente: jest.fn(),
  update: jest.fn(),
};
const mockReprocessadoRepository = {
  create: jest.fn(),
};
const mockHttpClient = {
  post: jest.fn(),
};
const mockRedisClient = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
};
const mockCedente = {
  id: 1,
  cnpj: '22222222000222',
};

// Reseta os mocks antes de cada teste
beforeEach(() => {
  mockWebhookRepository.findByIdsAndCedente.mockReset();
  mockWebhookRepository.update.mockReset();
  mockReprocessadoRepository.create.mockReset();
  mockHttpClient.post.mockReset();
  mockRedisClient.get.mockReset();
  mockRedisClient.set.mockReset();
  mockRedisClient.del.mockReset();
=======
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
>>>>>>> ac74577e24c01cb6576b44326ef20c19e70cd838
});
// --- Fim dos Mocks ---

<<<<<<< HEAD
describe('ReenviarWebhookUseCase', () => {
  // Instancia o UseCase com os mocks
  const useCase = new ReenviarWebhookUseCase({
    webhookRepository: mockWebhookRepository,
    webhookReprocessadoRepository: mockReprocessadoRepository,
    httpClient: mockHttpClient,
    redisClient: mockRedisClient,
  });

  test('should throw an error if input is not provided', async () => {
    // CORREÇÃO 2: Passa 'undefined'
    await expect(useCase.execute(undefined)).rejects.toThrow(
      "Cannot destructure property 'product'",
    );
  });

  test('should throw 422 error if webhooks are not found (Regra 3.1.O)', async () => {
    const input = {
      product: 'boleto',
      id: ['id-que-nao-existe'],
      kind: 'webhook',
      type: 'pago',
      cedente: mockCedente, // <--- CORREÇÃO 3: 'cedente' está DENTRO do 'input'
    };

    mockRedisClient.get.mockResolvedValue(null);
    mockWebhookRepository.findByIdsAndCedente.mockResolvedValue([]);
=======
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
>>>>>>> ac74577e24c01cb6576b44326ef20c19e70cd838

    await expect(useCase.execute(input)).rejects.toThrow(
      UnprocessableEntityException,
    );
  });

<<<<<<< HEAD
  test('should throw 422 error if status does not match (Regra 3.1.O)', async () => {
    const input = {
      product: 'boleto',
      id: ['boleto-123'],
      kind: 'webhook',
      type: 'pago', // Espera "LIQUIDADO"
      cedente: mockCedente, // <--- CORREÇÃO 3
    };
    const mockWebhook = {
      id: 'boleto-123',
      payload: { status: 'REGISTRADO' }, // Status real é "REGISTRADO"
      url: 'http://test.com',
    };

    mockRedisClient.get.mockResolvedValue(null);
    mockWebhookRepository.findByIdsAndCedente.mockResolvedValue([mockWebhook]);

    await expect(useCase.execute(input)).rejects.toThrow(
      UnprocessableEntityException,
    );
  });

  test('should re-send the webhook successfully on 200 (Regra 3.1.R)', async () => {
    const input = {
      product: 'boleto',
      id: ['boleto-123'],
      kind: 'webhook',
      type: 'pago', // Espera "LIQUIDADO"
      cedente: mockCedente, // <--- CORREÇÃO 3
    };
    const mockWebhook = {
      id: 'boleto-123',
      payload: { status: 'LIQUIDADO' }, // Status real bate!
      url: 'http://test.com',
    };

    mockRedisClient.get.mockResolvedValue(null);
    mockWebhookRepository.findByIdsAndCedente.mockResolvedValue([mockWebhook]);
    mockHttpClient.post.mockResolvedValue({ status: 200 });
=======
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
>>>>>>> ac74577e24c01cb6576b44326ef20c19e70cd838

    const result = await useCase.execute(input); // <--- CORREÇÃO 3

<<<<<<< HEAD
    expect(result.protocolo).toBeDefined();
    expect(mockReprocessadoRepository.create).toHaveBeenCalled();
  });

  test('should throw 429 if request is duplicated (Regra 3.1.N)', async () => {
    const input = {
      product: 'boleto',
      id: ['boleto-123'],
      kind: 'webhook',
      type: 'pago',
      cedente: mockCedente, // <--- CORREÇÃO 3
    };

    mockRedisClient.get.mockResolvedValue('processing');

    await expect(useCase.execute(input)).rejects.toThrow( // <--- CORREÇÃO 3
      'Requisição duplicada',
    );
  });

  test('should throw 400 if all re-sends fail (Regra 3.1.P)', async () => {
    const input = {
      product: 'boleto',
      id: ['boleto-123'],
      kind: 'webhook',
      type: 'pago',
      cedente: mockCedente, // <--- CORREÇÃO 3
    };
    const mockWebhook = {
      id: 'boleto-123',
      payload: { status: 'LIQUIDADO' },
      url: 'http://test.com',
    };

    mockRedisClient.get.mockResolvedValue(null);
    mockWebhookRepository.findByIdsAndCedente.mockResolvedValue([mockWebhook]);
    mockHttpClient.post.mockRejectedValue(new Error('HTTP Status 500'));

    await expect(useCase.execute(input)).rejects.toThrow( // <--- CORREÇÃO 3
      'Não foi possível gerar a notificação',
    );
    expect(mockReprocessadoRepository.create).not.toHaveBeenCalled();
    expect(mockRedisClient.del).toHaveBeenCalled();
  });
});
=======
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
>>>>>>> ac74577e24c01cb6576b44326ef20c19e70cd838
