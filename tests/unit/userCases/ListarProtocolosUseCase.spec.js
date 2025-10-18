// Placeholder para a importação do seu Use Case real
import { ListarProtocolosUseCase } from '@/application/useCases/ListarProtocolosUseCase'; // <-- Use chaves {}

class InvalidRequestException extends Error {
    constructor(message) {
        super(message);
        this.name = 'InvalidRequestException';
    }
}

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// --- Mocks ---
let mockWebhookReprocessadoRepository;
let mockCacheRepository;
let listarProtocolosUseCase;

// --- Suíte de Testes ---
describe('ListarProtocolosUseCase', () => {

    beforeEach(() => {
        // Reseta os mocks antes de cada teste
        mockWebhookReprocessadoRepository = {
            // Assumindo um método para listar protocolos baseado em datas e filtros opcionais
            listByDateRangeAndFilters: jest.fn(),
        };

        mockCacheRepository = {
            get: jest.fn(),
            set: jest.fn(),
        };

        // Instancia o Use Case com os mocks - Ajuste o caminho se necessário
        listarProtocolosUseCase = new ListarProtocolosUseCase({ // <-- DESCOMENTADO (usando a classe real)
            webhookReprocessadoRepository: mockWebhookReprocessadoRepository,
            cacheRepository: mockCacheRepository,
        });

        // *** A classe PlaceholderListarProtocolosUseCase foi REMOVIDA daqui ***

    });

    // --- Testes de Validação de Data ---

    it('deve lançar InvalidRequestException se start_date estiver faltando', async () => {
        const input = { end_date: '2025-10-18' };
        await expect(listarProtocolosUseCase.execute(input))
            .rejects.toThrow('start_date e end_date são obrigatórios.');
    });

    it('deve lançar InvalidRequestException se end_date estiver faltando', async () => {
        const input = { start_date: '2025-10-01' };
        await expect(listarProtocolosUseCase.execute(input))
            .rejects.toThrow('start_date e end_date são obrigatórios.');
    });

    it('deve lançar InvalidRequestException se as datas tiverem formato inválido', async () => {
        const input = { start_date: 'data-invalida', end_date: '2025-10-18' };
        // Assumindo que sua classe real também lança 'Datas inválidas' ou similar
        await expect(listarProtocolosUseCase.execute(input))
            .rejects.toThrow(/Datas inválidas|Invalid date/); // Tornando a mensagem de erro mais flexível
    });

    it('deve lançar InvalidRequestException se start_date for posterior a end_date', async () => {
        const input = { start_date: '2025-10-18', end_date: '2025-10-17' };
        await expect(listarProtocolosUseCase.execute(input))
            .rejects.toThrow('start_date não pode ser maior que end_date.');
    });

    it('deve lançar InvalidRequestException se o intervalo de datas for maior que 31 dias', async () => {
        const input = { start_date: '2025-09-01', end_date: '2025-10-02' }; // 32 dias
        await expect(listarProtocolosUseCase.execute(input))
            .rejects.toThrow('O intervalo entre as datas não pode ser maior que 31 dias.');
    });

    it('NÃO deve lançar erro para um intervalo de datas válido (exatamente 31 dias)', async () => {
        const input = { start_date: '2025-09-01', end_date: '2025-10-01' }; // 31 dias
        const mockResult = [{ id: 'proto1' }];
        mockWebhookReprocessadoRepository.listByDateRangeAndFilters.mockResolvedValue(mockResult);
        mockCacheRepository.get.mockResolvedValue(null);

        await expect(listarProtocolosUseCase.execute(input)).resolves.toEqual(mockResult);
    });

    it('NÃO deve lançar erro para um intervalo de datas válido (menos de 31 dias)', async () => {
        const input = { start_date: '2025-10-01', end_date: '2025-10-15' }; // 15 dias
        const mockResult = [{ id: 'proto2' }];
        mockWebhookReprocessadoRepository.listByDateRangeAndFilters.mockResolvedValue(mockResult);
        mockCacheRepository.get.mockResolvedValue(null);

        await expect(listarProtocolosUseCase.execute(input)).resolves.toEqual(mockResult);
    });


    // --- Testes de Interação com Repositório e Cache ---

    it('deve chamar o repositório com as datas corretas e sem filtros quando apenas datas são fornecidas', async () => {
        const input = { start_date: '2025-10-01', end_date: '2025-10-15' };
        const mockResult = [{ id: 'proto3' }];
        mockWebhookReprocessadoRepository.listByDateRangeAndFilters.mockResolvedValue(mockResult);
        mockCacheRepository.get.mockResolvedValue(null);

        await listarProtocolosUseCase.execute(input);

        // Verifica se o repositório foi chamado com objetos Date e filtros vazios
        expect(mockWebhookReprocessadoRepository.listByDateRangeAndFilters).toHaveBeenCalledWith(expect.objectContaining({
            startDate: expect.any(Date), // new Date('2025-10-01'),
            endDate: expect.any(Date), // new Date('2025-10-15'),
            filters: {}
        }));
        // Verifica se as datas específicas estão corretas (opcional, mas bom ter)
        expect(mockWebhookReprocessadoRepository.listByDateRangeAndFilters.mock.calls[0][0].startDate.toISOString().split('T')[0]).toBe('2025-10-01');
        expect(mockWebhookReprocessadoRepository.listByDateRangeAndFilters.mock.calls[0][0].endDate.toISOString().split('T')[0]).toBe('2025-10-15');

        expect(mockCacheRepository.set).toHaveBeenCalled();
    });

    it('deve chamar o repositório com as datas corretas e todos os filtros opcionais quando fornecidos', async () => {
        const input = {
            start_date: '2025-10-01',
            end_date: '2025-10-15',
            product: 'boleto',
            id: 'specific-id',
            kind: 'notification',
            type: 'payment',
        };
        const mockResult = [{ id: 'proto4' }];
        mockWebhookReprocessadoRepository.listByDateRangeAndFilters.mockResolvedValue(mockResult);
        mockCacheRepository.get.mockResolvedValue(null);

        await listarProtocolosUseCase.execute(input);

        expect(mockWebhookReprocessadoRepository.listByDateRangeAndFilters).toHaveBeenCalledWith(expect.objectContaining({
            startDate: expect.any(Date), // new Date('2025-10-01'),
            endDate: expect.any(Date), // new Date('2025-10-15'),
            filters: {
                product: 'boleto',
                id: 'specific-id',
                kind: 'notification',
                type: 'payment',
            }
        }));
        expect(mockCacheRepository.set).toHaveBeenCalled();
    });

    it('deve retornar dados do repositório em cache miss e armazená-los no cache', async () => {
        const input = { start_date: '2025-10-10', end_date: '2025-10-20' };
        const expectedResult = [{ id: 'abc', data: 'some data' }];
        const expectedCacheKey = `protocolos:${input.start_date}:${input.end_date}:${JSON.stringify({})}`;

        mockCacheRepository.get.mockResolvedValue(null);
        mockWebhookReprocessadoRepository.listByDateRangeAndFilters.mockResolvedValue(expectedResult);

        const result = await listarProtocolosUseCase.execute(input);

        expect(result).toEqual(expectedResult);
        expect(mockCacheRepository.get).toHaveBeenCalledWith(expectedCacheKey);
        expect(mockWebhookReprocessadoRepository.listByDateRangeAndFilters).toHaveBeenCalledTimes(1);
        expect(mockCacheRepository.set).toHaveBeenCalledWith(expectedCacheKey, expectedResult, { ttl: 86400 });
    });

    it('deve retornar dados do cache em cache hit e não chamar o repositório', async () => {
        const input = { start_date: '2025-10-10', end_date: '2025-10-20' };
        const cachedResult = [{ id: 'cached-abc', data: 'cached data' }];
        const expectedCacheKey = `protocolos:${input.start_date}:${input.end_date}:${JSON.stringify({})}`;

        mockCacheRepository.get.mockResolvedValue(cachedResult);

        const result = await listarProtocolosUseCase.execute(input);

        expect(result).toEqual(cachedResult);
        expect(mockCacheRepository.get).toHaveBeenCalledWith(expectedCacheKey);
        expect(mockWebhookReprocessadoRepository.listByDateRangeAndFilters).not.toHaveBeenCalled();
        expect(mockCacheRepository.set).not.toHaveBeenCalled();
    });

});