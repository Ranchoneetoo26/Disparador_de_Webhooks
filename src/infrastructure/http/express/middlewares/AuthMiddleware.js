export default function createAuthMiddleware({ cedenteRepository, softwareHouseRepository } = {}) {
  // Verifica se ambos os repositórios foram fornecidos
  if (!cedenteRepository) throw new Error('cedenteRepository missing');
  if (!softwareHouseRepository) throw new Error('softwareHouseRepository missing');

  return async function authMiddleware(req, res, next) {
    // Lê os headers requeridos pela Regra 3.5
    const cnpjSh = req.headers['cnpj-sh'];
    const tokenSh = req.headers['token-sh'];
    const cnpjCedente = req.headers['cnpj-cedente'];
    const tokenCedente = req.headers['token-cedente'];

    // Verifica se todos os headers obrigatórios estão presentes
    if (!cnpjSh || !tokenSh || !cnpjCedente || !tokenCedente) {
      // Confirme que esta é a mensagem exata que você quer
      return res.status(401).json({ error: 'Headers de autenticação incompletos.' });
      // Ou se a mensagem antiga ainda está em algum lugar:
      // return res.status(401).json({ error: 'Missing auth headers' });
    }

    try {
      // 1. Valida a Software House
      const softwareHouse = await softwareHouseRepository.findByCnpjAndToken(cnpjSh, tokenSh);
      if (!softwareHouse || softwareHouse.status !== 'ativo') { // Adiciona verificação de status se necessário
        console.warn(`Tentativa de acesso falhou: SoftwareHouse não encontrada ou inativa para CNPJ ${cnpjSh}`);
        return res.status(401).json({ error: 'Credenciais da Software House inválidas ou inativas.' });
      }

      // 2. Valida o Cedente, garantindo que ele pertence à Software House encontrada
      const cedente = await cedenteRepository.findByCnpjTokenAndSoftwareHouseId(
        cnpjCedente,
        tokenCedente,
        softwareHouse.id // Garante a ligação entre Cedente e SoftwareHouse
      );

      if (!cedente || cedente.status !== 'ativo') { // Adiciona verificação de status se necessário
        console.warn(`Tentativa de acesso falhou: Cedente não encontrado, inativo ou não pertence à SH para CNPJ ${cnpjCedente}`);
        return res.status(401).json({ error: 'Credenciais do Cedente inválidas, inativas ou não associadas à Software House.' });
      }

      // 3. Anexa informações autenticadas ao request para uso posterior
      req.auth = {
        softwareHouseId: softwareHouse.id,
        cedenteId: cedente.id,
        // Você pode adicionar mais dados se forem úteis, como os próprios objetos
        // softwareHouse: softwareHouse,
        // cedente: cedente
      };

      // Se tudo deu certo, continua para a próxima rota/middleware
      return next();

    } catch (err) {
      console.error('Erro interno durante a autenticação:', err); // Log detalhado do erro no servidor
      return res.status(500).json({ error: 'Erro interno no servidor durante a autenticação.' });
    }
  };
}
