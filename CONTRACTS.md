# Contratos do Projeto (Explicação Simples)

Este documento explica de forma clara e objetiva como cada parte principal do sistema deve funcionar para facilitar o desenvolvimento e os testes.

---

## 1. AuthMiddleware (Autenticação)

**Onde fica:**
`src/infrastructure/http/express/middlewares/AuthMiddleware.js`

**Como usar:**
Você importa e chama a função passando um repositório de cedente:

```js
import createAuthMiddleware from ".../AuthMiddleware.js";
const middleware = createAuthMiddleware({ cedenteRepository });
```

**O que faz:**

- Verifica se os headers `x-cnpj` e `x-token` estão presentes na requisição.
- Se faltar algum, responde com erro 401: `{ error: 'Missing auth headers' }`
- Se ambos existem, chama `cedenteRepository.findByCnpjAndToken(cnpj, token)`:
  - Se encontrar o cedente, coloca ele em `req.cedente` e segue (`next()`)
  - Se não encontrar, responde com erro 401: `{ error: 'Unauthorized' }`

**Exemplo de uso:**

```js
// Requisição com headers válidos.
req.headers = { "x-cnpj": "123", "x-token": "abc" };
// Middleware chama repo e segue se encontrar
```

---

## 2. Notification Config Resolver (Prioridade de Configuração)

**Onde fica:**
`src/services/notificationConfigResolver.js`

**Como usar:**

```js
import { resolveNotificationConfig } from ".../notificationConfigResolver.js";
const config = resolveNotificationConfig({ conta, cedente, defaultConfig });
```

**O que faz:**

- Se `conta.configuracao_notificacao` existir, retorna ela.
- Se não, mas `cedente.configuracao_notificacao` existir, retorna ela.
- Se nenhum dos dois, retorna o valor padrão `{ retries: 3, timeout: 5000 }` ou o que você passar em `defaultConfig`.

**Exemplo de uso:**

```js
const config = resolveNotificationConfig({
  conta: { configuracao_notificacao: { retries: 1 } },
  cedente: { configuracao_notificacao: { retries: 5 } },
});
// config será { retries: 1 }
```

---

## 3. ICacheRepository (Interface de Cache)

**Como deve funcionar:**

- Ter método `get(key)` que retorna o valor salvo ou null.
- Ter método `set(key, value, { ttl })` que salva o valor com tempo de expiração.

**Exemplo de uso:**

```js
await cacheRepository.set("protocolo:123", { ...dados }, { ttl: 3600 });
const dados = await cacheRepository.get("protocolo:123");
```

---

Se seguir esses contratos, os testes vão funcionar e a integração entre as partes será mais fácil!
