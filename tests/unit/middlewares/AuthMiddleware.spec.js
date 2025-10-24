import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import createAuthMiddleware from "../../../src/infrastructure/http/express/middlewares/AuthMiddleware.js";

describe("AuthMiddleware", () => {
  let mockCedenteRepository;
  let mockSoftwareHouseRepository;
  let mockReq;
  let mockRes;
  let mockNext;

  // --- Dados de Mock ---
  const validCnpjSh = "11111111000111";
  const validTokenSh = "token-sh-valido";
  const validCnpjCedente = "22222222000222";
  const validTokenCedente = "token-cedente-valido";
  const mockSoftwareHouse = { id: 1, cnpj: validCnpjSh, token: validTokenSh, status: 'ativo' };
  const mockCedente = { id: 5, cnpj: validCnpjCedente, token: validTokenCedente, softwarehouse_id: 1, status: 'ativo' };

  beforeEach(() => {
    // CORRIGIDO: Você estava definindo mockSoftwareHouseRepository duas vezes
    // e esquecendo de definir mockCedenteRepository.
    mockCedenteRepository = {
      findByCnpjTokenAndSoftwareHouseId: jest.fn(), // Usei o nome da função do seu teste (linha 57)
    };
    mockSoftwareHouseRepository = {
      findByCnpjAndToken: jest.fn(),
    };
    mockReq = {
      headers: {},
      auth: undefined,
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  it("should return 401 when headers are missing", async () => {
    const middleware = createAuthMiddleware({
      cedenteRepository: mockCedenteRepository,
      softwareHouseRepository: mockSoftwareHouseRepository,
    });

    await middleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Missing auth headers",
    });
  });

  // --- Teste de Criação do Middleware ---
  it("deve lançar erro se cedenteRepository não for fornecido", () => {
    // CORREÇÃO: Garante que o outro repositório está presente para isolar a falha
    const validSHRepo = { findByCnpjAndToken: jest.fn() };
    // CORRIGIDO: Atualizada a mensagem de erro para bater com o novo código
    expect(() => createAuthMiddleware({ softwareHouseRepository: validSHRepo })).toThrow("cedenteRepository and softwareHouseRepository are required to create auth middleware");
  });

  it("deve lançar erro se softwareHouseRepository não for fornecido", () => {
    // CORREÇÃO: Garante que o outro repositório está presente para isolar a falha
    const validCedenteRepo = { findByCnpjTokenAndSoftwareHouseId: jest.fn() };
    // CORRIGIDO: Atualizada a mensagem de erro para bater com o novo código
    expect(() => createAuthMiddleware({ cedenteRepository: validCedenteRepo })).toThrow("cedenteRepository and softwareHouseRepository are required to create auth middleware");
  });
});