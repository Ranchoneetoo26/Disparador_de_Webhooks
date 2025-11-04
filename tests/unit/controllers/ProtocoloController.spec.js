import ProtocoloController from '@/infrastructure/http/express/controllers/ProtocoloController';

describe('ProtocoloController (unit)', () => {
  it('listarProtocolos chama useCase e retorna JSON', async () => {
    const fakeUseCase = {
      execute: jest.fn().mockResolvedValue([{ protocolo: 'p1' }])
    };
    const controller = new ProtocoloController({ listarProtocolosUseCase: fakeUseCase, consultarProtocoloUseCase: fakeUseCase });

    const req = { query: { startDate: '2023-01-01', endDate: '2023-12-31' }, headers: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await controller.listarProtocolos(req, res);

    expect(fakeUseCase.execute).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([{ protocolo: 'p1' }]);
  });

  it('consultarProtocolo retorna 404 se não encontrado', async () => {
    const fakeUseCase = { execute: jest.fn().mockResolvedValue(null) };
    const controller = new ProtocoloController({ listarProtocolosUseCase: fakeUseCase, consultarProtocoloUseCase: fakeUseCase });

    const req = { params: { uuid: 'x' }, headers: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await controller.consultarProtocolo(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});
