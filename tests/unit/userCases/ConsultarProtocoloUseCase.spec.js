import { jest, describe, expect, beforeEach, test, beforeAll, afterAll } from "@jest/globals";

// --- CORREÇÕES AQUI ---
// Mudamos de "import { default as ... }" para "import { ... }"
import { default as ConsultarProtocoloUseCase } from "../../../src/application/useCases/ConsultarProtocoloUseCase.js";
import { ProtocoloNaoEncontradoException } from "../../../src/domain/exceptions/ProtocoloNaoEncontradoException.js";
// --- FIM DAS CORREÇÕES ---

// Silenciar logs
let consoleLogSpy, consoleErrorSpy;
beforeAll(() => {
  consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterAll(() => {
  consoleLogSpy.mockRestore();
  consoleErrorSpy.mockRestore();
});


describe('ConsultarProtocoloUseCase', () => {
  let useCase;
  let mockWebhookReprocessadoRepository;
  let mockCacheRepository;

  beforeEach(() => {
    mockWebhookReprocessadoRepository = { findByProtocolo: jest.fn() };
    mockCacheRepository = { get: jest.fn(), set: jest.fn() };
    useCase = new ConsultarProtocoloUseCase(
      mockWebhookReprocessadoRepository,
      mockCacheRepository
    );
  });

  test('retorna dados do protocolo quando o uuid existe (cache miss)', async () => {
    const uuid = 'uuid-1234';
    const fakeRecord = { protocolo: uuid, data: { a: 1 }, status: 'completed' };
    mockCacheRepository.get.mockResolvedValue(null); 
    mockWebhookReprocessadoRepository.findByProtocolo.mockResolvedValue(fakeRecord);
    const result = await useCase.execute(uuid);
    expect(result).toEqual(fakeRecord); 
    expect(mockCacheRepository.set).toHaveBeenCalledWith(
      `protocolo:${uuid}`, 
      JSON.stringify(fakeRecord), 
      { ttl: 3600 }
    );
  });

  test('retorna dados em cache quando estiver certo no cache (cache hit)', async () => {
    const uuid = 'uuid-cache';
    const fakeRecord = { protocolo: uuid, data: { a: 1 }, status: 'completed' };
    mockCacheRepository.get.mockResolvedValue(JSON.stringify(fakeRecord));
    const result = await useCase.execute(uuid);
    expect(result).toEqual(fakeRecord); 
    expect(mockWebhookReprocessadoRepository.findByProtocolo).not.toHaveBeenCalled();
  });

  test('lança ProtocoloNaoEncontradoException quando não encontrado', async () => {
    const uuid = 'nao-existe';
    mockCacheRepository.get.mockResolvedValue(null); 
    mockWebhookReprocessadoRepository.findByProtocolo.mockResolvedValue(null); 
    await expect(useCase.execute(uuid)).rejects.toThrow(ProtocoloNaoEncontradoException);
  });
});