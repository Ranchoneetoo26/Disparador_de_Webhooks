const { describe, it, expect, beforeEach } = require("@jest/globals");
const createAuthMiddleware = require("../../../src/infrastructure/http/express/middlewares/AuthMiddleware.js");

describe("AuthMiddleware", () => {
  let mockCedenteRepository;
  let mockSoftwareHouseRepository;
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockCedenteRepository = {
      findByCnpjAndToken: jest.fn(),
    };
    mockSoftwareHouseRepository = {
      findByCnpjAndToken: jest.fn(),
    };
    mockReq = {
      headers: {},
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
});
