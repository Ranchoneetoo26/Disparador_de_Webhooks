<<<<<<< HEAD
// tests/unit/userCases/ReenviarWebhookUseCase.spec.js

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import ReenviarWebhookUseCase from '@/application/useCases/ReenviarWebhookUseCase';

describe('ReenviarWebhookUseCase', () => {
=======
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

import ReenviarWebhookUseCase from "../../../src/application/useCases/ReenviarWebhookUseCase.js";
import RedisCacheRepository from "../../../src/infrastructure/cache/redis/RedisCacheRepository.js";

describe("ReenviarWebhookUseCase", () => {
>>>>>>> e8eb97ff05622b90f384c5fbc829e82218ca52c7
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
<<<<<<< HEAD
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
=======
      redisClient: RedisCacheRepository,
    });
  });

  it("should throw an error if id is not provided", async () => {
    await expect(reenviarWebhookUseCase.execute()).rejects.toThrow(
      "id is required"
    );
  });

  it("should return success false if webhook is not found", async () => {
    mockWebhookRepository.findById.mockResolvedValue(null);

    const result = await reenviarWebhookUseCase.execute({ id: 999 });

    expect(result).toEqual({ success: false, error: "Webhook not found" });
    expect(mockWebhookRepository.findById).toHaveBeenCalledWith(999);
    expect(mockHttpClient.post).not.toHaveBeenCalled();
  });

  it("should re-send the webhook successfully on a 2xx response", async () => {
    const fakeWebhook = {
      id: 1,
      url: "http://example.com/hook",
      payload: { data: "test" },
      tentativas: 0,
    };
    mockWebhookRepository.findById.mockResolvedValue(fakeWebhook);
    mockHttpClient.post.mockResolvedValue({ status: 200, data: "OK" });

    const result = await reenviarWebhookUseCase.execute({ id: 1 });

    expect(result.success).toBe(true);
    expect(result.status).toBe(200);
    expect(mockHttpClient.post).toHaveBeenCalledWith(
      fakeWebhook.url,
      fakeWebhook.payload,
      { timeout: 5000 }
    );
    expect(mockWebhookRepository.update).toHaveBeenCalledWith(fakeWebhook.id, {
      tentativas: 1,
      last_status: 200,
    });
    expect(mockReprocessadoRepository.create).not.toHaveBeenCalled();
  });

  it("should save to reprocessado on a non-2xx response", async () => {
    const fakeWebhook = {
      id: 2,
      url: "http://example.com/hook",
      payload: { data: "failed" },
    };
    mockWebhookRepository.findById.mockResolvedValue(fakeWebhook);
    mockHttpClient.post.mockResolvedValue({ status: 500 });
>>>>>>> e8eb97ff05622b90f384c5fbc829e82218ca52c7

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

<<<<<<< HEAD
  it('should create a reprocessed record and update webhook on HTTP client failure', async () => {
    const payload = { product: 'pagamento', id: ['789'], kind: 'webhook', type: 'cancelado' };
    const fakeRegistro = { id: '789', status: 'CANCELLED', tentativas: 1 };
    
    mockRedisClient.get.mockResolvedValue(null);
    mockWebhookRepository.findByIds.mockResolvedValue([fakeRegistro]);
    mockHttpClient.post.mockRejectedValue(new Error('Network Error'));
=======
  it("should save to reprocessado on a network error", async () => {
    const fakeWebhook = {
      id: 3,
      url: "http://bad-url.com",
      payload: { data: "network-error" },
      tentativas: 1,
    };
    const networkError = new Error("Network timeout");
>>>>>>> e8eb97ff05622b90f384c5fbc829e82218ca52c7

    await expect(reenviarWebhookUseCase.execute(payload)).rejects.toMatchObject({
      message: 'Não foi possível gerar a notificação. Tente novamente mais tarde.',
      status: 400,
    });

<<<<<<< HEAD
    expect(mockReprocessadoRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        protocolo: expect.stringContaining('error:'),
    }));
    expect(mockWebhookRepository.update).toHaveBeenCalledWith(fakeRegistro.id, {
=======
    const result = await reenviarWebhookUseCase.execute({ id: 3 });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Network timeout");
    expect(mockReprocessadoRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        protocolo: `error:${networkError.message}`,
      })
    );
    expect(mockWebhookRepository.update).toHaveBeenCalledWith(fakeWebhook.id, {
>>>>>>> e8eb97ff05622b90f384c5fbc829e82218ca52c7
      tentativas: 2,
    });
  });
});
