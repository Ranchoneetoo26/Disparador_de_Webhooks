import { describe, it, expect, jest } from "@jest/globals";
import createAuthMiddleware from "@/infrastructure/http/express/middlewares/AuthMiddleware";

describe("AuthMiddleware", () => {
  let mockCedenteRepository;
  let authMiddleware;
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockCedenteRepository = {
      findByCnpjAndToken: jest.fn(),
    };

    authMiddleware = createAuthMiddleware({
      cedenteRepository: mockCedenteRepository,
    });

    mockReq = {
      headers: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockNext = jest.fn();
  });

  it("deve retornar erro 401 quando não houver CNPJ no header", async () => {
    mockReq.headers["x-token"] = "token-valido";

    await authMiddleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Missing auth headers",
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("deve retornar erro 401 quando não houver token no header", async () => {
    mockReq.headers["x-cnpj"] = "12345678000190";

    await authMiddleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Missing auth headers",
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("deve aceitar headers com underscore no lugar de hífen", async () => {
    mockReq.headers["x_cnpj"] = "12345678000190";
    mockReq.headers["x_token"] = "token-valido";
    const mockCedente = { id: 1, cnpj: "12345678000190" };
    mockCedenteRepository.findByCnpjAndToken.mockResolvedValue(mockCedente);

    await authMiddleware(mockReq, mockRes, mockNext);

    expect(mockCedenteRepository.findByCnpjAndToken).toHaveBeenCalledWith(
      "12345678000190",
      "token-valido"
    );
    expect(mockNext).toHaveBeenCalled();
    expect(mockReq.cedente).toBe(mockCedente);
  });

  it("deve retornar erro 401 quando cedente não for encontrado", async () => {
    mockReq.headers["x-cnpj"] = "12345678000190";
    mockReq.headers["x-token"] = "token-invalido";
    mockCedenteRepository.findByCnpjAndToken.mockResolvedValue(null);

    await authMiddleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Unauthorized" });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("deve retornar erro 500 quando ocorrer erro no repositório", async () => {
    mockReq.headers["x-cnpj"] = "12345678000190";
    mockReq.headers["x-token"] = "token-valido";
    mockCedenteRepository.findByCnpjAndToken.mockRejectedValue(
      new Error("DB Error")
    );

    await authMiddleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Internal auth error" });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("deve chamar next() e adicionar cedente ao req quando autenticação for bem sucedida", async () => {
    mockReq.headers["x-cnpj"] = "12345678000190";
    mockReq.headers["x-token"] = "token-valido";
    const mockCedente = { id: 1, cnpj: "12345678000190" };
    mockCedenteRepository.findByCnpjAndToken.mockResolvedValue(mockCedente);

    await authMiddleware(mockReq, mockRes, mockNext);

    expect(mockCedenteRepository.findByCnpjAndToken).toHaveBeenCalledWith(
      "12345678000190",
      "token-valido"
    );
    expect(mockNext).toHaveBeenCalled();
    expect(mockReq.cedente).toBe(mockCedente);
  });

  it("deve lançar erro quando cedenteRepository não for fornecido", () => {
    expect(() => createAuthMiddleware()).toThrow("cedenteRepository missing");
  });
});
