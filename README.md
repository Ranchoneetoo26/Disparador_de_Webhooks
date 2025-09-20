# 📌 Projeto Disparador de Webhooks

## 📖 Introdução

O **Disparador de WH** é uma API desenvolvida em **Node.js** com objetivo de reenviar notificações de **webhooks do PlugBoleto** que não foram entregues corretamente.  
O sistema garante robustez, controle e rastreabilidade no reprocessamento dessas notificações.

---

## 🚀 Tecnologias Utilizadas

- **Node.js** + **Express.js** → API Backend
- **PostgreSQL** → Banco de Dados
- **Sequelize** → ORM para integração com banco
- **Redis** → Cache de dados e otimização de performance
- **dotenv** → Variáveis de ambiente
- **axios** → Requisições HTTP externas
- **jsonwebtoken (JWT)** → Autenticação
- **uuid** → Identificadores únicos
- **joi** → Validação de dados
- **webhook.site** → Testes de simulação de webhooks

---

## 📂 Estrutura do Projeto

- **Models/Migrations** → Definição de entidades (SoftwareHouse, Cedente, Conta, Convênio, Serviço, Webhook Reprocessado).
- **Services** → Regras de negócio e lógica de reprocessamento.
- **Controllers** → Controle de rotas e validação.
- **Cache (Redis)** → Armazenamento de requisições e consultas.
- **Configuração de Notificação** → JSON de parâmetros configuráveis por conta ou cedente.

---

## 📌 Regras de Negócio

### 🔄 Reenvio de Webhook (POST `/reenviar`)

- **Parâmetros obrigatórios:** `product`, `id[]`, `kind`, `type`.
- **Validações:**
  - `product`: `boleto` | `pagamento` | `pix`
  - `id`: array de até **30 elementos** (mesmo produto).
  - `kind`: atualmente apenas `"webhook"`.
  - `type`: `disponível` | `cancelado` | `pago`.
- **Cache:** Redis por **1 hora**.
- **Erros:**
  - `422` → Situação divergente dos IDs.
  - `400` → Erro genérico de processamento.
- **Após sucesso:** armazenar dados em **Webhook Reprocessado**.

---

### 📑 Consulta de Protocolos

- **GET `/protocolo`**

  - Filtros obrigatórios: `start_date`, `end_date`.
  - Cache em Redis: **1 dia**.
  - Filtros opcionais: `product`, `id`, `kind`, `type`.

- **GET `/protocolo/:uuid`**
  - Consulta individual com cache de **1 hora**.
  - Se protocolo não encontrado → `400 Bad Request`.

---

### ⚙️ Configuração de Notificação

Exemplo de JSON configurável:

```json
{
  "url": "https://webhook.site/CHAVEALEATORIA",
  "email": null,
  "tipos": {},
  "cancelado": true,
  "pago": true,
  "disponivel": true,
  "header": false,
  "ativado": true,
  "header_campo": "",
  "header_valor": "",
  "headers_adicionais": [
    {
      "x-empresa": "",
      "content-type": "application/json"
    }
  ]
}
```
