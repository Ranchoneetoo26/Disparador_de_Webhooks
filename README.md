# 📌 Projeto Disparador de Webhooks

---

## 👥 Equipe de Desenvolvimento

| Nome Completo        | Função / Responsabilidade Principal |
|----------------------|------------------------------------|
| Antonio Neto         | Analista de projeto 
| Matheus Moreira      | QA Engineer 
| Lucas Arruma         | Database Engineer
| Thiago Cezario       | Backend Developer 
| Cauan Hiyuji         | Backend Developer 
| João Miguel          | Backend Developer 
| Felipe Barbosa       | Backend Developer  
| Leonardo Campelo     | Backend Developer 

---

## 📖 Introdução

O **Disparador de WH** é uma API desenvolvida em **Node.js** com o objetivo de reenviar notificações de **webhooks do PlugBoleto** que não foram entregues corretamente.  
O sistema garante robustez, controle e rastreabilidade no reprocessamento dessas notificações.

---

## 🚀 Tecnologias Utilizadas

* **Node.js + Express.js** → API Backend  
* **PostgreSQL** → Banco de Dados  
* **Sequelize** → ORM para integração com banco  
* **Redis** → Cache de dados e otimização de performance  
* **Docker** → Gerenciamento de contêineres para o ambiente de desenvolvimento  
* **dotenv** → Variáveis de ambiente  
* **axios** → Requisições HTTP externas  
* **jsonwebtoken (JWT)** → Autenticação  
* **uuid** → Identificadores únicos  
* **joi** → Validação de dados  
* **webhook.site** → Testes de simulação de webhooks  

---

## ⚙️ Guia de Configuração e Instalação do Ambiente

Siga estes passos para configurar e rodar o projeto em sua máquina local, especialmente em um ambiente Windows.

### 1. Pré-requisitos

Antes de começar, garanta que você tenha as seguintes ferramentas instaladas:

* **Git**
* **Node.js** (recomendado via NVM quando possível)
* **Docker Desktop**

### 2. Configuração do Ambiente Windows (Passo Único)

#### a. Ajustar a Política do PowerShell

O PowerShell pode bloquear a execução de scripts `npm`. Para permitir:

1. Abra o **PowerShell como Administrador**.  
2. Execute o comando:  
   ```bash
   Set-ExecutionPolicy RemoteSigned
   ```  
3. Confirme digitando `S` ou `A` e pressionando Enter.

#### b. Verificar Conflitos de Porta com PostgreSQL

O Docker precisa da porta `5433` livre.  
Se você tiver o PostgreSQL instalado localmente, ele pode causar conflitos:

1. Abra o **Gerenciador de Serviços** (`Win + R`, digite `services.msc`).  
2. Procure por qualquer serviço chamado `postgresql`.  
3. Se encontrar algum **"Em Execução"**, clique com o botão direito, **Pare** e **Desative** o serviço.

---

### 3. Passos para Configurar o Projeto

1. **Clonar o Repositório:**

```bash
git clone <URL_DO_REPOSITORIO_GIT>
cd Disparador_de_Webhooks
```

2. **Criar o Arquivo `.env`**

Na raiz do projeto, crie o arquivo `.env` com o conteúdo abaixo:

```env
# --- BANCO DE DADOS DE DESENVOLVIMENTO ---
DB_HOST=localhost
DB_USERNAME=postgres
DB_PASSWORD=postgres 
DB_DATABASE=disparador_dev
DB_DIALECT=postgres
DB_PORT=5433

# --- BANCO DE DADOS DE TESTE ---
DB_HOST_TEST=localhost
DB_USERNAME_TEST=postgres
DB_PASSWORD_TEST=postgres 
DB_DATABASE_TEST=disparador_test
DB_DIALECT_TEST=postgres
DB_PORT_TEST=5433
```

3. **Instalar as Dependências:**

```bash
npm install
```

4. **Iniciar o Banco de Dados com Docker:**

```bash
docker-compose up -d
```

5. **Rodar as "Migrations":**

```bash
npx sequelize-cli db:migrate
npx sequelize-cli db:migrate --env test
```

---

### 4. Rodando a Aplicação

* **Modo de desenvolvimento:**
  ```bash
  npm start
  ```

* **Rodar os testes automatizados:**
  ```bash
  npm test
  ```
  
* **Rodando Testes Unitários Específicos:**

    * Para testar o `UseCase` de consulta individual de protocolo (`GET /protocolo/:uuid`):
        ```bash
        npm test -- tests/unit/userCases/ConsultarProtocoloUseCase.spec.js
        ```
    * Para testar o `Middleware` de autenticação:
        ```bash
        npm test -- tests/unit/middlewares/AuthMiddleware.spec.js
        ```
    * Para testar a lógica de prioridade de configuração (Conta vs. Cedente):
        ```bash
        npm test -- tests/unit/services/notificationConfigResolver.spec.js
        ```
---

## 📂 Estrutura do Projeto

```
Disparador_de_Webhooks/
│
├── config/
│   ├── config.js
│   └── index.js
│
├── src/
│   ├── app.js
│   ├── server.js
│   ├── application/
│   │   ├── dtos/
│   │   └── useCases/
│   ├── domain/
│   │   ├── entities/
│   │   ├── exceptions/
│   │   └── repositories/
│   └── infrastructure/
│       ├── database/
│       ├── cache/
│       ├── http/
│       └── providers/
│
├── tests/
│   ├── unit/
│   └── integration/
│
├── .env
├── docker-compose.yml
├── package.json
└── README.md
```

---

## 🧩 Entidades Principais

- **SoftwareHouse**  
- **Cedente**  
- **Conta**  
- **Convênio**  
- **Serviço**  
- **WebhookReprocessado**

---

## 🧠 Regras de Negócio

* O sistema deve reenviar webhooks pendentes ou falhos.  
* Cada requisição de webhook é armazenada com histórico de tentativas.  
* Logs e protocolos são rastreáveis por UUID.  
* Configurações específicas podem ser aplicadas por **conta** ou **cedente**.  
* Validações e autenticação via **JWT**.

---

## 🔑 Endpoints Principais

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/reenviar` | Reenvia notificações de webhooks não entregues |
| `GET` | `/protocolo` | Lista protocolos de reenvio |
| `GET` | `/protocolo/:uuid` | Consulta detalhes de um protocolo específico |

---

## 🧾 Licença

Este projeto foi desenvolvido para fins educacionais e acadêmicos.  
© 2025 - Todos os direitos reservados à equipe de desenvolvimento.

```




