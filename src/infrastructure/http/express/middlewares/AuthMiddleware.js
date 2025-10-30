export default function createAuthMiddleware({
  cedenteRepository,
  softwareHouseRepository,
} = {}) {
  if (!cedenteRepository || !softwareHouseRepository) {
    throw new Error(
      "cedenteRepository and softwareHouseRepository are required to create auth middleware"
    );
  }

  const tryFindByCnpjAndToken = async (repo, cnpj, token) => {
    if (!repo) return null;
    const candidates = [
      "findByCnpjAndToken",
      "findByCnpjEToken",
      "findByCnpjToken",
      "findByCnpjAndTokenAsync",
      "findByCredentials",
      "find",
    ];

    for (const name of candidates) {
      const fn = repo[name];
      if (typeof fn === "function") {
        try {
          let result = await fn.call(repo, cnpj, token);
          if (result === undefined) {
            try {
              result = await fn.call(repo, { cnpj, token });
            } catch (e) {}
          }
          if (result) return result;
        } catch (err) {}
      }
    }

    if (typeof repo.find === "function") {
      try {
        const r = await repo.find({ cnpj, token });
        if (r) return r;
      } catch (e) {}
    }

    return null;
  };

  return async function authMiddleware(req, res, next) {
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
        console.log("parou aqui");
        return res.status(401).json({ error: "Missing auth headers" });
      }

      const [softwareHouse, cedente] = await Promise.all([
        tryFindByCnpjAndToken(softwareHouseRepository, cnpjSh, tokenSh),
        tryFindByCnpjAndToken(cedenteRepository, cnpjCedente, tokenCedente),
      ]);

      if (!softwareHouse || !cedente) {
        console.log("parou aqui");
        return res.status(401).json({ error: "Unauthorized" });
      }
      req.softwareHouse = softwareHouse;
      req.cedente = cedente;

      return next();
    } catch (err) {
      console.log("AuthMiddleware error:", err);
      return next(err);
    }
  };
}
