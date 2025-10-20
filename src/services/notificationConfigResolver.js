export function resolveNotificationConfig({ conta = null, cedente = null, defaultConfig = null } = {}) {
  const fallback = defaultConfig || { retries: 3, timeout: 5000 };

  if (conta && conta.configuracao_notificacao) return conta.configuracao_notificacao;
  if (cedente && cedente.configuracao_notificacao) return cedente.configuracao_notificacao;
  return fallback;
}
