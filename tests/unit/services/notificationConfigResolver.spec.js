import { describe, it, expect } from '@jest/globals';
import { resolveNotificationConfig } from '@/services/notificationConfigResolver';

describe('notificationConfigResolver', () => {
  it('returns conta configuration when present', () => {
    const conta = { configuracao_notificacao: { retries: 1 } };
    const cedente = { configuracao_notificacao: { retries: 5 } };

    const result = resolveNotificationConfig({ conta, cedente });

    expect(result).toEqual({ retries: 1 });
  });

  it('returns cedente configuration when conta missing', () => {
    const conta = { configuracao_notificacao: null };
    const cedente = { configuracao_notificacao: { timeout: 1000 } };

    const result = resolveNotificationConfig({ conta, cedente });

    expect(result).toEqual({ timeout: 1000 });
  });

  it('returns default when both missing', () => {
    const result = resolveNotificationConfig({ conta: null, cedente: null });

    expect(result).toEqual({ retries: 3, timeout: 5000 });
  });
});
