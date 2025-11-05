// tests/unit/controllers/ProtocoloController.spec.js

const {
  describe,
  expect,
  it,
} = require("@jest/globals"); // 'jest' removido daqui

const ProtocoloController = require("../../../src/infrastructure/http/express/controllers/ProtocoloController");

const {
  ProtocoloNaoEncontradoException,
} = require("../../../src/domain/exceptions/ProtocoloNaoEncontradoException.js");


describe("ProtocoloController (unit)", () => {
  it("listarProtocolos chama useCase e retorna JSON", async () => {
    const fakeUseCase = {
      execute: jest.fn().mockResolvedValue([{ protocolo: "p1" }]),
    };
    const controller = new ProtocoloController({
      listarProtocolosUseCase: fakeUseCase,
      consultarProtocoloUseCase: fakeUseCase,
    });

    const req = {
      query: { startDate: "2023-01-01", endDate: "2023-12-31" },
      headers: {},
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await controller.listarProtocolos(req, res);

    expect(fakeUseCase.execute).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([{ protocolo: "p1" }]);
  });

  it("consultarProtocolo retorna 404 se não encontrado", async () => {
    // CORREÇÃO: O mock agora REJEITA a promessa com a exceção esperada para forçar o 404 no controller
    const fakeUseCase = {
      execute: jest.fn().mockRejectedValue(new ProtocoloNaoEncontradoException("Protocolo não encontrado"))
    };

    const controller = new ProtocoloController({
      listarProtocolosUseCase: fakeUseCase,
      consultarProtocoloUseCase: fakeUseCase,
    });

    const req = { params: { uuid: "x" }, headers: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await controller.consultarProtocolo(req, res);

    // O controller vai capturar a exceção e retornar 404
    expect(res.status).toHaveBeenCalledWith(404);
  });
});