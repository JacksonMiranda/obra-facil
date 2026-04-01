# Arquitetura Técnica — Obra Fácil

## Visão Geral

```
┌───────────────────────────────────────────────────────────────┐
│                        Cliente (Browser)                       │
└──────────────────────────────┬────────────────────────────────┘
                               │ HTTPS
┌──────────────────────────────▼────────────────────────────────┐
│                  Next.js 15 (Frontend)                         │
│  App Router · React 19 · Tailwind CSS · TypeScript             │
│  Auth: Clerk (ou bypass local)                                 │
│  Deploy: Vercel (SSR + Edge Functions)                         │
└──────────────────────────────┬────────────────────────────────┘
                               │ HTTP REST (Bearer token Clerk)
┌──────────────────────────────▼────────────────────────────────┐
│                  NestJS 11 (Backend)                           │
│  REST API · Swagger /api/docs · TypeScript                     │
│  Auth: ClerkAuthGuard · Validação: Zod                         │
│  Deploy: Vercel Serverless (api/index.ts)                      │
└──────────────────────────────┬────────────────────────────────┘
                               │ node-postgres (pg)
┌──────────────────────────────▼────────────────────────────────┐
│                  PostgreSQL 17                                  │
│  Local: Docker (porta 5433)                                    │
│  Produção: Supabase PostgreSQL (pooler, porta 6543)            │
└───────────────────────────────────────────────────────────────┘
```

---

## Estrutura do Monorepo

```
obra-facil/
├── apps/
│   ├── backend/          ← NestJS API
│   └── frontend/         ← Next.js
├── packages/
│   └── shared/           ← Tipos e schemas Zod compartilhados
├── docker/
│   ├── 01-schema.sql     ← DDL do banco de dados
│   └── 02-seed.sql       ← Dados de exemplo
├── supabase/
│   └── migrations/       ← Histórico de migrations (referência)
└── docker-compose.yml    ← Ambiente local completo
```

---

## Backend (NestJS)

### Estrutura de módulos

```
src/
├── app.module.ts                 ← Módulo raiz
├── core/
│   ├── guards/clerk-auth.guard   ← Autenticação JWT Clerk
│   ├── interceptors/response-envelope  ← Wrapper { data: T }
│   ├── filters/http-exception    ← Wrapper { error, code }
│   ├── pipes/zod-validation      ← Validação de DTOs
│   └── decorators/current-user  ← @CurrentUser()
├── database/
│   ├── database.module.ts        ← DatabaseModule (global)
│   └── database.service.ts       ← Pool pg, método query<T>()
└── modules/
    ├── professionals/            ← Busca + perfil profissional
    ├── works/                    ← Portfolio de serviços
    ├── orders/                   ← Pedidos de serviço
    ├── conversations/            ← Salas de chat
    ├── messages/                 ← Mensagens do chat
    ├── material-lists/           ← Listas de materiais
    └── webhooks/                 ← Webhooks Clerk
```

### Padrão de resposta

Todas as rotas retornam `{ data: T }` via `ResponseEnvelopeInterceptor`.  
Erros retornam `{ error: string, code: string }` via `HttpExceptionFilter`.

### Autenticação

`ClerkAuthGuard` verifica o Bearer token JWT em todas as rotas protegidas.  
Em desenvolvimento local, `DISABLE_CLERK_AUTH=true` resolve o usuário via `SELECT * FROM profiles LIMIT 1`.

---

## Frontend (Next.js)

### App Router

```
src/app/
├── layout.tsx             ← Layout raiz (Clerk Provider)
├── (app)/                 ← Rotas protegidas (middleware)
│   ├── page.tsx           ← Home (listagem de profissionais)
│   ├── busca/             ← Busca com filtros
│   ├── profissional/[id]/ ← Perfil + avaliações
│   ├── obras/             ← Portfolio de obras
│   ├── pedidos/           ← Pedidos do usuário
│   └── mensagens/         ← Chat
└── sign-in/               ← Página de login Clerk
```

### Client HTTP

```
src/lib/api/client.ts
```

- Server-side: usa `INTERNAL_API_URL` (`http://backend:3001/api`) para comunicação interna no Docker
- Browser: usa `NEXT_PUBLIC_API_URL`
- Injeta automaticamente o Bearer token do Clerk (ou o ID do bypass em dev)

---

## Banco de Dados

### Schema principal (12 tabelas)

| Tabela | Descrição |
|---|---|
| `profiles` | Usuários (sincronizado pelo webhook Clerk) |
| `professionals` | Profissionais cadastrados |
| `services` | Tipos de serviço |
| `professional_services` | Relação profissional ↔ serviço |
| `works` | Portfolio de obras |
| `work_images` | Imagens do portfolio |
| `orders` | Pedidos de serviço |
| `reviews` | Avaliações |
| `conversations` | Salas de chat |
| `conversation_participants` | Participantes de cada conversa |
| `messages` | Mensagens |
| `material_lists` | Listas de materiais |

### Estratégia de banco de dados

- **Local**: PostgreSQL 17 via Docker (sem RLS, schema simplificado)
- **Produção**: Supabase PostgreSQL (connection pooler porta 6543) — a string de conexão `DATABASE_URL` aponta para o pooler do Supabase
- **Migrations**: O diretório `supabase/migrations/` mantém o histórico de migrations para referência; `docker/01-schema.sql` é o estado atual do schema

---

## Deploy (Vercel)

### Frontend
Vercel detecta automaticamente o Next.js. Build command: `npm run vercel-build`.  
O `vercel.json` na raiz aponta o output do build para `apps/frontend/.next`.

### Backend
`api/index.ts` na raiz do repositório exporta o app NestJS como uma Vercel Serverless Function.  
Variáveis de ambiente são configuradas no dashboard do Vercel.

---

## CI/CD

`.github/workflows/ci.yml` roda em todo PR/push para `main`:
1. `npm ci`
2. `npm run lint:frontend`
3. Type-check (tsc)
4. `npm run build:frontend`
5. `npm audit`

Deploy no Vercel é acionado automaticamente pelo Vercel GitHub App ao fazer merge em `main`.
