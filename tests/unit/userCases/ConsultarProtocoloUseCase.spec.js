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