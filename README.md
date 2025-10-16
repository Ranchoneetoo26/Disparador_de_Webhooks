# 📌 Projeto Disparador de Webhooks

## 📖 Introdução

O **Disparador de WH** é uma API desenvolvida em **Node.js** com o objetivo de reenviar notificações de **webhooks do PlugBoleto** que não foram entregues corretamente.
O sistema garante robustez, controle e rastreabilidade no reprocessamento dessas notificações.

---

## 🚀 Tecnologais Utilizadas

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

Estes passos só precisam ser feitos uma vez na máquina.

#### a. Ajustar a Política do PowerShell

O PowerShell pode bloquear a execução de scripts `npm`. Para permitir:

1. Abra o **PowerShell como Administrador**.
2. Execute o comando: `Set-ExecutionPolicy RemoteSigned`
3. Confirme digitando `S` ou `A` e pressionando Enter.

#### b. Verificar Conflitos de Porta com PostgreSQL

O Docker precisa da porta `5433` livre. Se você tiver o PostgreSQL instalado localmente, ele pode causar conflitos.

1. Abra o Gerenciador de Serviços (`Win + R`, digite `services.msc`).
2. Procure por qualquer serviço chamado `postgresql`.
3. Se encontrar algum **"Em Execução"**, clique com o botão direito, **Pare** e **Desative** o serviço.

### 3. Passos para Configurar o Projeto

1. **Clonar o Repositório:**

```bash
git clone <URL_DO_REPOSITORIO_GIT>
cd Disparador_de_Webhooks
```

2. **Criar o Arquivo de Ambiente (********`.env`****************)**

* Na raiz do projeto, crie um novo arquivo chamado `.env`.
* Copie e cole o conteúdo abaixo dentro dele:

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

* Garanta que o Docker Desktop esteja rodando.
* O comando abaixo irá criar e iniciar o contêiner do PostgreSQL em background.

```bash
docker-compose up -d
```

5. **Rodar as "Migrations" (Criar as Tabelas no Banco):**

* Com o contêiner rodando, crie as tabelas para os ambientes de desenvolvimento e teste.

```bash
# Cria as tabelas para o banco de desenvolvimento
npx sequelize-cli db:migrate

# Cria as tabelas para o banco de teste
npx sequelize-cli db:migrate --env test
```

### 4. Rodando a Aplicação

Seu ambiente agora está pronto!

* **Para rodar a aplicação em modo de desenvolvimento:**

```bash
npm start
```

* **Para rodar os testes automatizados:**

```bash
npm test
```

---

## 📂 Estrutura do Projeto

* **Models/Migrations** → Definição de entidades (SoftwareHouse, Cedente, Conta, Convênio, Serviço, Webhook Reprocessado).
* **Services** → Regras de negócio e lógica de reprocessamento.
* **Controllers** → Controle de rotas e validação.
* **Cache (Redis)** → Armazenamento de requisições e consultas.
* **Configuração de Notificação** → JSON de parâmetros configuráveis por conta ou cedente.

*Abaixo segue um detalhamento completo da estrutura de pastas.*

### Raiz do Projeto

* **.env**: Arquivo para armazenar suas variáveis de ambiente, como senhas de banco de dados, chaves de API e configurações sensíveis.
* **.sequelizerc**: Arquivo de configuração para o Sequelize CLI, indicando os caminhos para migrations, models, etc.
* **docker-compose.yml**: Arquivo para orquestrar os contêineres da aplicação, como o Node.js, PostgreSQL e Redis.
* **package.json**: Define os metadados do projeto e as dependências (Express, Sequelize, Redis, etc.).

### `config/`

* **config.js**: Centraliza as configurações da aplicação, carregando-as a partir das variáveis de ambiente definidas no .env.
* **index.js**: Exporta as configurações para serem utilizadas em outras partes do projeto.

### `src/` (Source)

Contém todo o código-fonte da sua aplicação.

* **app.js**: Arquivo principal do Express. Aqui você inicializa o app, aplica os middlewares globais (como o de tratamento de erro) e carrega as rotas.
* **server.js**: Responsável por iniciar o servidor HTTP, ouvindo em uma porta específica.

#### `src/application/`

A camada de aplicação orquestra o fluxo de dados. Ela não contém regras de negócio, mas direciona a execução.

* **dtos/** (Data Transfer Objects): Objetos simples que carregam dados entre as camadas.

  * `ReenviarWebhookInput.js`: Estrutura de dados para a rota POST /reenviar.
  * `ConsultarProtocoloInput.js`: Estrutura de dados para as rotas GET /protocolo e GET /protocolo/:uuid.
* **useCases/**: Contém a lógica de cada caso de uso da aplicação.

  * `ReenviarWebhookUseCase.js`: Implementa todas as regras de negócio para o reenvio de webhooks.
  * `ListarProtocolosUseCase.js`: Lógica para a consulta e filtragem de protocolos.
  * `ConsultarProtocoloUseCase.js`: Lógica para buscar um protocolo individual por UUID.

#### `src/domain/`

O coração da sua aplicação. Contém as regras de negócio mais puras e é independente de frameworks.

* **entities/**: Representam os objetos de negócio do seu sistema, baseados nas tabelas do banco de dados.

  * `SoftwareHouse.js`, `Cedente.js`, `Conta.js`, `Convenio.js`, `Servico.js`, `WebhookReprocessado.js`.
* **exceptions/**: Classes de erro customizadas para lidar com cenários de negócio específicos.

  * `UnprocessableEntityException.js`: Para o erro 422, quando os IDs não correspondem à situação esperada.
  * `ProtocoloNaoEncontradoException.js`: Para o erro 400, quando o UUID não é encontrado.
* **repositories/**: Interfaces que definem os métodos para interagir com o banco de dados e outras fontes de dados. Elas abstraem a camada de persistência.

  * `ISoftwareHouseRepository.js`, `ICedenteRepository.js`, `IWebhookReprocessadoRepository.js`, etc.
  * `ICacheRepository.js`: Interface para abstrair as operações de cache (get, set) com o Redis.

#### `src/infrastructure/`

Camada mais externa, contém as implementações concretas das tecnologias.

* **database/sequelize/**: Implementações específicas do Sequelize.

  * `config/database.js`: Configurações de conexão com o PostgreSQL.
  * `migrations/`: Arquivos de migração do banco de dados gerados pelo Sequelize.
  * `models/`: Definição dos modelos do Sequelize, que mapeiam as tabelas do banco.
  * `repositories/`: Implementação concreta das interfaces de repositório definidas no domínio, utilizando os models do Sequelize.
* **cache/redis/**: Implementações específicas do Redis.

  * `RedisClient.js`: Configura e exporta a conexão com o cliente Redis.
  * `RedisCacheRepository.js`: Implementação da interface ICacheRepository.js usando o Redis para atender aos requisitos de cache.
* **http/**: Tudo relacionado ao protocolo HTTP.

  * `express/controllers/`: Recebem as requisições HTTP, extraem os dados e chamam os UseCases apropriados.
  * `express/middlewares/`: Funções que interceptam as requisições.
  * `express/routes/`: Define as rotas da API.
  * `express/validationSchemas/`: Contém os esquemas de validação do Joi.
* **providers/**: Contém integrações com serviços externos.

  * `AxiosProvider.js`: Uma classe ou conjunto de funções para realizar as chamadas HTTP para o webhook.site.

### `tests/`

Pasta para os testes automatizados, garantindo a qualidade do código.

* **unit/**: Testes unitários para as regras de negócio nos UseCases.
* **integration/**: Testes de integração para as rotas da API, simulando requisições HTTP e verificando as respostas.

```
.
├── config/
│   ├── config.js
│   └── index.js
├── src/
│   ├── app.js
│   ├── server.js
│   ├── application/
│   │   ├── dtos/
│   │   │   ├── ReenviarWebhookInput.js
│   │   │   ├── ReenviarWebhookOutput.js
│   │   │   ├── ConsultarProtocoloInput.js
│   │   │   └── ConsultarProtocoloOutput.js
│   │   └── useCases/
│   │       ├── ReenviarWebhookUseCase.js
│   │       ├── ListarProtocolosUseCase.js
│   │       └── ConsultarProtocoloUseCase.js
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── SoftwareHouse.js
│   │   │   ├── Cedente.js
│   │   │   ├── Conta.js
│   │   │   ├── Convenio.js
│   │   │   ├── Servico.js
│   │   │   └── WebhookReprocessado.js
│   │   ├── exceptions/
│   │   │   ├── InvalidRequestException.js
│   │   │   ├── UnprocessableEntityException.js
│   │   │   └── ProtocoloNaoEncontradoException.js
│   │   └── repositories/
│   │       ├── ISoftwareHouseRepository.js
│   │       ├── ICedenteRepository.js
│   │       ├── IContaRepository.js
│   │       ├── IConvenioRepository.js
│   │       ├── IServicoRepository.js
│   │       ├── IWebhookReprocessadoRepository.js
│   │       └── ICacheRepository.js
│   └── infrastructure/
│       ├── database/
│       │   ├── sequelize/
│       │   │   ├── config/
│       │   │   │   └── database.js
│       │   │   ├── migrations/
│       │   │   ├── models/
│       │   │   │   ├── index.js
│       │   │   │   ├── SoftwareHouseModel.js
│       │   │   │   ├── CedenteModel.js
│       │   │   │   ├── ContaModel.js
│       │   │   │   ├── ConvenioModel.js
│       │   │   │   ├── ServicoModel.js
│       │   │   │   └── WebhookReprocessadoModel.js
│       │   │   └── repositories/
│       │   │       ├── SequelizeSoftwareHouseRepository.js
│       │   │       ├── SequelizeCedenteRepository.js
│       │   │       └── SequelizeWebhookReprocessadoRepository.js
│       ├── cache/
│       │   ├── redis/
│       │   │   ├── RedisClient.js
│       │   │   └── RedisCacheRepository.js
│       ├── http/
│       │   ├── express/
│       │   │   ├── controllers/
│       │   │   │   └── WebhookController.js
│       │   │   ├── middlewares/
│       │   │   │   ├── AuthMiddleware.js
│       │   │   │   ├── ErrorHandler.js
│       │   │   │   └── ValidationMiddleware.js
│       │   │   ├── routes/
│       │   │   │   ├── index.js
│       │   │   │   └── webhookRoutes.js
│       │   │   └── validationSchemas/
│       │   │       └── webhookSchemas.js
│       │   └── providers/
│       │       └── AxiosProvider.js
├── tests/
│   ├── unit/
│   │   └── useCases/
│   │       └── ReenviarWebhookUseCase.spec.js
│   └── integration/
│       └── routes/
│           └── webhookRoutes.spec.js
├── .env
├── .sequelizerc
├── docker-compose.yml
├── package.json
└── README.md
```
