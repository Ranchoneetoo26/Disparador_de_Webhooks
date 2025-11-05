<<<<<<< HEAD
import { jest, describe, test, expect, beforeEach } from '@jest/globals'; // <-- CORREÇÃO 1
import ConsultarProtocoloUseCase from '../../../src/application/useCases/ConsultarProtocoloUseCase.js';
import { ProtocoloNaoEncontradoException } from '../../../src/domain/exceptions/ProtocoloNaoEncontradoException.js';

// --- Mocks (Simulações) ---
const mockCacheRepository = {
  get: jest.fn(),
  set: jest.fn(),
};

const mockReprocessadoRepository = {
  findByProtocolo: jest.fn(),
};

// Reseta os mocks antes de cada teste
beforeEach(() => {
  mockCacheRepository.get.mockReset();
  mockCacheRepository.set.mockReset();
  mockReprocessadoRepository.findByProtocolo.mockReset();
});
// --- Fim dos Mocks ---

describe('ConsultarProtocoloUseCase', () => {
  // CORREÇÃO 2: Instancia o UseCase com os mocks
  const useCase = new ConsultarProtocoloUseCase({
    cacheRepository: mockCacheRepository,
    webhookReprocessadoRepository: mockReprocessadoRepository,
  });

  const mockProtocolo = 'uuid-123-abc';
  const mockRecord = {
    id: 'uuid-real',
    protocolo: mockProtocolo,
    status: 'sent',
    data: {},
  };

  test('retorna dados do protocolo quando o uuid existe (cache miss) e salva no cache', async () => {
    mockCacheRepository.get.mockResolvedValue(null);
    mockReprocessadoRepository.findByProtocolo.mockResolvedValue(mockRecord);

    const result = await useCase.execute(mockProtocolo); // Passa a string direto

    expect(result).toEqual(mockRecord);
    expect(mockCacheRepository.get).toHaveBeenCalledWith(
      `protocolo:${mockProtocolo}`,
    );
    expect(mockReprocessadoRepository.findByProtocolo).toHaveBeenCalledWith(
      mockProtocolo,
    );
    expect(mockCacheRepository.set).toHaveBeenCalledWith(
      `protocolo:${mockProtocolo}`,
      mockRecord,
      { ttl: 3600 },
    );
  });

  test('retorna dados em cache quando estiver certo no cache (cache hit)', async () => {
    mockCacheRepository.get.mockResolvedValue(JSON.stringify(mockRecord));

    const result = await useCase.execute(mockProtocolo);

    expect(result).toEqual(mockRecord);
    expect(
      mockReprocessadoRepository.findByProtocolo,
    ).not.toHaveBeenCalled();
  });

  test('lança ProtocoloNaoEncontradoException quando não encontrado', async () => {
    mockCacheRepository.get.mockResolvedValue(null);
    mockReprocessadoRepository.findByProtocolo.mockResolvedValue(null);

    await expect(useCase.execute(mockProtocolo)).rejects.toThrow(
      ProtocoloNaoEncontradoException,
    );
  });
});
=======
const {
  describe,
  expect,
  beforeEach,
  test,
  beforeAll,
  afterAll,
} = require("@jest/globals");

// --- CORREÇÕES AQUI ---
// Mudamos de "import { default as ... }" para "import { ... }"
const ConsultarProtocoloUseCase = require("../../../src/application/useCases/ConsultarProtocoloUseCase.js");
const {
  ProtocoloNaoEncontradoException,
} = require("../../../src/domain/exceptions/ProtocoloNaoEncontradoException.js");
// --- FIM DAS CORREÇÕES ---

// Silenciar logs
let consoleLogSpy, consoleErrorSpy;
beforeAll(() => {
  consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
});
afterAll(() => {
  consoleLogSpy.mockRestore();
  consoleErrorSpy.mockRestore();
});

describe("ConsultarProtocoloUseCase", () => {
  let useCase;
  let mockWebhookReprocessadoRepository;
  let mockCacheRepository;

  beforeEach(() => {
    mockWebhookReprocessadoRepository = { findByProtocolo: jest.fn() };
    mockCacheRepository = { get: jest.fn(), set: jest.fn() };
    useCase = new ConsultarProtocoloUseCase({
      webhookReprocessadoRepository: mockWebhookReprocessadoRepository,
      cacheRepository: mockCacheRepository,
    });
  });

  test("retorna dados do protocolo quando o uuid existe (cache miss)", async () => {
    const uuid = "uuid-1234";
    const fakeRecord = { protocolo: uuid, data: { a: 1 }, status: "completed" };
    mockCacheRepository.get.mockResolvedValue(null);
    mockWebhookReprocessadoRepository.findByProtocolo.mockResolvedValue(
      fakeRecord
    );
    const result = await useCase.execute(uuid);
    expect(result).toEqual(fakeRecord);
    expect(mockCacheRepository.set).toHaveBeenCalledWith(
      `protocolo:${uuid}`,
      JSON.stringify(fakeRecord),
      { ttl: 3600 }
    );
  });

  test("retorna dados em cache quando estiver certo no cache (cache hit)", async () => {
    const uuid = "uuid-cache";
    const fakeRecord = { protocolo: uuid, data: { a: 1 }, status: "completed" };
    mockCacheRepository.get.mockResolvedValue(JSON.stringify(fakeRecord));
    const result = await useCase.execute(uuid);
    expect(result).toEqual(fakeRecord);
    expect(
      mockWebhookReprocessadoRepository.findByProtocolo
    ).not.toHaveBeenCalled();
  });

  test("lança ProtocoloNaoEncontradoException quando não encontrado", async () => {
    const uuid = "nao-existe";
    mockCacheRepository.get.mockResolvedValue(null);
    mockWebhookReprocessadoRepository.findByProtocolo.mockResolvedValue(null);
    await expect(useCase.execute(uuid)).rejects.toThrow(
      ProtocoloNaoEncontradoException
    );
  });
});
>>>>>>> ac74577e24c01cb6576b44326ef20c19e70cd838
