# Variáveis de Ambiente — Obra Fácil

Este documento lista todas as variáveis de ambiente do projeto, onde encontrá-las e como configurá-las.

---

## Backend (`apps/backend/.env`)

| Variável | Necessária | Padrão local | Descrição |
|---|---|---|---|
| `DATABASE_URL` | ✅ | `postgresql://obrafacil:obrafacil@localhost:5433/obrafacil_db` | Connection string PostgreSQL. Local: Docker. Produção: Supabase pooler (`pooler.supabase.com:6543`). |
| `DISABLE_CLERK_AUTH` | Dev | `true` | Desabilita verificação JWT do Clerk. **Nunca use em produção.** |
| `CLERK_SECRET_KEY` | Prod | — | Chave secreta do Clerk. Encontrada em: dashboard.clerk.com → API Keys. |
| `CLERK_WEBHOOK_SECRET` | Prod | — | Secret do webhook Clerk → NestJS. Gerado ao criar o webhook no Clerk. |
| `PORT` | — | `3001` | Porta do servidor HTTP. |
| `CORS_ORIGIN` | — | `http://localhost:3000` | Origem permitida para CORS. |

---

## Frontend (`apps/frontend/.env.local`)

| Variável | Necessária | Padrão local | Descrição |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | ✅ | `http://localhost:3001/api` | URL pública do backend. Usada pelo browser. Em produção: URL do backend no Vercel. |
| `NEXT_PUBLIC_DISABLE_CLERK_AUTH` | Dev | `true` | Desabilita Clerk no frontend. **Nunca use em produção.** |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Prod | — | Chave pública do Clerk (começa com `pk_`). |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | — | `/sign-in` | Rota de login. |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | — | `/sign-up` | Rota de cadastro. |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | — | `/` | Redirecionamento após login. |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | — | `/` | Redirecionamento após cadastro. |

> **Nota**: variáveis prefixadas com `NEXT_PUBLIC_` são expostas ao browser. Nunca coloque segredos nelas.

---

## Docker Compose (`docker-compose.yml`)

O `docker-compose.yml` já contém os valores de ambiente para desenvolvimento local. Você **não precisa** alterar nada para rodar localmente.

| Serviço | Variáveis injetadas |
|---|---|
| `db` | `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` |
| `backend` | `DATABASE_URL`, `DISABLE_CLERK_AUTH=true`, `PORT`, `CORS_ORIGIN` |
| `frontend` | `NEXT_PUBLIC_API_URL` (URL interna Docker), `NEXT_PUBLIC_DISABLE_CLERK_AUTH=true` |

---

## CI/CD (GitHub Actions)

| Secret / Variable | Onde configurar | Descrição |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | GitHub → Settings → Secrets | Build do frontend em CI |
| `CLERK_SECRET_KEY` | GitHub → Settings → Secrets | Build do frontend em CI |
| `VERCEL_TOKEN` | GitHub → Settings → Secrets | Deploy manual via CLI |
| `VERCEL_ORG_ID` | GitHub → Settings → Variables | ID da org no Vercel |
| `VERCEL_PROJECT_ID` | GitHub → Settings → Variables | ID do projeto no Vercel |

---

## Produção (Vercel Dashboard)

Configure estas variáveis no painel do Vercel em **Settings → Environment Variables**:

### Backend / API
- `DATABASE_URL` → connection string do Supabase PostgreSQL pooler:
  ```
  postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
  ```
- `CLERK_SECRET_KEY`
- `CLERK_WEBHOOK_SECRET`
- `CORS_ORIGIN` → URL do frontend em produção

### Frontend
- `NEXT_PUBLIC_API_URL` → URL do backend em produção
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`

---

## Como encontrar minhas credenciais do Clerk

1. Acesse https://dashboard.clerk.com
2. Selecione sua aplicação
3. Vá em **API Keys**
4. Copie `Publishable key` (frontenc) e `Secret key` (backend)
5. Para criar o webhook: **Webhooks → Add Endpoint** → URL: `https://sua-url/api/webhooks/clerk`

## Como encontrar as credenciais do Supabase PostgreSQL

1. Acesse https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Project Settings → Database**
4. Copie a **Connection string** do modo **Transaction pooler** (porta 6543)
