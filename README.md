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

### Detalhamento de Cada Pasta e Arquivo

Raiz do Projeto

**.env**: Arquivo para armazenar suas variáveis de ambiente, como senhas de banco de dados, chaves de API e configurações sensíveis.

**.sequelizerc**: Arquivo de configuração para o Sequelize CLI, indicando os caminhos para migrations, models, etc.

**docker-compose.yml**: Arquivo para orquestrar os contêineres da aplicação, como o Node.js, PostgreSQL e Redis.

**package.json**: Define os metadados do projeto e as dependências (Express, Sequelize, Redis, etc.).

### config/

**config.js**: Centraliza as configurações da aplicação, carregando-as a partir das variáveis de ambiente definidas no .env.

**index.js**: Exporta as configurações para serem utilizadas em outras partes do projeto.

### src/ (Source)

Contém todo o código-fonte da sua aplicação.

**app.js**: Arquivo principal do Express. Aqui você inicializa o app, aplica os middlewares globais (como o de tratamento de erro) e carrega as rotas.

**server.js**: Responsável por iniciar o servidor HTTP, ouvindo em uma porta específica.

### src/application/

A camada de aplicação orquestra o fluxo de dados. Ela não contém regras de negócio, mas direciona a execução.

**dtos/** (Data Transfer Objects): Objetos simples que carregam dados entre as camadas.

**ReenviarWebhookInput.js:** Estrutura de dados para a rota POST /reenviar.

**ConsultarProtocoloInput.js:** Estrutura de dados para as rotas GET /protocolo e GET /protocolo/:uuid.

**useCases/:** Contém a lógica de cada caso de uso da aplicação.

**ReenviarWebhookUseCase.js:** Implementa todas as regras de negócio para o reenvio de webhooks.

**ListarProtocolosUseCase.js:** Lógica para a consulta e filtragem de protocolos.

**ConsultarProtocoloUseCase.js:** Lógica para buscar um protocolo individual por UUID.

### src/domain/

O coração da sua aplicação. Contém as regras de negócio mais puras e é independente de frameworks.

**entities/:** Representam os objetos de negócio do seu sistema, baseados nas tabelas do banco de dados.

**SoftwareHouse.js**, **Cedente.js**,
**Conta.js**, **Convenio.js**, **Servico.js**, **WebhookReprocessado.js**.

**exceptions/:** Classes de erro customizadas para lidar com cenários de negócio específicos.

**UnprocessableEntityException.js:** Para o erro 422, quando os IDs não correspondem à situação esperada.

**ProtocoloNaoEncontradoException.js:** Para o erro 400, quando o UUID não é encontrado.

**repositories/:** Interfaces que definem os métodos para interagir com o banco de dados e outras fontes de dados. Elas abstraem a camada de persistência.

**ISoftwareHouseRepository.js, ICedenteRepository.js, IWebhookReprocessadoRepository.js,** etc.

**ICacheRepository.js:** Interface para abstrair as operações de cache (get, set) com o Redis.

### src/infrastructure/

Camada mais externa, contém as implementações concretas das tecnologias.

**database/sequelize/:** Implementações específicas do Sequelize.

**config/database.js:** Configurações de conexão com o PostgreSQL.

**migrations/:** Arquivos de migração do banco de dados gerados pelo Sequelize.

**models/:** Definição dos modelos do Sequelize, que mapeiam as tabelas do banco.

**repositories/:** Implementação concreta das interfaces de repositório definidas no domínio, utilizando os models do Sequelize.

**cache/redis/:** Implementações específicas do Redis.

**RedisClient.js:** Configura e exporta a conexão com o cliente Redis.

**RedisCacheRepository.js:** Implementação da interface ICacheRepository.js usando o Redis para atender aos requisitos de cache.

**http/:** Tudo relacionado ao protocolo HTTP.

**express/controllers/:** Recebem as requisições HTTP, extraem os dados e chamam os UseCases apropriados.

**WebhookController.js:** Terá os métodos reenviar , listar e consultar.

**express/middlewares/:** Funções que interceptam as requisições.

**AuthMiddleware.js:** Validará os headers cnpj-sh, token-sh, cnpj-cedente e token-cedente.

**ErrorHandler.js:** Middleware global para tratamento de erros, conforme a boa prática recomendada.

**ValidationMiddleware.js:** Utilizará o Joi para validar o corpo e os parâmetros das requisições.

**express/routes/:** Define as rotas da API.

**webhookRoutes.js:** Define as rotas POST /reenviar, GET /protocolo, e GET /protocolo/:uuid.

**express/validationSchemas/:** Contém os esquemas de validação do Joi

**webhookSchemas.js:** Esquemas para as rotas de reenvio e consulta, validando parâmetros como product, id, kind, type, etc..

**providers/:** Contém integrações com serviços externos.

**AxiosProvider.js:** Uma classe ou conjunto de funções para realizar as chamadas HTTP para o webhook.site.

### tests/

Pasta para os testes automatizados, garantindo a qualidade do código.

**unit/:** Testes unitários para as regras de negócio nos UseCases.

**integration/:** Testes de integração para as rotas da API, simulando requisições HTTP e verificando as respostas.

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
