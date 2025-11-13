# Definições do Ambiente de Desenvolvimento

Este arquivo detalha as ferramentas e configurações necessárias para ter uma boa experiência de desenvolvimento e manter o padrão do projeto, como discutido na nossa documentação.

## 🛠️ Ferramentas Obrigatórias

- Git
- Node.js
- Docker Desktop (para Postgres e Redis)

## 🔧 Extensões Recomendadas (VSCode)

Para garantir a padronização do código, instale as seguintes extensões:

- **ESLint**: `dbaeumer.vscode-eslint` (Para padronização de código)
- **Prettier**: `esbenp.prettier-vscode` (Para formatação de código)
- **EditorConfig**: `EditorConfig.EditorConfig` (Para padronização de estilos básicos)
- **Docker**: `ms-azuretools.vscode-docker` (Para gerenciar o docker-compose.yml)
- **GitLens**: `eamodio.gitlens` (Para facilitar a visualização do histórico Git)

## 🔑 Variáveis de Ambiente (.env)

O arquivo `.env` deve ser criado a partir do `.env.example`. As chaves principais estão detalhadas no `README.md` principal, na seção "Configuração do Projeto".
