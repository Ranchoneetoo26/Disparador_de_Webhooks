# Convenções do Projeto

Este arquivo define as regras de como organizamos nosso código e como contribuímos para o projeto.

## 📁 Arquitetura e Estrutura de Pastas

O projeto segue os princípios da Clean Architecture, como detalhado no `README.md` principal.

- **`/src/domain`**: Contém as entidades e regras de negócio puras (ex: `WebhookReprocessado`).
- **`/src/application`**: Contém os `UseCases` (casos de uso) e `Interfaces` (contratos de repositório).
- **`/src/infrastructure`**: Contém a implementação concreta das interfaces, como `Repositories` (Sequelize), `Controllers` (Express), `Routes` e `Middlewares`.

### Como criar um novo Módulo/Caso de Uso

1.  **Domain**: Defina a entidade (se nova) em `src/domain/entities`.
2.  **Application**: Crie o `UseCase` (ex: `src/application/useCases/MeuNovoUseCase.js`) e seu `Interface` (ex: `src/application/interfaces/IMeuRepositorio.js`).
3.  **Infrastructure**:
    - Implemente o repositório em `src/infrastructure/repositories`.
    - Crie o `Controller` em `src/infrastructure/http/controllers`.
    - Adicione a rota em `src/infrastructure/http/routes`.
    - Crie testes em `tests/unit` e/ou `tests/integration`.

## ✍️ Convenções de Commit (Git)

Nós utilizamos o padrão **Conventional Commits** para manter o histórico do Git limpo e legível.

**Formato:** `tipo(escopo): descrição`

- **`feat`**: Nova funcionalidade (ex: `feat(reenviar): adiciona retentativa exponencial`)
- **`fix`**: Correção de bug (ex: `fix(protocolo): corrige consulta por uuid`)
- **`docs`**: Alterações na documentação (ex: `docs(readme): atualiza time de desenvolvimento`)
- **`chore`**: Tarefas de manutenção (ex: `chore: atualiza versão do node`)
- **`refactor`**: Mudança de código que não altera a funcionalidade.
- **`test`**: Adição ou ajuste de testes.
