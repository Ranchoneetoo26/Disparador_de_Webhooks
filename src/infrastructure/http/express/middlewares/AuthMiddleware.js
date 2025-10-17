export default function createAuthMiddleware({ cedenteRepository } = {}) {
  if (!cedenteRepository) throw new Error('cedenteRepository missing');

  return async function authMiddleware(req, res, next) {
    const cnpj = req.headers['x-cnpj'] || req.headers['x_cnpj'];
    const token = req.headers['x-token'] || req.headers['x_token'];

    if (!cnpj || !token) {
      return res.status(401).json({ error: 'Missing auth headers' });
    }

    try {
      const cedente = await cedenteRepository.findByCnpjAndToken(cnpj, token);
      if (!cedente) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      req.cedente = cedente;
      return next();
    } catch (err) {
      return res.status(500).json({ error: 'Internal auth error' });
    }
  };
}
