// src/infrastructure/http/express/middlewares/AuthMiddleware.js
'use strict';

// Esta é uma versão simplificada e com logs do seu AuthMiddleware
export default function createAuthMiddleware({
  cedenteRepository,
  softwareHouseRepository,
} = {}) {
  if (!cedenteRepository || !softwareHouseRepository) {
    throw new Error(
      "cedenteRepository e softwareHouseRepository são obrigatórios"
    );
  }

  // A função 'tryFindBy...' foi removida.
  // Vamos chamar o método que SABEMOS que existe.

  return async function authMiddleware(req, res, next) {
    console.log('[AuthMiddleware] Recebida nova requisição.');

    try {
      const headers = req.headers || {};
<<<<<<< HEAD
      
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
=======
      const cnpjSh = headers["cnpj-sh"];
      const tokenSh = headers["token-sh"];
      const cnpjCedente = headers["cnpj-cedente"];
      const tokenCedente = headers["token-cedente"];
>>>>>>> 651ab5fbc86e1d21442262c94bdcb06b44117687

      if (!cnpjSh || !tokenSh || !cnpjCedente || !tokenCedente) {
        console.warn('[AuthMiddleware] Falha: Headers de autenticação faltando.');
        return res.status(401).json({ error: "Missing auth headers" });
      }
      
      console.log(`[AuthMiddleware] Buscando SH: CNPJ=${cnpjSh}, Token=${tokenSh}`);
      console.log(`[AuthMiddleware] Buscando Cedente: CNPJ=${cnpjCedente}, Token=${tokenCedente}`);

      // Chamada direta aos repositórios, sem a função 'tryFind'
      const [softwareHouse, cedente] = await Promise.all([
        softwareHouseRepository.findByCnpjAndToken(cnpjSh, tokenSh),
        cedenteRepository.findByCnpjAndToken(cnpjCedente, tokenCedente),
      ]);

      if (!softwareHouse) {
        console.warn('[AuthMiddleware] Falha: SoftwareHouse não encontrada.');
        return res.status(401).json({ error: "Unauthorized" });
      }

      if (!cedente) {
        console.warn('[AuthMiddleware] Falha: Cedente não encontrado.');
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      // Sucesso!
      console.log(`[AuthMiddleware] Sucesso: SH ID=${softwareHouse.id}, Cedente ID=${cedente.id}`);
      req.softwareHouse = softwareHouse;
      req.cedente = cedente;

      return next();

    } catch (err) {
      console.error("[AuthMiddleware] Erro inesperado:", err);
      return next(err);
    }
  };
}