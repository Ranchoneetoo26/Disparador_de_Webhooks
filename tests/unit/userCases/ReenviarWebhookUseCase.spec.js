import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import ReenviarWebhookUseCase from '../../../src/application/useCases/ReenviarWebhookUseCase.js';

describe('ReenviarWebhookUseCase', () => {
  let reenviarWebhookUseCase;
  let mockWebhookRepository;
  let mockReprocessadoRepository;
  let mockHttpClient;
  let mockRedisClient;

  beforeEach(() => {
    mockWebhookRepository = {
      findByIds: jest.fn(),
      update: jest.fn(),
    };

    mockReprocessadoRepository = {
      create: jest.fn(),
    };

    mockHttpClient = {
      post: jest.fn(),
    };

<<<<<<< HEAD
    mockRedisClient = {
      get: jest.fn(),
      setEx: jest.fn(),
    };

=======
>>>>>>> c0863978c9428b9f79e93829b4ccbe950281acc9
    reenviarWebhookUseCase = new ReenviarWebhookUseCase({
      webhookRepository: mockWebhookRepository,
      webhookReprocessadoRepository: mockReprocessadoRepository,
      httpClient: mockHttpClient,
      redisClient: mockRedisClient,
    });
  });

  it('should throw if payload is missing or invalid', async () => {
    await expect(reenviarWebhookUseCase.execute()).rejects.toThrow();
  });

  it('should throw when no registros found', async () => {
    mockRedisClient.get.mockResolvedValue(null);
    mockWebhookRepository.findByIds.mockResolvedValue([]);

    const payload = { product: 'boleto', id: [999], kind: 'k', type: 'disponivel' };

    await expect(reenviarWebhookUseCase.execute(payload)).rejects.toMatchObject({
      message: expect.stringContaining('Nenhum registro encontrado'),
    });
  });

  it('should re-send successfully and persist reprocessado', async () => {
    mockRedisClient.get.mockResolvedValue(null);

    const registros = [{ id: 1, status: 'REGISTRADO', tentativas: 0 }];
    mockWebhookRepository.findByIds.mockResolvedValue(registros);

    const protocoloMock = 'protocolo-123';
    mockHttpClient.post.mockResolvedValue({ data: { protocolo: protocoloMock } });

    const payload = { product: 'boleto', id: [1], kind: 'k', type: 'disponivel' };

    const result = await reenviarWebhookUseCase.execute(payload);

    expect(result).toEqual({ success: true, protocolo: protocoloMock });
    expect(mockRedisClient.setEx).toHaveBeenCalled();
    expect(mockReprocessadoRepository.create).toHaveBeenCalledWith(expect.objectContaining({
      protocolo: protocoloMock,
    }));
  });

  it('should register reprocessado and increment tentativas on network error', async () => {
    mockRedisClient.get.mockResolvedValue(null);

    const registros = [{ id: 3, status: 'REGISTRADO', tentativas: 1 }];
    mockWebhookRepository.findByIds.mockResolvedValue(registros);

    const networkError = new Error('Network timeout');
    mockHttpClient.post.mockRejectedValue(networkError);

    const payload = { product: 'boleto', id: [3], kind: 'k', type: 'disponivel' };

    await expect(reenviarWebhookUseCase.execute(payload)).rejects.toMatchObject({
      message: expect.stringContaining('Não foi possível gerar a notificação'),
    });

    expect(mockReprocessadoRepository.create).toHaveBeenCalledWith(expect.objectContaining({
      protocolo: expect.stringContaining('error:'),
    }));
    expect(mockWebhookRepository.update).toHaveBeenCalledWith(3, { tentativas: 2 });
  });
});