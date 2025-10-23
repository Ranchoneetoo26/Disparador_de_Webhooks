import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import ReenviarWebhookUseCase from "@/application/useCases/ReenviarWebhookUseCase";
// Não precisamos mais mockar o DTO, vamos passar dados válidos

describe("ReenviarWebhookUseCase", () => {
  let reenviarWebhookUseCase;
  let mockWebhookRepository;
  let mockReprocessadoRepository;
  let mockHttpClient;
  let mockRedisClient;

  // --- DADOS FALSOS PARA OS TESTES ---
  // Payload que DEVE PASSAR na validação real do seu DTO
  // Inclui product, kind, type e id como array de string
  const fakePayload = {
    id: ["1"], // Array de string, como o erro do DTO pede
    product: "boleto",
    kind: "webhook",
    type: "disponivel"
  };

  // Webhook que será retornado pelo findById
  const fakeWebhook = {
    id: "1", // ID correspondente (como string, se for o caso)
    url: "http://example.com/hook",
    payload: { data: "test" },
    tentativas: 0,
    cedente_id: 123,
    kind: "test_kind",
    type: "test_type",
    servico_id: "s-123",
  };

  beforeEach(() => {
    // Mock para o repositório de Webhooks
    mockWebhookRepository = {
      // O código real usa findById (singular)
      findById: jest.fn(),
      update: jest.fn(),
    };

    // Mock para o repositório de Webhooks Reprocessados
    mockReprocessadoRepository = {
      create: jest.fn(),
    };

    // Mock para o cliente HTTP
    mockHttpClient = {
      post: jest.fn(),
    };

    // Mock para o cliente Redis
    mockRedisClient = {
      get: jest.fn(),
      set: jest.fn(),
    };

    // Instanciando o Use Case UMA VEZ com todos os mocks
    reenviarWebhookUseCase = new ReenviarWebhookUseCase({
      webhookRepository: mockWebhookRepository,
      webhookReprocessadoRepository: mockReprocessadoRepository,
      httpClient: mockHttpClient,
      redisClient: mockRedisClient,
    });
  });

  // Teste 1: Falha por falta de payload
  it("should throw an error if payload is not provided", async () => {
    // Espera o erro da validação inicial adicionada no .js
    await expect(reenviarWebhookUseCase.execute()).rejects.toThrow(
      'Payload é obrigatório'
    );
  });

  // Teste 2: Webhook não encontrado
  it("should return success false if webhook is not found", async () => {
    mockRedisClient.get.mockResolvedValue(null); // Cache miss
    // O mock de findById deve retornar null para simular "não encontrado"
    // Passamos o ID correto esperado pelo código (primeiro elemento do array)
    mockWebhookRepository.findById.mockResolvedValue(null);

    // O código NÃO REJEITA, ele RETORNA um objeto de erro
    const result = await reenviarWebhookUseCase.execute(fakePayload);

    // Verifica se findById foi chamado com o ID correto (assumindo id[0])
    expect(mockWebhookRepository.findById).toHaveBeenCalledWith(fakePayload.id);
    expect(result).toEqual({ success: false, error: "Webhook not found" });
    expect(mockHttpClient.post).not.toHaveBeenCalled();
  });

  // Teste 3: Sucesso no reenvio (HTTP 2xx)
  it("should re-send the webhook successfully on a 2xx response", async () => {
    mockRedisClient.get.mockResolvedValue(null); // Cache miss
    // Mock para encontrar o webhook
    mockWebhookRepository.findById.mockResolvedValue(fakeWebhook);
    // Mock de sucesso do HTTP
    mockHttpClient.post.mockResolvedValue({ status: 200, data: "OK" });

    const result = await reenviarWebhookUseCase.execute(fakePayload);

    // O código RETORNA um objeto de sucesso
    expect(result).toEqual({ success: true, status: 200, data: "OK" });

    // Verifica se chamou o findById corretamente
    expect(mockWebhookRepository.findById).toHaveBeenCalledWith(fakePayload.id);

    // Verifica se atualizou o webhook original
    expect(mockWebhookRepository.update).toHaveBeenCalledWith(fakeWebhook.id, {
      tentativas: 1, // tentativas (0) + 1
      last_status: 200,
    });
    // Não deve criar registro de reprocessamento em caso de sucesso
    expect(mockReprocessadoRepository.create).not.toHaveBeenCalled();
  });

  // Teste 4: Falha no reenvio (HTTP 500)
  it("should save to reprocessado on a non-2xx response", async () => {
    mockRedisClient.get.mockResolvedValue(null); // Cache miss
    mockWebhookRepository.findById.mockResolvedValue(fakeWebhook);
    // Mock de falha (HTTP 500) - Simula resposta, mas não 2xx
    mockHttpClient.post.mockResolvedValue({ status: 500 });

    const result = await reenviarWebhookUseCase.execute(fakePayload);

    // O código RETORNA um objeto de falha
    expect(result).toEqual({ success: false, status: 500 });
    // Verifica se chamou o findById corretamente
    expect(mockWebhookRepository.findById).toHaveBeenCalledWith(fakePayload.id);


    // Deve criar um registro de reprocessamento
    expect(mockReprocessadoRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        protocolo: "status:500",
        cedente_id: fakeWebhook.cedente_id,
        data: fakeWebhook.payload, // O código usa o payload original do webhook encontrado
        kind: fakeWebhook.kind, // Usa dados do webhook encontrado
        type: fakeWebhook.type,
      })
    );
  });

  // Teste 5: Falha de rede (HTTP Post rejeitado)
  it("should save to reprocessado on a network error", async () => {
    mockRedisClient.get.mockResolvedValue(null); // Cache miss
    mockWebhookRepository.findById.mockResolvedValue(fakeWebhook);

    // Mock de erro de rede
    const networkError = new Error("Network timeout");
    mockHttpClient.post.mockRejectedValue(networkError);

    const result = await reenviarWebhookUseCase.execute(fakePayload);

    // O código RETORNA um objeto de erro
    expect(result).toEqual({ success: false, error: "Network timeout" });
    // Verifica se chamou o findById corretamente
    expect(mockWebhookRepository.findById).toHaveBeenCalledWith(fakePayload.id);

    // Deve criar um registro de reprocessamento
    expect(mockReprocessadoRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        protocolo: expect.stringContaining("error:Network timeout"), // Pode truncar
        cedente_id: fakeWebhook.cedente_id,
        data: fakeWebhook.payload,
      })
    );

    // Deve atualizar as tentativas
    expect(mockWebhookRepository.update).toHaveBeenCalledWith(fakeWebhook.id, {
      tentativas: 1, // tentativas (0) + 1
    });
  });
});