// tests/unit/userCases/ReenviarWebhookUseCase.spec.js

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import ReenviarWebhookUseCase from '@/application/useCases/ReenviarWebhookUseCase';

describe('ReenviarWebhookUseCase', () => {
  let reenviarWebhookUseCase;
  let mockWebhookRepository;
  let mockReprocessadoRepository;
  let mockHttpClient;
  let mockRedisClient;

  beforeEach(() => {
    mockWebhookRepository = { findByIds: jest.fn(), update: jest.fn() };
    mockReprocessadoRepository = { create: jest.fn() };
    mockHttpClient = { post: jest.fn() };
    mockRedisClient = { get: jest.fn(), setEx: jest.fn() };

    reenviarWebhookUseCase = new ReenviarWebhookUseCase({
      webhookRepository: mockWebhookRepository,
      webhookReprocessadoRepository: mockReprocessadoRepository,
      httpClient: mockHttpClient,
      redisClient: mockRedisClient,
    });
  });

  it('should throw a validation error if payload is invalid', async () => {
    const invalidPayload = { product: 'boleto' }; // Faltando id, kind, type
    
    const expectedErrorMessage = 'O campo "id" é obrigatório. | O campo "kind" é obrigatório. | O campo "type" é obrigatório.';

    await expect(reenviarWebhookUseCase.execute(invalidPayload)).rejects.toThrow(expectedErrorMessage);
  });

  it('should throw a 400 error if the request is duplicated (found in cache)', async () => {
    const payload = { product: 'boleto', id: ['123'], kind: 'webhook', type: 'disponivel' };
    mockRedisClient.get.mockResolvedValue('true');

    await expect(reenviarWebhookUseCase.execute(payload)).rejects.toMatchObject({
      message: 'Requisição duplicada. Tente novamente em 1 hora.',
      status: 400,
    });
  });

  it('should throw a 400 error if no webhooks are found for the given IDs', async () => {
    const payload = { product: 'boleto', id: ['999'], kind: 'webhook', type: 'disponivel' };
    mockRedisClient.get.mockResolvedValue(null);
    mockWebhookRepository.findByIds.mockResolvedValue([]);

    await expect(reenviarWebhookUseCase.execute(payload)).rejects.toMatchObject({
      message: 'Nenhum registro encontrado para os IDs informados.',
      status: 400,
    });
  });

  it('should throw a 422 error if webhook status diverges from the expected status', async () => {
    const payload = { product: 'boleto', id: ['123'], kind: 'webhook', type: 'disponivel' };
    const fakeRegistro = { id: '123', status: 'STATUS_DIFERENTE' };

    mockRedisClient.get.mockResolvedValue(null);
    mockWebhookRepository.findByIds.mockResolvedValue([fakeRegistro]);

    await expect(reenviarWebhookUseCase.execute(payload)).rejects.toMatchObject({
      message: 'Não foi possível gerar a notificação. A situação do boleto diverge do tipo de notificação solicitado.',
      status: 422,
      ids_invalidos: ['123'],
    });
  });

  it('should re-send the webhook, save to reprocessed, and cache the request on success', async () => {
    const payload = { product: 'pix', id: ['456'], kind: 'webhook', type: 'pago' };
    const fakeRegistro = { id: '456', status: 'LIQUIDATED' };
    const fakeProtocolo = 'protocolo-de-sucesso-123';

    mockRedisClient.get.mockResolvedValue(null);
    mockWebhookRepository.findByIds.mockResolvedValue([fakeRegistro]);
    mockHttpClient.post.mockResolvedValue({ data: { protocolo: fakeProtocolo } });

    const result = await reenviarWebhookUseCase.execute(payload);

    expect(result).toEqual({ success: true, protocolo: fakeProtocolo });
    expect(mockHttpClient.post).toHaveBeenCalled();
    expect(mockRedisClient.setEx).toHaveBeenCalled();
    expect(mockReprocessadoRepository.create).toHaveBeenCalled();
  });

  it('should create a reprocessed record and update webhook on HTTP client failure', async () => {
    const payload = { product: 'pagamento', id: ['789'], kind: 'webhook', type: 'cancelado' };
    const fakeRegistro = { id: '789', status: 'CANCELLED', tentativas: 1 };
    
    mockRedisClient.get.mockResolvedValue(null);
    mockWebhookRepository.findByIds.mockResolvedValue([fakeRegistro]);
    mockHttpClient.post.mockRejectedValue(new Error('Network Error'));

    await expect(reenviarWebhookUseCase.execute(payload)).rejects.toMatchObject({
      message: 'Não foi possível gerar a notificação. Tente novamente mais tarde.',
      status: 400,
    });

    expect(mockReprocessadoRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        protocolo: expect.stringContaining('error:'),
    }));
    expect(mockWebhookRepository.update).toHaveBeenCalledWith(fakeRegistro.id, {
      tentativas: 2,
    });
  });
});