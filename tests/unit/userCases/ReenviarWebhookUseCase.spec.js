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

    mockRedisClient = {
      get: jest.fn(),
      set: jest.fn(),
    };

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

    const payload = {
      product: 'boleto',
      id: ['999'],
      kind: 'webhook',
      type: 'disponivel'
    };

    await expect(reenviarWebhookUseCase.execute(payload)).rejects.toMatchObject({
      message: expect.stringContaining('Nenhum registro encontrado'),
    });
  });

  it('should re-send successfully and persist reprocessado', async () => {
    mockRedisClient.get.mockResolvedValue(null);

    // CORREÇÃO CRÍTICA: Mudar status para status_servico
    const registros = [{
      id: '1',
      status_servico: 'REGISTRADO',
      tentativas: 0,
      cedente_id: 123, // Adicionando cedente_id para evitar notNull no Use Case
    }];
    mockWebhookRepository.findByIds.mockResolvedValue(registros);

    const protocoloMock = 'protocolo-123';
    mockHttpClient.post.mockResolvedValue({ data: { protocolo: protocoloMock } });

    const payload = {
      product: 'boleto',
      id: ['1'],
      kind: 'webhook',
      type: 'disponivel'
    };

    const result = await reenviarWebhookUseCase.execute(payload);

    expect(result).toEqual({ success: true, protocolo: protocoloMock });
    // Usando o método set (ou setEx) que for mais apropriado para o seu cliente
    expect(mockRedisClient.set).toHaveBeenCalled();
    expect(mockReprocessadoRepository.create).toHaveBeenCalledWith(expect.objectContaining({
      protocolo: protocoloMock,
      cedente_id: 123, // Verificar se o cedente_id está sendo passado
    }));
  });

  it('should register reprocessado and increment tentativas on network error', async () => {
    mockRedisClient.get.mockResolvedValue(null);

    // CORREÇÃO CRÍTICA: Mudar status para status_servico
    const registros = [{
      id: '3',
      status_servico: 'REGISTRADO',
      tentativas: 1,
      cedente_id: 123, // Adicionando cedente_id para evitar notNull no Use Case
    }];
    mockWebhookRepository.findByIds.mockResolvedValue(registros);

    const networkError = new Error('Request failed with status code 404');
    mockHttpClient.post.mockRejectedValue(networkError);

    const payload = {
      product: 'boleto',
      id: ['3'],
      kind: 'webhook',
      type: 'disponivel'
    };

    // O Use Case lança um erro genérico de notificação não gerada (400)
    await expect(reenviarWebhookUseCase.execute(payload)).rejects.toMatchObject({
      message: expect.stringContaining('Não foi possível gerar a notificação'),
    });

    expect(mockReprocessadoRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: payload,
        kind: 'webhook',
        type: 'disponivel',
        servico_id: JSON.stringify(payload.id),
        protocolo: expect.stringContaining('error:'),
        cedente_id: 123, // Verificar se o cedente_id está sendo passado
      })
    );

    expect(mockWebhookRepository.update).toHaveBeenCalledWith('3', {
      tentativas: 2
    });
  });
});