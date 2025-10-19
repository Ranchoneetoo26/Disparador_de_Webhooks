import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import createAuthMiddleware from '@/infrastructure/http/express/middlewares/AuthMiddleware';

describe('AuthMiddleware', () => {
    let mockCedenteRepo;
    let req;
    let res;
    let next;

    beforeEach(() => {
        mockCedenteRepo = { findByCnpjAndToken: jest.fn() };
        req = { headers: {} };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        next = jest.fn();
    });

    it('deve permitir a requisição com headers válidos e cedente encontrado', async () => {
        const cedente = { id: 1, cnpj: '123' };
        mockCedenteRepo.findByCnpjAndToken.mockResolvedValue(cedente);

        req.headers['x-cnpj'] = '123';
        req.headers['x-token'] = 'tok';

        const middleware = createAuthMiddleware({ cedenteRepository: mockCedenteRepo });

        await middleware(req, res, next);

        expect(mockCedenteRepo.findByCnpjAndToken).toHaveBeenCalledWith('123', 'tok');
        expect(req.cedente).toBe(cedente);
        expect(next).toHaveBeenCalled();
    });

    it('deve retornar 401 quando os headers estiverem faltando', async () => {
        const middleware = createAuthMiddleware({ cedenteRepository: mockCedenteRepo });

        await middleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Missing auth headers' });
        expect(next).not.toHaveBeenCalled();
    });

    it('deve retornar 401 quando o cedente não for encontrado', async () => {
        mockCedenteRepo.findByCnpjAndToken.mockResolvedValue(null);
        req.headers['x-cnpj'] = '999';
        req.headers['x-token'] = 'bad';

        const middleware = createAuthMiddleware({ cedenteRepository: mockCedenteRepo });

        await middleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
        expect(next).not.toHaveBeenCalled();
    });

    it('deve retornar 500 se o repositório lançar um erro', async () => {
        const repoError = new Error('Database error');
        mockCedenteRepo.findByCnpjAndToken.mockRejectedValue(repoError);

        req.headers['x-cnpj'] = '123';
        req.headers['x-token'] = 'tok';

        const middleware = createAuthMiddleware({ cedenteRepository: mockCedenteRepo });

        await middleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Internal auth error' });
        expect(next).not.toHaveBeenCalled();
    });
});