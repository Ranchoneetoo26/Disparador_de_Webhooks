import { describe, it, expect } from "@jest/globals";
import request from "supertest";
import app from "../../../src/app.js"; // Caminho corrigido para app

// Este teste não precisa do banco, então não precisa importar o 'db'

describe("Testes da API Principal", () => {
  it("deve responder com status 200 na rota GET /", async () => {
    const response = await request(app).get("/");
    expect(response.statusCode).toBe(200);
  });
});