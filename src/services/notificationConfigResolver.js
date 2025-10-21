export function resolveNotificationConfig(product) {
  const configs = {
    boleto: {
      url: 'https://meusistema.com/webhook/boleto',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    pix: {
      url: 'https://meusistema.com/webhook/pix',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    default: {
      url: 'https://meusistema.com/webhook/default',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
  };

  return configs[product] || configs.default;
}