import { jest, describe, test, expect, beforeEach } from '@jest/globals'; // <-- CORREÇÃO 1
import ReenviarWebhookUseCase from '../../../src/application/useCases/ReenviarWebhookUseCase.js';
import UnprocessableEntityException from '../../../src/domain/exceptions/UnprocessableEntityException.js';

// --- Mocks (Simulações) ---
const mockWebhookRepository = {
  findByIdsAndCedente: jest.fn(),
  update: jest.fn(),
};
const mockReprocessadoRepository = {
  create: jest.fn(),
};
const mockHttpClient = {
  post: jest.fn(),
};
const mockRedisClient = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
};
const mockCedente = {
  id: 1,
  cnpj: '22222222000222',
};

// Reseta os mocks antes de cada teste
beforeEach(() => {
  mockWebhookRepository.findByIdsAndCedente.mockReset();
  mockWebhookRepository.update.mockReset();
  mockReprocessadoRepository.create.mockReset();
  mockHttpClient.post.mockReset();
  mockRedisClient.get.mockReset();
  mockRedisClient.set.mockReset();
  mockRedisClient.del.mockReset();
});
// --- Fim dos Mocks ---

describe('ReenviarWebhookUseCase', () => {
  // Instancia o UseCase com os mocks
  const useCase = new ReenviarWebhookUseCase({
    webhookRepository: mockWebhookRepository,
    webhookReprocessadoRepository: mockReprocessadoRepository,
    httpClient: mockHttpClient,
    redisClient: mockRedisClient,
  });

  test('should throw an error if input is not provided', async () => {
    // CORREÇÃO 2: Passa 'undefined'
    await expect(useCase.execute(undefined)).rejects.toThrow(
      "Cannot destructure property 'product'",
    );
  });

  test('should throw 422 error if webhooks are not found (Regra 3.1.O)', async () => {
    const input = {
      product: 'boleto',
      id: ['id-que-nao-existe'],
      kind: 'webhook',
      type: 'pago',
      cedente: mockCedente, // <--- CORREÇÃO 3: 'cedente' está DENTRO do 'input'
    };

    mockRedisClient.get.mockResolvedValue(null);
    mockWebhookRepository.findByIdsAndCedente.mockResolvedValue([]);

    await expect(useCase.execute(input)).rejects.toThrow(
      UnprocessableEntityException,
    );
  });

  test('should throw 422 error if status does not match (Regra 3.1.O)', async () => {
    const input = {
      product: 'boleto',
      id: ['boleto-123'],
      kind: 'webhook',
      type: 'pago', // Espera "LIQUIDADO"
      cedente: mockCedente, // <--- CORREÇÃO 3
    };
    const mockWebhook = {
      id: 'boleto-123',
      payload: { status: 'REGISTRADO' }, // Status real é "REGISTRADO"
      url: 'http://test.com',
    };

    mockRedisClient.get.mockResolvedValue(null);
    mockWebhookRepository.findByIdsAndCedente.mockResolvedValue([mockWebhook]);

    await expect(useCase.execute(input)).rejects.toThrow(
      UnprocessableEntityException,
    );
  });

  test('should re-send the webhook successfully on 200 (Regra 3.1.R)', async () => {
    const input = {
      product: 'boleto',
      id: ['boleto-123'],
      kind: 'webhook',
      type: 'pago', // Espera "LIQUIDADO"
      cedente: mockCedente, // <--- CORREÇÃO 3
    };
    const mockWebhook = {
      id: 'boleto-123',
      payload: { status: 'LIQUIDADO' }, // Status real bate!
      url: 'http://test.com',
    };

    mockRedisClient.get.mockResolvedValue(null);
    mockWebhookRepository.findByIdsAndCedente.mockResolvedValue([mockWebhook]);
    mockHttpClient.post.mockResolvedValue({ status: 200 });

    const result = await useCase.execute(input); // <--- CORREÇÃO 3

    expect(result.protocolo).toBeDefined();
    expect(mockReprocessadoRepository.create).toHaveBeenCalled();
  });

  test('should throw 429 if request is duplicated (Regra 3.1.N)', async () => {
    const input = {
      product: 'boleto',
      id: ['boleto-123'],
      kind: 'webhook',
      type: 'pago',
      cedente: mockCedente, // <--- CORREÇÃO 3
    };

    mockRedisClient.get.mockResolvedValue('processing');

    await expect(useCase.execute(input)).rejects.toThrow( // <--- CORREÇÃO 3
      'Requisição duplicada',
    );
  });

  test('should throw 400 if all re-sends fail (Regra 3.1.P)', async () => {
    const input = {
      product: 'boleto',
      id: ['boleto-123'],
      kind: 'webhook',
      type: 'pago',
      cedente: mockCedente, // <--- CORREÇÃO 3
    };
    const mockWebhook = {
      id: 'boleto-123',
      payload: { status: 'LIQUIDADO' },
      url: 'http://test.com',
    };

    mockRedisClient.get.mockResolvedValue(null);
    mockWebhookRepository.findByIdsAndCedente.mockResolvedValue([mockWebhook]);
    mockHttpClient.post.mockRejectedValue(new Error('HTTP Status 500'));

    await expect(useCase.execute(input)).rejects.toThrow( // <--- CORREÇÃO 3
      'Não foi possível gerar a notificação',
    );
    expect(mockReprocessadoRepository.create).not.toHaveBeenCalled();
    expect(mockRedisClient.del).toHaveBeenCalled();
  });
});