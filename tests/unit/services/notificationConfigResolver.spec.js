const { describe, it, expect } = require("@jest/globals");
const {
  resolveNotificationConfig,
} = require("@/services/notificationConfigResolver");

describe("notificationConfigResolver", () => {
  it("Retorna a configuração da conta quando presente.", () => {
    const conta = { configuracao_notificacao: { retries: 1 } };
    const cedente = { configuracao_notificacao: { retries: 5 } };

    const result = resolveNotificationConfig({ conta, cedente });

    expect(result).toEqual({ retries: 1 });
  });

  it("Retorna a configuração do cedente quando a conta está ausente.", () => {
    const conta = { configuracao_notificacao: null };
    const cedente = { configuracao_notificacao: { timeout: 1000 } };

    const result = resolveNotificationConfig({ conta, cedente });

    expect(result).toEqual({ timeout: 1000 });
  });

  it("Retorna o padrão quando ambos estão ausentes.", () => {
    const result = resolveNotificationConfig({ conta: null, cedente: null });

    expect(result).toEqual({ retries: 3, timeout: 5000 });
  });
});
