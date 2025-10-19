function _normalizeConfigValue(value) {
  if (value === undefined || value === null) return null;
  if (typeof value === 'object') return value;
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch (err) { return value; }
  }
  return value;
}

function resolveNotificationConfig({ conta, cedente, defaultConfig = { retries: 3, timeout: 5000 } } = {}) {
  const contaCfg = conta ? _normalizeConfigValue(conta.configuracao_notificacao) : null;
  if (contaCfg) return contaCfg;

  const cedenteCfg = cedente ? _normalizeConfigValue(cedente.configuracao_notificacao) : null;
  if (cedenteCfg) return cedenteCfg;

  return defaultConfig;
}

module.exports = { resolveNotificationConfig };