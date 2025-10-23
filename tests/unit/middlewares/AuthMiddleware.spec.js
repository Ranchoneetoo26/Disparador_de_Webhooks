// tests/unit/middlewares/AuthMiddleware.spec.js
import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import createAuthMiddleware from "@/infrastructure/http/express/middlewares/AuthMiddleware.js";
describe("AuthMiddleware - Nova Lógica (4 Headers)", () => {
  let mockCedenteRepository;
  let mockSoftwareHouseRepository;
  let authMiddleware;
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
    mockSoftwareHouseRepository = {
      findByCnpjAndToken: jest.fn(),
    };
    mockCedenteRepository = {
      findByCnpjTokenAndSoftwareHouseId: jest.fn(),
    };
    authMiddleware = createAuthMiddleware({
      cedenteRepository: mockCedenteRepository,
      softwareHouseRepository: mockSoftwareHouseRepository,
    });
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

  // --- Testes de Falha (Headers Ausentes) ---
  // CORREÇÃO: Mensagem de erro esperada atualizada
  it("deve retornar erro 401 se o header 'cnpj-sh' estiver faltando", async () => {
    mockReq.headers = {
      'token-sh': validTokenSh,
      'cnpj-cedente': validCnpjCedente,
      'token-cedente': validTokenCedente,
    };
    await authMiddleware(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Headers de autenticação incompletos.' }); // <<< CORRIGIDO
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("deve retornar erro 401 se o header 'token-sh' estiver faltando", async () => {
    mockReq.headers = {
      'cnpj-sh': validCnpjSh,
      'cnpj-cedente': validCnpjCedente,
      'token-cedente': validTokenCedente,
    };
    await authMiddleware(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Headers de autenticação incompletos.' }); // <<< CORRIGIDO
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("deve retornar erro 401 se o header 'cnpj-cedente' estiver faltando", async () => {
    mockReq.headers = {
      'cnpj-sh': validCnpjSh,
      'token-sh': validTokenSh,
      'token-cedente': validTokenCedente,
    };
    await authMiddleware(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Headers de autenticação incompletos.' }); // <<< CORRIGIDO
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("deve retornar erro 401 se o header 'token-cedente' estiver faltando", async () => {
    mockReq.headers = {
      'cnpj-sh': validCnpjSh,
      'token-sh': validTokenSh,
      'cnpj-cedente': validCnpjCedente,
    };
    await authMiddleware(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Headers de autenticação incompletos.' }); // <<< CORRIGIDO
    expect(mockNext).not.toHaveBeenCalled();
  });

  // --- Testes de Falha (Credenciais Inválidas) ---
  it("deve retornar erro 401 se a SoftwareHouse não for encontrada", async () => {
    mockReq.headers = { // <<< Headers válidos, mas dados inválidos
      'cnpj-sh': 'invalido',
      'token-sh': validTokenSh,
      'cnpj-cedente': validCnpjCedente,
      'token-cedente': validTokenCedente,
    };
    mockSoftwareHouseRepository.findByCnpjAndToken.mockResolvedValue(null);

    await authMiddleware(mockReq, mockRes, mockNext);

    expect(mockSoftwareHouseRepository.findByCnpjAndToken).toHaveBeenCalledWith('invalido', validTokenSh);
    expect(mockCedenteRepository.findByCnpjTokenAndSoftwareHouseId).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Credenciais da Software House inválidas ou inativas.' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("deve retornar erro 401 se a SoftwareHouse estiver inativa (se middleware validar status)", async () => {
    mockReq.headers = { // <<< Headers válidos
      'cnpj-sh': validCnpjSh,
      'token-sh': validTokenSh,
      'cnpj-cedente': validCnpjCedente,
      'token-cedente': validTokenCedente,
    };
    const inactiveSoftwareHouse = { ...mockSoftwareHouse, status: 'inativo' };
    mockSoftwareHouseRepository.findByCnpjAndToken.mockResolvedValue(inactiveSoftwareHouse);

    await authMiddleware(mockReq, mockRes, mockNext);

    expect(mockSoftwareHouseRepository.findByCnpjAndToken).toHaveBeenCalledWith(validCnpjSh, validTokenSh);
    expect(mockCedenteRepository.findByCnpjTokenAndSoftwareHouseId).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Credenciais da Software House inválidas ou inativas.' });
    expect(mockNext).not.toHaveBeenCalled();
  });


  it("deve retornar erro 401 se o Cedente não for encontrado", async () => {
    mockReq.headers = { // <<< Headers válidos
      'cnpj-sh': validCnpjSh,
      'token-sh': validTokenSh,
      'cnpj-cedente': 'invalido',
      'token-cedente': validTokenCedente,
    };
    mockSoftwareHouseRepository.findByCnpjAndToken.mockResolvedValue(mockSoftwareHouse);
    mockCedenteRepository.findByCnpjTokenAndSoftwareHouseId.mockResolvedValue(null);

    await authMiddleware(mockReq, mockRes, mockNext);

    expect(mockSoftwareHouseRepository.findByCnpjAndToken).toHaveBeenCalledWith(validCnpjSh, validTokenSh);
    expect(mockCedenteRepository.findByCnpjTokenAndSoftwareHouseId).toHaveBeenCalledWith('invalido', validTokenCedente, mockSoftwareHouse.id);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Credenciais do Cedente inválidas, inativas ou não associadas à Software House.' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("deve retornar erro 401 se o Cedente estiver inativo (se middleware validar status)", async () => {
    mockReq.headers = { // <<< Headers válidos
      'cnpj-sh': validCnpjSh,
      'token-sh': validTokenSh,
      'cnpj-cedente': validCnpjCedente,
      'token-cedente': validTokenCedente,
    };
    const inactiveCedente = { ...mockCedente, status: 'inativo' };
    mockSoftwareHouseRepository.findByCnpjAndToken.mockResolvedValue(mockSoftwareHouse);
    mockCedenteRepository.findByCnpjTokenAndSoftwareHouseId.mockResolvedValue(inactiveCedente);

    await authMiddleware(mockReq, mockRes, mockNext);

    expect(mockSoftwareHouseRepository.findByCnpjAndToken).toHaveBeenCalledWith(validCnpjSh, validTokenSh); // <<< Verifica se SH foi chamada
    expect(mockCedenteRepository.findByCnpjTokenAndSoftwareHouseId).toHaveBeenCalledWith(validCnpjCedente, validTokenCedente, mockSoftwareHouse.id);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Credenciais do Cedente inválidas, inativas ou não associadas à Software House.' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("deve retornar erro 401 se o Cedente não pertencer à SoftwareHouse", async () => {
    const cedenteOutraSH = { id: 6, cnpj: validCnpjCedente, token: validTokenCedente, softwarehouse_id: 2, status: 'ativo' };

    mockReq.headers = { // <<< Headers válidos
      'cnpj-sh': validCnpjSh, // SH id 1
      'token-sh': validTokenSh,
      'cnpj-cedente': validCnpjCedente,
      'token-cedente': validTokenCedente,
    };
    mockSoftwareHouseRepository.findByCnpjAndToken.mockResolvedValue(mockSoftwareHouse); // Encontra SH id 1
    mockCedenteRepository.findByCnpjTokenAndSoftwareHouseId.mockResolvedValue(null); // Simula não encontrar o cedente COM AQUELE SH ID

    await authMiddleware(mockReq, mockRes, mockNext);

    expect(mockSoftwareHouseRepository.findByCnpjAndToken).toHaveBeenCalledWith(validCnpjSh, validTokenSh);
    expect(mockCedenteRepository.findByCnpjTokenAndSoftwareHouseId).toHaveBeenCalledWith(validCnpjCedente, validTokenCedente, mockSoftwareHouse.id);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Credenciais do Cedente inválidas, inativas ou não associadas à Software House.' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  // --- Teste de Erro Interno ---
  it("deve retornar erro 500 se ocorrer erro no repositório da SoftwareHouse", async () => {
    mockReq.headers = { // <<< CORREÇÃO: Adiciona headers válidos para este cenário
      'cnpj-sh': validCnpjSh,
      'token-sh': validTokenSh,
      'cnpj-cedente': validCnpjCedente,
      'token-cedente': validTokenCedente,
    };
    mockSoftwareHouseRepository.findByCnpjAndToken.mockRejectedValue(new Error("DB SH Error")); // Simula erro

    await authMiddleware(mockReq, mockRes, mockNext);

    expect(mockSoftwareHouseRepository.findByCnpjAndToken).toHaveBeenCalledWith(validCnpjSh, validTokenSh); // Verifica se foi chamado
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Erro interno no servidor durante a autenticação.' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("deve retornar erro 500 se ocorrer erro no repositório do Cedente", async () => {
    mockReq.headers = { // <<< CORREÇÃO: Adiciona headers válidos para este cenário
      'cnpj-sh': validCnpjSh,
      'token-sh': validTokenSh,
      'cnpj-cedente': validCnpjCedente,
      'token-cedente': validTokenCedente,
    };
    mockSoftwareHouseRepository.findByCnpjAndToken.mockResolvedValue(mockSoftwareHouse); // SH ok
    mockCedenteRepository.findByCnpjTokenAndSoftwareHouseId.mockRejectedValue(new Error("DB Cedente Error")); // Simula erro no Cedente

    await authMiddleware(mockReq, mockRes, mockNext);

    expect(mockSoftwareHouseRepository.findByCnpjAndToken).toHaveBeenCalledWith(validCnpjSh, validTokenSh); // Verifica se SH foi chamada
    expect(mockCedenteRepository.findByCnpjTokenAndSoftwareHouseId).toHaveBeenCalledWith(validCnpjCedente, validTokenCedente, mockSoftwareHouse.id); // Verifica se Cedente foi chamado
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Erro interno no servidor durante a autenticação.' });
    expect(mockNext).not.toHaveBeenCalled();
  });


  // --- Teste de Sucesso ---
  it("deve chamar next() e adicionar req.auth com os IDs corretos em caso de sucesso", async () => {
    mockReq.headers = {
      'cnpj-sh': validCnpjSh,
      'token-sh': validTokenSh,
      'cnpj-cedente': validCnpjCedente,
      'token-cedente': validTokenCedente,
    };
    mockSoftwareHouseRepository.findByCnpjAndToken.mockResolvedValue(mockSoftwareHouse);
    mockCedenteRepository.findByCnpjTokenAndSoftwareHouseId.mockResolvedValue(mockCedente);

    await authMiddleware(mockReq, mockRes, mockNext);

    expect(mockSoftwareHouseRepository.findByCnpjAndToken).toHaveBeenCalledWith(validCnpjSh, validTokenSh);
    expect(mockCedenteRepository.findByCnpjTokenAndSoftwareHouseId).toHaveBeenCalledWith(validCnpjCedente, validTokenCedente, mockSoftwareHouse.id);
    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockRes.status).not.toHaveBeenCalled();
    expect(mockRes.json).not.toHaveBeenCalled();
    expect(mockReq.auth).toEqual({
      softwareHouseId: mockSoftwareHouse.id,
      cedenteId: mockCedente.id,
    });
  });

  // --- Teste de Criação do Middleware ---
  it("deve lançar erro se cedenteRepository não for fornecido", () => {
    // CORREÇÃO: Garante que o outro repositório está presente para isolar a falha
    const validSHRepo = { findByCnpjAndToken: jest.fn() };
    expect(() => createAuthMiddleware({ softwareHouseRepository: validSHRepo })).toThrow("cedenteRepository missing");
  });

  it("deve lançar erro se softwareHouseRepository não for fornecido", () => {
    // CORREÇÃO: Garante que o outro repositório está presente para isolar a falha
    const validCedenteRepo = { findByCnpjTokenAndSoftwareHouseId: jest.fn() };
    expect(() => createAuthMiddleware({ cedenteRepository: validCedenteRepo })).toThrow("softwareHouseRepository missing");
  });
});