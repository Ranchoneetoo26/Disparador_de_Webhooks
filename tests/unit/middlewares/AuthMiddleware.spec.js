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

  it('allows request with valid headers and cedente found', async () => {
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

  it('returns 401 when headers are missing', async () => {
    const middleware = createAuthMiddleware({ cedenteRepository: mockCedenteRepo });

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing auth headers' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when cedente not found', async () => {
    mockCedenteRepo.findByCnpjAndToken.mockResolvedValue(null);
    req.headers['x-cnpj'] = '999';
    req.headers['x-token'] = 'bad';

    const middleware = createAuthMiddleware({ cedenteRepository: mockCedenteRepo });

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    expect(next).not.toHaveBeenCalled();
  });
});
