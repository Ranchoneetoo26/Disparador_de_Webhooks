"use strict";

function createAuthMiddleware({
  cedenteRepository,
  softwareHouseRepository,
} = {}) {
  if (!cedenteRepository || !softwareHouseRepository) {
    throw new Error(
      "cedenteRepository e softwareHouseRepository são obrigatórios"
    );
  }

  return async function authMiddleware(req, res, next) {
    console.log("[AuthMiddleware] Recebida nova requisição.");

    try {
      const headers = req.headers || {};
      const cnpjSh = headers["cnpj-sh"];
      const tokenSh = headers["token-sh"];
      const cnpjCedente = headers["cnpj-cedente"];
      const tokenCedente = headers["token-cedente"];

      if (!cnpjSh || !tokenSh || !cnpjCedente || !tokenCedente) {
        console.warn(
          "[AuthMiddleware] Falha: Headers de autenticação faltando."
        );
        return res.status(401).json({ error: "Missing auth headers" });
      }

      console.log(
        `[AuthMiddleware] Buscando SH: CNPJ=${cnpjSh}, Token=${tokenSh}`
      );
      console.log(
        `[AuthMiddleware] Buscando Cedente: CNPJ=${cnpjCedente}, Token=${tokenCedente}`
      );

      const [softwareHouse, cedente] = await Promise.all([
        softwareHouseRepository.findByCnpjAndToken(cnpjSh, tokenSh),
        cedenteRepository.findByCnpjAndToken(cnpjCedente, tokenCedente),
      ]);

      if (!softwareHouse) {
        console.warn("[AuthMiddleware] Falha: SoftwareHouse não encontrada.");
        return res.status(401).json({ error: "Unauthorized" });
      }

      if (!cedente) {
        console.warn("[AuthMiddleware] Falha: Cedente não encontrado.");
        return res.status(401).json({ error: "Unauthorized" });
      }

      console.log(
        `[AuthMiddleware] Sucesso: SH ID=${softwareHouse.id}, Cedente ID=${cedente.id}`
      );
      req.softwareHouse = softwareHouse;
      req.cedente = cedente;

      return next();
    } catch (err) {
      console.error("[AuthMiddleware] Erro inesperado:", err);
      return next(err);
    }
  };
}

module.exports = createAuthMiddleware;
