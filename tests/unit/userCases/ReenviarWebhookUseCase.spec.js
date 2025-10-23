import { describe, it, expect, beforeEach, jest } from "@jest/globals";

import ReenviarWebhookUseCase from "@/application/useCases/ReenviarWebhookUseCase";

describe("ReenviarWebhookUseCase", () => {
  let reenviarWebhookUseCase;
  let mockWebhookRepository;
  let mockReprocessadoRepository;
  let mockHttpClient;

  beforeEach(() => {
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

    mockRedisClient = {
      get: jest.fn(),
      set: jest.fn(),
    };

    reenviarWebhookUseCase = new ReenviarWebhookUseCase({
      webhookRepository: mockWebhookRepository,
      webhookReprocessadoRepository: mockReprocessadoRepository,
      httpClient: mockHttpClient,
    });
  });
      reenviarWebhookUseCase = new ReenviarWebhookUseCase({
        webhookRepository: mockWebhookRepository,
        webhookReprocessadoRepository: mockReprocessadoRepository,
        httpClient: mockHttpClient,
        redisClient: mockRedisClient,
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

  it("should re-send the webhook successfully on a 2xx response", async () => {
    const fakeWebhook = {
      id: 1,
      url: "http://example.com/hook",
      payload: { data: "test" },
      tentativas: 0,
    };
    mockWebhookRepository.findById.mockResolvedValue(fakeWebhook);
    mockHttpClient.post.mockResolvedValue({ status: 200, data: "OK" });
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
    const protocoloMock = 'protocolo-123';
    mockHttpClient.post.mockResolvedValue({ data: { protocolo: protocoloMock } });

    const payload = {
      product: 'boleto',
      id: ['1'],
      kind: 'webhook',
      type: 'disponivel'
    };

    const result = await reenviarWebhookUseCase.execute({ id: 2 });

    expect(result.success).toBe(false);
    expect(result.status).toBe(500);
    expect(mockReprocessadoRepository.create).toHaveBeenCalled();
    expect(result).toEqual({ success: true, protocolo: protocoloMock });
    // Usando o método set (ou setEx) que for mais apropriado para o seu cliente
    expect(mockRedisClient.set).toHaveBeenCalled();
    expect(mockReprocessadoRepository.create).toHaveBeenCalledWith(expect.objectContaining({
      protocolo: protocoloMock,
      cedente_id: 123, // Verificar se o cedente_id está sendo passado
    }));
  });

  it("should save to reprocessado on a network error", async () => {
    const fakeWebhook = {
      id: 3,
      url: "http://bad-url.com",
      payload: { data: "network-error" },
      tentativas: 1,
    };
    const networkError = new Error("Network timeout");

    mockWebhookRepository.findById.mockResolvedValue(fakeWebhook);
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

    const result = await reenviarWebhookUseCase.execute({ id: 3 });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Network timeout");
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
        protocolo: `error:${networkError.message}`,
        data: payload,
        kind: 'webhook',
        type: 'disponivel',
        servico_id: JSON.stringify(payload.id),
        protocolo: expect.stringContaining('error:'),
        cedente_id: 123, // Verificar se o cedente_id está sendo passado
      })
    );
    expect(mockWebhookRepository.update).toHaveBeenCalledWith(fakeWebhook.id, {
      tentativas: 2,

    expect(mockWebhookRepository.update).toHaveBeenCalledWith('3', {
      tentativas: 2
    });
  });
});
