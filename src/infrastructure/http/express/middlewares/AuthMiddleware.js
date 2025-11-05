<<<<<<< HEAD
<<<<<<< HEAD

=======
>>>>>>> 147c0084fb6ff328823fc70425debc9e25fd26ed
'use strict';
=======
"use strict";
>>>>>>> d69ec169d0d39e2e3744332f34d207bd68b6f06a

function createAuthMiddleware({
  cedenteRepository,
  softwareHouseRepository,
} = {}) {
  if (!cedenteRepository || !softwareHouseRepository) {
    throw new Error(
      "cedenteRepository e softwareHouseRepository são obrigatórios"
    );
  }

<<<<<<< HEAD

=======
>>>>>>> 147c0084fb6ff328823fc70425debc9e25fd26ed
  return async function authMiddleware(req, res, next) {
    console.log("[AuthMiddleware] Recebida nova requisição.");

    try {
      const headers = req.headers || {};
      
      const cnpjSh =
        headers["cnpj-sh"] ||
        headers["x-cnpj-sh"] ||
        headers["cnpj_sh"] ||
        headers["x-cnpj"];
        
      const tokenSh =
        headers["token-sh"] ||
        headers["x-token-sh"] ||
        headers["token_sh"] ||
        headers["x-token"];
        
      const cnpjCedente =
        headers["cnpj-cedente"] ||
        headers["x-cnpj-cedente"] ||
        headers["cnpj_cedente"] ||
        headers["x-cnpj"];
        
      const tokenCedente =
        headers["token-cedente"] ||
        headers["x-token-cedente"] ||
        headers["token_cedente"] ||
        headers["x-token"]; 

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
