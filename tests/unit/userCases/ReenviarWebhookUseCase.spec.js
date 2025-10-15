import { describe, it, expect, beforeEach, jest } from '@jest/globals';

import ReenviarWebhookUseCase from '@/application/useCases/ReenviarWebhookUseCase';

describe('ReenviarWebhookUseCase', () => {

  let reenviarWebhookUseCase;
  let mockWebhookRepository;
  let mockReprocessadoRepository;
  let mockHttpClient;

  beforeEach(() => {
    // Criamos os mocks para cada dependência
    mockWebhookRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    };

    mockReprocessadoRepository = {
      create: jest.fn(),
    };

    mockHttpClient = {
      post: jest.fn(),
    };

    // Instanciamos a classe que vamos testar, injetando os mocks
    reenviarWebhookUseCase = new ReenviarWebhookUseCase({
      webhookRepository: mockWebhookRepository,
      webhookReprocessadoRepository: mockReprocessadoRepository,
      httpClient: mockHttpClient,
    });
  });

  it('should throw an error if id is not provided', async () => {
    await expect(reenviarWebhookUseCase.execute()).rejects.toThrow('id is required');
  });

  it('should return success false if webhook is not found', async () => {
    mockWebhookRepository.findById.mockResolvedValue(null);

    const result = await reenviarWebhookUseCase.execute({ id: 999 });

    expect(result).toEqual({ success: false, error: 'Webhook not found' });
    expect(mockWebhookRepository.findById).toHaveBeenCalledWith(999);
    expect(mockHttpClient.post).not.toHaveBeenCalled();
  });

  it('should re-send the webhook successfully on a 2xx response', async () => {
    const fakeWebhook = { id: 1, url: 'http://example.com/hook', payload: { data: 'test' }, tentativas: 0 };
    mockWebhookRepository.findById.mockResolvedValue(fakeWebhook);
    mockHttpClient.post.mockResolvedValue({ status: 200, data: 'OK' });

    const result = await reenviarWebhookUseCase.execute({ id: 1 });

    expect(result.success).toBe(true);
    expect(result.status).toBe(200);
    expect(mockHttpClient.post).toHaveBeenCalledWith(fakeWebhook.url, fakeWebhook.payload, { timeout: 5000 });
    expect(mockWebhookRepository.update).toHaveBeenCalledWith(fakeWebhook.id, { tentativas: 1, last_status: 200 });
    expect(mockReprocessadoRepository.create).not.toHaveBeenCalled();
  });

  it('should save to reprocessado on a non-2xx response', async () => {
    const fakeWebhook = { id: 2, url: 'http://example.com/hook', payload: { data: 'failed' } };
    mockWebhookRepository.findById.mockResolvedValue(fakeWebhook);
    mockHttpClient.post.mockResolvedValue({ status: 500 });

    const result = await reenviarWebhookUseCase.execute({ id: 2 });

    expect(result.success).toBe(false);
    expect(result.status).toBe(500);
    expect(mockReprocessadoRepository.create).toHaveBeenCalled();
  });

  it('should save to reprocessado on a network error', async () => {
    const fakeWebhook = { id: 3, url: 'http://bad-url.com', payload: { data: 'network-error' }, tentativas: 1 };
    const networkError = new Error('Network timeout');

    mockWebhookRepository.findById.mockResolvedValue(fakeWebhook);
    mockHttpClient.post.mockRejectedValue(networkError);

    const result = await reenviarWebhookUseCase.execute({ id: 3 });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Network timeout');
    expect(mockReprocessadoRepository.create).toHaveBeenCalledWith(expect.objectContaining({
      protocolo: `error:${networkError.message}`
    }));
    expect(mockWebhookRepository.update).toHaveBeenCalledWith(fakeWebhook.id, { tentativas: 2 });
  });
});