# Copilot Instructions — Obra Fácil

## Projeto

Marketplace que conecta proprietários de imóveis a profissionais autônomos da construção civil.

**Monorepo npm workspaces:**
- `apps/backend` — NestJS 11 REST API
- `apps/frontend` — Next.js 15 App Router
- `packages/shared` — Tipos e schemas Zod compartilhados

---

## Regras de código

### Geral
- TypeScript estrito em todo o projeto — sem `any` sem justificativa explícita
- Conventional Commits: `feat|fix|refactor|test|docs|chore(escopo): descrição`
- Sem `console.log` em código de produção

### Backend (NestJS)
- Todo endpoint retorna `{ data: T }` via `ResponseEnvelopeInterceptor`
- Erros retornam `{ error: string, code: string }` via `HttpExceptionFilter`
- Autenticação via `ClerkAuthGuard` (ou bypass local com `DISABLE_CLERK_AUTH=true`)
- Validação de DTOs com schemas Zod de `@obrafacil/shared` via `ZodValidationPipe`
- Banco de dados via `DatabaseService` (pool `pg`) — **não use Supabase JS**
- Queries SQL: sempre use parâmetros (`$1, $2, ...`) para evitar SQL injection

### Frontend (Next.js)
- Server Components por padrão; Client Components apenas quando necessário
- Dados via `api.get()` / `api.post()` do `lib/api/client.ts` — **não acesse o banco diretamente**
- Tipos importados de `@obrafacil/shared`, nunca duplicados
- Sem `@supabase/supabase-js` ou `@supabase/ssr` — essas dependências foram removidas

---

## Banco de dados

- Local: PostgreSQL 17 Docker em `localhost:5433`
- PostgreSQL driver: `pg` (node-postgres) via `DatabaseService`
- Schema: `docker/01-schema.sql`
- Seed data: `docker/02-seed.sql`

---

## Ambiente local

```bash
npm run docker:up    # sobe DB + backend + frontend
npm run docker:down  # para tudo
npm run docker:reset # recria o banco do zero
```

Frontend: http://localhost:3000  
Backend Swagger: http://localhost:3001/api/docs

> Setup detalhado: [docs/04-ambiente-e-processos/setup-local.md](../docs/04-ambiente-e-processos/setup-local.md)  
> Variáveis de ambiente: [docs/04-ambiente-e-processos/variaveis-ambiente.md](../docs/04-ambiente-e-processos/variaveis-ambiente.md)

---

## Verificações obrigatórias antes de finalizar qualquer tarefa

```bash
npm run lint --workspace=backend
npm run lint --workspace=frontend
npm run build --workspace=backend
npm run build --workspace=frontend
```
