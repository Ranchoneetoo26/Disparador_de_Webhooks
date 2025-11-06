# 📌 Projeto Disparador de Webhooks

Sistema responsável por reprocessar e reenviar notificações de webhooks do PlugBoleto que não foram entregues corretamente, garantindo rastreabilidade, confiabilidade e controle operacional.

---

## 👥 Equipe de Desenvolvimento

| Nome Completo    | Função / Responsabilidade Principal |
| ---------------- | ----------------------------------- |
| Antonio Neto     | Analista de Projeto                 |
| Matheus Moreira  | QA Engineer                         |
| Lucas Arruma     | Database Engineer                   |
| Thiago Cezario   | Backend Developer                   |
| Cauan Hiyuji     | Backend Developer                   |
| João Miguel      | Backend Developer                   |
| Felipe Barbosa   | Backend Developer                   |
| Leonardo Campelo | Backend Developer                   |

---

## 📖 Descrição do Projeto

O Disparador de Webhooks (WH) é uma API construída em Node.js, responsável por identificar, registrar e reenviar webhooks que não foram processados corretamente. Seu objetivo principal é garantir que as notificações cheguem ao destino, evitando perda de eventos críticos.

---

## 🚀 Tecnologias Utilizadas

- Node.js + Express.js
- PostgreSQL
- Sequelize ORM
- Redis
- Docker
- JWT (Autenticação)
- axios (requisições externas)
- joi (validações)
- Swagger (Documentação)
- Jest + Supertest (Testes Automatizados)

---

## ⚙️ Configuração do Ambiente

### Pré-requisitos

- Git
- Node.js
- Docker Desktop

### Configuração no Windows

Liberar execução de scripts no PowerShell:
Set-ExecutionPolicy RemoteSigned

Verificar conflito com PostgreSQL local:
Pare o serviço PostgreSQL caso ele esteja usando a porta 5433.

---

### Instalação do Projeto

Clonar repositório:
git clone <https://github.com/Ranchoneetoo26/Disparador_de_Webhooks.git>
cd Disparador_de_Webhooks

Criar arquivo `.env`:
DB_HOST=localhost
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=disparador_dev
DB_DIALECT=postgres
DB_PORT=5433

DB_HOST_TEST=localhost
DB_USERNAME_TEST=postgres
DB_PASSWORD_TEST=postgres
DB_DATABASE_TEST=disparador_test
DB_DIALECT_TEST=postgres
DB_PORT_TEST=5433

Instalar dependências:
npm install

Subir containers e preparar banco:

docker compose down -v
docker compose up -d
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all

Se ocorrer erro nos testes, repetir a preparação do banco.

---

### Execução

Rodar a aplicação:
npm start

Rodar todos os testes:
npm test

Rodar testes específicos se necessario:
npm test -- tests/unit/userCases/ConsultarProtocoloUseCase.spec.js
npm test -- tests/unit/middlewares/AuthMiddleware.spec.js
npm test -- tests/unit/services/notificationConfigResolver.spec.js

---

## 📄 Swagger

Acesse no navegador após subir a API:
http://localhost:3333/wb-docs

---

## 📂 Estrutura do Projeto (Clean Architecture)

Disparador_de_Webhooks/
├─ config/
├─ src/
│ ├─ app.js
│ ├─ server.js
│ ├─ application/
│ ├─ domain/
│ └─ infrastructure/
├─ tests/
└─ docker-compose.yml

---

## 🧩 Entidades Principais

- SoftwareHouse
- Cedente
- Conta
- Convênio
- Serviço
- WebhookReprocessado

---

## 📖 Regras de Negócio

1.  **Autenticação**: Este endpoint é protegido e exige um token JWT válido.
2.  **Validação**: O corpo da requisição (payload) é validado pelo Joi.
3.  **Processo**: Ao receber uma requisição, o sistema:
    - Identifica os webhooks pendentes ou falhos com base nos critérios recebidos.
    - Enfileira esses webhooks (provavelmente no Redis) para serem processados de forma assíncrona.
    - Retorna imediatamente um protocolo (UUID) para o usuário, confirmando que a solicitação foi recebida.
4.  **Assíncrono**: O reenvio **não** acontece no momento da requisição. Ele é apenas agendado. O processamento real é feito por outro serviço (worker) que consome a fila.

## ✍️ Termos Específicos (Onboarding)

- **Protocolo**: É o UUID retornado. Ele é a "chave" para consultar o status desse lote de reenvio.
- **Reenvio vs. Reprocessamento**: Para este endpoint, "reenviar" significa "agendar um reprocessamento".

---

## 🔑 Endpoints Principais

| Método | Rota             | Descrição                     |
| ------ | ---------------- | ----------------------------- |
| POST   | /reenviar        | Reenvia webhooks pendentes    |
| GET    | /protocolo       | Lista protocolos              |
| GET    | /protocolo/:uuid | Consulta protocolo específico |

---

## 🧾 Licença

Projeto criado para fins educacionais e acadêmicos.  
© 2025 — Todos os direitos reservados à equipe de desenvolvimento.
