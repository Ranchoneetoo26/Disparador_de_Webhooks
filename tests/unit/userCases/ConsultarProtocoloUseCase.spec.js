import { describe, it, expect, beforeEach, jest } from '@jest/globals';

import ConsultarProtocoloUseCase from '@/application/useCases/ConsultarProtocoloUseCase';
import { ProtocoloNaoEncontradoException } from '@/domain/exceptions/ProtocoloNaoEncontradoException';

describe('ConsultarProtocoloUseCase', () => {
  let useCase;
  let mockCacheRepository;
  let mockWebhookReprocessadoRepository;

  beforeEach(() => {
    mockCacheRepository = {
      get: jest.fn(),
      set: jest.fn(),
    };

    mockWebhookReprocessadoRepository = {
      findByProtocolo: jest.fn(),
    };

    useCase = new ConsultarProtocoloUseCase({
      cacheRepository: mockCacheRepository,
      webhookReprocessadoRepository: mockWebhookReprocessadoRepository,
    });
  });

  it('retorna dados do protocolo quando o uuid existe', async () => {
    const uuid = 'uuid-1234';

    mockCacheRepository.get.mockResolvedValue(null);

    // CORREÇÃO 1: Adicionar a propriedade status: 'sent'
    const fakeRecord = { protocolo: uuid, data: { a: 1 }, status: 'sent' };
    mockWebhookReprocessadoRepository.findByProtocolo.mockResolvedValue(fakeRecord);

    const result = await useCase.execute({ protocolo: uuid });

    expect(result).toEqual(fakeRecord);
    expect(mockCacheRepository.get).toHaveBeenCalledWith(`protocolo:${uuid}`);
    expect(mockWebhookReprocessadoRepository.findByProtocolo).toHaveBeenCalledWith(uuid);

    // CORREÇÃO 2: Esperar a string JSON, e não o objeto
    expect(mockCacheRepository.set).toHaveBeenCalledWith(
      `protocolo:${uuid}`,
      JSON.stringify(fakeRecord), // O Use Case salva a string
      { ttl: 3600 }
    );
  });

  it('retorna dados em cache quando estiver certo no cache', async () => {
    const uuid = 'uuid-cache';
    const cached = { protocolo: uuid, data: { b: 2 } };

    mockCacheRepository.get.mockResolvedValue(cached);

    const result = await useCase.execute({ protocolo: uuid });

    expect(result).toEqual(cached);
    expect(mockCacheRepository.get).toHaveBeenCalledWith(`protocolo:${uuid}`);
    expect(mockWebhookReprocessadoRepository.findByProtocolo).not.toHaveBeenCalled();
  });

  it('lança ProtocoloNaoEncontradoException quando não encontrado', async () => {
    const uuid = 'não existe';
    mockCacheRepository.get.mockResolvedValue(null);
    mockWebhookReprocessadoRepository.findByProtocolo.mockResolvedValue(null);

    await expect(useCase.execute({ protocolo: uuid })).rejects.toThrow('Protocolo não encontrado');
  });
});
