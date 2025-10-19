import ListarProtocolosUseCase from '@/application/useCases/ListarProtocolosUseCase';

import InvalidRequestException from '@/domain/exceptions/InvalidRequestException';

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

let mockWebhookReprocessadoRepository;
let mockCacheRepository;
let listarProtocolosUseCase;

describe('ListarProtocolosUseCase', () => {

    beforeEach(() => {
        mockWebhookReprocessadoRepository = {
            findByFilters: jest.fn(),
        };
        mockCacheRepository = {
            get: jest.fn(),
            set: jest.fn(),
        };

        listarProtocolosUseCase = new ListarProtocolosUseCase({
            webhookReprocessadoRepository: mockWebhookReprocessadoRepository,
            cacheRepository: mockCacheRepository,
        });

        console.error = jest.fn();
    });

    it('deve lançar InvalidRequestException se start_date estiver faltando', async () => {
        const input = { end_date: '2025-10-18' };
        await expect(listarProtocolosUseCase.execute(input))
            .rejects.toThrow(InvalidRequestException);
        await expect(listarProtocolosUseCase.execute(input))
            .rejects.toThrow('Os filtros "start_date" e "end_date" são obrigatórios.');
    });

    it('deve lançar InvalidRequestException se end_date estiver faltando', async () => {
        const input = { start_date: '2025-10-01' };
        await expect(listarProtocolosUseCase.execute(input))
            .rejects.toThrow(InvalidRequestException);
        await expect(listarProtocolosUseCase.execute(input))
            .rejects.toThrow('Os filtros "start_date" e "end_date" são obrigatórios.');
    });

    it('deve lançar InvalidRequestException se as datas tiverem formato inválido', async () => {
        const input = { start_date: 'data-invalida', end_date: '2025-10-18' };
        await expect(listarProtocolosUseCase.execute(input))
            .rejects.toThrow(InvalidRequestException);
        await expect(listarProtocolosUseCase.execute(input))
            .rejects.toThrow('As datas fornecidas são inválidas.');
    });

    it('deve lançar InvalidRequestException se start_date for posterior a end_date', async () => {
        const input = { start_date: '2025-10-18', end_date: '2025-10-17' };
        await expect(listarProtocolosUseCase.execute(input))
            .rejects.toThrow(InvalidRequestException);
        await expect(listarProtocolosUseCase.execute(input))
            .rejects.toThrow('start_date não pode ser maior que end_date.');
    });

    it('deve lançar InvalidRequestException se o intervalo de datas for maior que 31 dias', async () => {
        const input = { start_date: '2025-09-01', end_date: '2025-10-02' };
        await expect(listarProtocolosUseCase.execute(input))
            .rejects.toThrow(InvalidRequestException);
        await expect(listarProtocolosUseCase.execute(input))
            .rejects.toThrow('O intervalo entre as datas não pode ser maior que 31 dias.');
    });


    it('NÃO deve lançar erro para um intervalo de datas válido (exatamente 31 dias)', async () => {
        const input = { start_date: '2025-09-01', end_date: '2025-10-01' };
        const mockDbResult = [{ id: 'proto1', data: {} }];
        mockCacheRepository.get.mockResolvedValue(null);
        mockWebhookReprocessadoRepository.findByFilters.mockResolvedValue(mockDbResult);

        await expect(listarProtocolosUseCase.execute(input)).resolves.toEqual({
            success: true,
            data: mockDbResult,
            source: 'database'
        });
        expect(mockWebhookReprocessadoRepository.findByFilters).toHaveBeenCalledTimes(1);
        expect(mockCacheRepository.set).toHaveBeenCalled();
    });

    it('NÃO deve lançar erro para um intervalo de datas válido (menos de 31 dias)', async () => {
        const input = { start_date: '2025-10-01', end_date: '2025-10-15' };
        const mockDbResult = [{ id: 'proto2', data: {} }];
        mockCacheRepository.get.mockResolvedValue(null);
        mockWebhookReprocessadoRepository.findByFilters.mockResolvedValue(mockDbResult);

        await expect(listarProtocolosUseCase.execute(input)).resolves.toEqual({
            success: true,
            data: mockDbResult,
            source: 'database'
        });
        expect(mockWebhookReprocessadoRepository.findByFilters).toHaveBeenCalledTimes(1);
        expect(mockCacheRepository.set).toHaveBeenCalled();
    });

    it('deve chamar o repositório com os filtros corretos quando apenas datas são fornecidas', async () => {
        const input = { start_date: '2025-10-01', end_date: '2025-10-15' };
        const mockDbResult = [{ id: 'proto3' }];
        mockCacheRepository.get.mockResolvedValue(null);
        mockWebhookReprocessadoRepository.findByFilters.mockResolvedValue(mockDbResult);

        await listarProtocolosUseCase.execute(input);

        expect(mockWebhookReprocessadoRepository.findByFilters).toHaveBeenCalledWith({
            start_date: '2025-10-01',
            end_date: '2025-10-15',
            startDate: expect.any(Date),
            endDate: expect.any(Date)
        });
        expect(mockCacheRepository.set).toHaveBeenCalled();
    });

    it('deve chamar o repositório com todos os filtros opcionais quando fornecidos', async () => {
        const input = {
            start_date: '2025-10-01',
            end_date: '2025-10-15',
            product: 'boleto',
            id: 'specific-id',
            kind: 'notification',
            type: 'payment',
        };
        const mockDbResult = [{ id: 'proto4' }];
        mockCacheRepository.get.mockResolvedValue(null);
        mockWebhookReprocessadoRepository.findByFilters.mockResolvedValue(mockDbResult);

        await listarProtocolosUseCase.execute(input);

        expect(mockWebhookReprocessadoRepository.findByFilters).toHaveBeenCalledWith({
            start_date: '2025-10-01',
            end_date: '2025-10-15',
            product: 'boleto',
            id: 'specific-id',
            kind: 'notification',
            type: 'payment',
            startDate: expect.any(Date),
            endDate: expect.any(Date)
        });
        expect(mockCacheRepository.set).toHaveBeenCalled();
    });

    it('deve retornar dados do repositório em cache miss e armazená-los no cache', async () => {
        const input = { start_date: '2025-10-10', end_date: '2025-10-20' };
        const dbData = [{ id: 'abc', data: 'some data' }];
        const expectedCacheKey = `protocolos:${JSON.stringify(input)}`;

        mockCacheRepository.get.mockResolvedValue(null);
        mockWebhookReprocessadoRepository.findByFilters.mockResolvedValue(dbData);

        const result = await listarProtocolosUseCase.execute(input);

        expect(result).toEqual({ success: true, data: dbData, source: 'database' });
        expect(mockCacheRepository.get).toHaveBeenCalledWith(expectedCacheKey);
        expect(mockWebhookReprocessadoRepository.findByFilters).toHaveBeenCalledTimes(1);
        expect(mockCacheRepository.set).toHaveBeenCalledWith(expectedCacheKey, JSON.stringify(dbData), { ttl: 86400 });
    });

    it('deve retornar dados do cache em cache hit e não chamar o repositório', async () => {
        const input = { start_date: '2025-10-10', end_date: '2025-10-20' };
        const cachedResultData = [{ id: 'cached-abc', data: 'cached data' }];
        const expectedCacheKey = `protocolos:${JSON.stringify(input)}`;

        mockCacheRepository.get.mockResolvedValue(JSON.stringify(cachedResultData));

        const result = await listarProtocolosUseCase.execute(input);

        expect(result).toEqual({ success: true, data: cachedResultData, source: 'cache' });
        expect(mockCacheRepository.get).toHaveBeenCalledWith(expectedCacheKey);
        expect(mockWebhookReprocessadoRepository.findByFilters).not.toHaveBeenCalled();
        expect(mockCacheRepository.set).not.toHaveBeenCalled();
    });

    it('deve buscar no banco se o parse do cache falhar', async () => {
        const input = { start_date: '2025-10-11', end_date: '2025-10-21' };
        const dbData = [{ id: 'def', data: 'db data' }];
        const expectedCacheKey = `protocolos:${JSON.stringify(input)}`;

        mockCacheRepository.get.mockResolvedValue("{ inválido json");
        mockWebhookReprocessadoRepository.findByFilters.mockResolvedValue(dbData);

        const result = await listarProtocolosUseCase.execute(input);

        expect(result).toEqual({ success: true, data: dbData, source: 'database' });
        expect(mockCacheRepository.get).toHaveBeenCalledWith(expectedCacheKey);
        expect(mockWebhookReprocessadoRepository.findByFilters).toHaveBeenCalledTimes(1);
        expect(mockCacheRepository.set).toHaveBeenCalledWith(expectedCacheKey, JSON.stringify(dbData), { ttl: 86400 });
        expect(console.error).toHaveBeenCalledWith('Erro ao fazer parse dos dados do cache:', expect.any(SyntaxError));
    });

    it('deve buscar no banco se houver erro ao ler o cache', async () => {
        const input = { start_date: '2025-10-12', end_date: '2025-10-22' };
        const dbData = [{ id: 'ghi', data: 'db data again' }];
        const expectedCacheKey = `protocolos:${JSON.stringify(input)}`;
        const cacheError = new Error('Erro de conexão com Redis');

        mockCacheRepository.get.mockRejectedValue(cacheError);
        mockWebhookReprocessadoRepository.findByFilters.mockResolvedValue(dbData);

        const result = await listarProtocolosUseCase.execute(input);

        expect(result).toEqual({ success: true, data: dbData, source: 'database' });
        expect(mockCacheRepository.get).toHaveBeenCalledWith(expectedCacheKey);
        expect(mockWebhookReprocessadoRepository.findByFilters).toHaveBeenCalledTimes(1);
        expect(mockCacheRepository.set).toHaveBeenCalledWith(expectedCacheKey, JSON.stringify(dbData), { ttl: 86400 });
        expect(console.error).toHaveBeenCalledWith('Erro ao acessar o cache:', cacheError);
    });

    it('deve retornar os dados do banco mesmo se falhar ao salvar no cache', async () => {
        const input = { start_date: '2025-10-13', end_date: '2025-10-23' };
        const dbData = [{ id: 'jkl', data: 'final db data' }];
        const expectedCacheKey = `protocolos:${JSON.stringify(input)}`;
        const cacheSetError = new Error('Erro ao salvar no Redis');

        mockCacheRepository.get.mockResolvedValue(null);
        mockWebhookReprocessadoRepository.findByFilters.mockResolvedValue(dbData);
        mockCacheRepository.set.mockRejectedValue(cacheSetError);

        const result = await listarProtocolosUseCase.execute(input);

        expect(result).toEqual({ success: true, data: dbData, source: 'database' });
        expect(mockCacheRepository.get).toHaveBeenCalledWith(expectedCacheKey);
        expect(mockWebhookReprocessadoRepository.findByFilters).toHaveBeenCalledTimes(1);
        expect(mockCacheRepository.set).toHaveBeenCalledWith(expectedCacheKey, JSON.stringify(dbData), { ttl: 86400 });
        expect(console.error).toHaveBeenCalledWith('Erro ao salvar dados no cache:', cacheSetError);
    });
});