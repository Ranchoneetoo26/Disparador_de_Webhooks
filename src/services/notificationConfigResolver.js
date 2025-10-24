const DEFAULT_CONFIG = {
    retries: 3,
    timeout: 5000
    };

export function resolveNotificationConfig({ conta, cedente, defaultConfig } = {}) {
  
  const fallback = defaultConfig || DEFAULT_CONFIG;

  if (conta && conta.configuracao_notificacao) {
        return conta.configuracao_notificacao;
    }

  if (cedente && cedente.configuracao_notificacao) {
      return cedente.configuracao_notificacao;
  }

  return fallback;
}