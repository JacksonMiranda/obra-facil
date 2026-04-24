# Auditoria de Acesso e Proposta de Refatoração — Obra Fácil

> **Status:** Fase 1 implementada (IDORs corrigidos). Fases 2–5 pendentes de implementação.  
> **Data da auditoria:** Abril/2026

---

## 1. Como o sistema funciona hoje (AS-IS)

### 1.1 Autenticação

| Camada | Mecanismo |
|---|---|
| Backend | Clerk Bearer Token via `ClerkAuthGuard` (`apps/backend/src/core/guards/clerk-auth.guard.ts`) |
| Propagação | Guard anexa `Profile` completo em `request.profile`; decorator `@CurrentUser()` expõe ao controller |
| JIT provisioning | Se o `clerk_id` não existir em `profiles`, o guard cria a linha com `role='client'` automaticamente |
| Bypass local | `DISABLE_CLERK_AUTH=true` + header `x-dev-user-id`; fallback cai no **primeiro cliente do banco** se o header estiver ausente. Bloqueado em `NODE_ENV=production`. |
| Frontend | `middleware.ts` protege todo grupo `(app)/`; `lib/api/client.ts` injeta o Bearer Token em cada request |

### 1.2 Modelagem de identidade

```
profiles          (id uuid, clerk_id text UNIQUE, role enum, full_name, ...)
professionals     (id uuid, profile_id → profiles.id, specialty, bio, ...)
stores            (id uuid, profile_id → profiles.id, ...)
```

- Uma conta (`profiles`) possui **um único papel** (`role = 'client' | 'professional' | 'store'`).
- O papel profissional é materializado como extensão 1:1 em `professionals`.
- **Não existe mecanismo para uma mesma conta operar em dois papéis** — o sistema força a criação de contas distintas.

### 1.3 Tabelas de domínio (owner → executor)

| Tabela | Owner (cliente) | Executor |
|---|---|---|
| `visits` | `client_id → profiles.id` | `professional_id → professionals.id` |
| `works` | `client_id → profiles.id` | `professional_id → professionals.id` |
| `orders` | `client_id → profiles.id` | `store_id → stores.id` |
| `material_lists` | indireto via `conversations.client_id` | `professional_id → professionals.id` |
| `conversations` | `client_id → profiles.id` | `professional_id → professionals.id` |

### 1.4 Estado de autorização por endpoint (pré-correção)

| Endpoint | Método | Estado | Observação |
|---|---|---|---|
| `/v1/visits` | GET | ✅ OK | Filtra por `profile.id` (client ou profissional) |
| `/v1/visits/:id` | GET | 🔴 **IDOR** (corrigido) | `service.findById(id)` sem verificar ownership |
| `/v1/visits` | POST | ✅ OK | Exige `role='client'` |
| `/v1/visits/:id/cancel` | PATCH | ✅ OK | Service valida participante |
| `/v1/visits/:id/complete` | PATCH | ✅ OK | Exige `role='professional'` |
| `/v1/works` | GET | ✅ OK | Filtra por papel |
| `/v1/works/:id` | GET | 🔴 **IDOR** (corrigido) | `repo.findById(id)` puro |
| `/v1/works/:id/start\|progress\|complete` | PATCH | ✅ OK | `assertIsWorksProfessional` |
| `/v1/material-lists` | GET | ✅ OK | Filtra por `professional_id` |
| `/v1/material-lists/:id` | GET | 🔴 **IDOR** (corrigido) | `_profile` ignorado |
| `/v1/material-lists/:id/offers` | GET | 🔴 **IDOR** (corrigido) | Sem `profile` sequer |
| `/v1/conversations/:id` | GET | ✅ OK | Valida participante |
| `/v1/professionals` | GET | 🟡 Catálogo público autenticado | Por design |
| `/v1/professionals/me/dashboard` | GET | ✅ OK | Valida `role` |

### 1.5 Problemas identificados

| # | Tipo | Gravidade | Descrição |
|---|---|---|---|
| P1 | IDOR / BOLA | 🔴 Crítico | `GET /v1/visits/:id`, `GET /v1/works/:id`, `GET /v1/material-lists/:id`, `GET /v1/material-lists/:id/offers` — qualquer usuário autenticado consegue ler dados de outro com o UUID |
| P2 | Modelo de negócio | 🟠 Alto | Uma conta = um único papel; impossível ser cliente e profissional na mesma conta |
| P3 | PII exposta | 🟡 Médio | Política `profiles_read_all = TRUE` expõe dados pessoais de todos os usuários |
| P4 | Defense-in-depth ausente | 🟡 Médio | RLS implementado em migrações Supabase, mas backend conecta como owner e bypassa |
| P5 | Bypass inseguro | 🟡 Médio | Fallback do `DISABLE_CLERK_AUTH` cai no primeiro cliente do banco |
| P6 | Autorização espalhada | 🟢 Baixo | `if (role !== 'x')` em controllers, sem camada centralizada de policy |

---

## 2. Arquitetura-alvo (TO-BE)

### 2.1 Modelo de identidade multi-papel

Inspirado em marketplaces (Uber, iFood, GetNinjas): **uma conta, múltiplos papéis**.

```
profiles          (id, clerk_id, full_name, avatar_url, primary_role, ...)
account_roles     (id, profile_id → profiles.id, role, is_active, is_primary, activated_at)
professionals     (id, profile_id → profiles.id, ...)  ← ativado sob demanda
stores            (id, profile_id → profiles.id, ...)  ← ativado sob demanda
```

- `profiles.primary_role` substitui `profiles.role` (renomeado, legado mantido).
- `account_roles` normaliza os papéis ativos: `UNIQUE(profile_id, role)`.
- Um mesmo usuário pode ter `[{role: 'client', is_active: true}, {role: 'professional', is_active: true}]`.

### 2.2 Contexto de operação (`actingAs`)

- Frontend envia header `X-Acting-As: client | professional | store` em cada request.
- Cookie `obrafacil_acting_as` (SameSite=Lax, Secure) persiste a escolha no browser.
- Guard valida: `actingAs ∈ accountRoles WHERE is_active = true`. Se inválido → 403.
- `@CurrentAccount()` devolve `{ profile, roles: Role[], actingAs: Role }`.

### 2.3 Fluxo de ativação do papel profissional

```
POST /v1/account/roles/professional/activate
Body: { specialty, bio, city }
→ Cria registro em account_roles {role: 'professional', is_active: true}
→ Cria registro em professionals se não existir
→ Retorna {roles: ['client', 'professional']}
```

### 2.4 Camada de autorização centralizada (Fase 2)

```
src/core/authorization/
  ownership.service.ts     → canReadVisit(account, id), canReadWork(account, id), ...
  ownership.guard.ts       → Guard que lê :id, chama método correto, retorna 404 se falhar
  require-ownership.decorator.ts → @RequireOwnership('visit' | 'work' | 'materialList' | ...)
```

Controller com a nova camada:
```typescript
@Get(':id')
@RequireOwnership('visit')
findOne(@CurrentAccount() account: Account, @Param('id') id: string) {
  return this.service.findById(id);
}
```

### 2.5 Matriz de permissões

| Recurso / Ação | Cliente (`actingAs=client`) | Profissional (`actingAs=professional`) | Admin |
|---|---|---|---|
| Listar visitas | ✅ apenas as suas | ✅ apenas as suas | ✅ todas |
| Ler visita específica | ✅ se é `client_id` | ✅ se é profissional | ✅ |
| Agendar visita | ✅ | 🚫 | ✅ |
| Cancelar visita | ✅ se é `client_id` | ✅ se é profissional | ✅ |
| Listar obras | ✅ apenas as suas | ✅ apenas as suas | ✅ |
| Iniciar/progredir obra | 🚫 | ✅ se é profissional dono | ✅ |
| Criar lista de materiais | 🚫 | ✅ | ✅ |
| Ler lista de materiais | ✅ se é cliente da conversa | ✅ se é profissional dono | ✅ |
| Catálogo de profissionais | ✅ | ✅ | ✅ |
| Dashboard profissional | 🚫 | ✅ | ✅ |
| Ativar papel profissional | ✅ em si | n/a | ✅ em qualquer |

### 2.6 Filtros obrigatórios no backend (invariantes)

1. **Toda query de recurso privado** deve ter `WHERE owner_id = $profileId` OU passar por `OwnershipGuard`.
2. **Repositórios privados** não expõem `findById(id)` sem contexto de account — apenas `findByIdForAccount(id, accountCtx)`.
3. **ADR:** "O backend nunca confia em filtros do frontend."
4. **Defense-in-depth:** RLS Postgres reativado (Fase 4) como camada secundária.

---

## 3. DDL da migração (resumida)

```sql
-- Renomear role → primary_role (retrocompat)
ALTER TABLE profiles RENAME COLUMN role TO primary_role;

-- Novo enum (se necessário) ou reutilizar user_role
CREATE TYPE account_role AS ENUM ('client', 'professional', 'store', 'admin');

-- Tabela de papéis por conta
CREATE TABLE account_roles (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id   uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role         account_role NOT NULL,
  is_active    boolean NOT NULL DEFAULT true,
  is_primary   boolean NOT NULL DEFAULT false,
  activated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, role)
);
CREATE INDEX idx_account_roles_profile ON account_roles(profile_id);

-- Backfill: popular a partir do primary_role existente
INSERT INTO account_roles (profile_id, role, is_primary)
SELECT id, primary_role::account_role, true FROM profiles;

-- View de perfis públicos (reduz PII exposta)
CREATE VIEW v_public_profiles AS
  SELECT id, full_name, avatar_url, city FROM profiles;
```

---

## 4. Plano de implementação por fases

### Fase 0 — Documentação ✅
- [x] Criar `docs/02-arquitetura/auditoria-acesso-e-refatoracao.md` (este arquivo)

### Fase 1 — Correções críticas de IDOR ✅
- [x] `GET /v1/visits/:id` — verifica `client_id` ou `professionals.profile_id` contra `profile.id`
- [x] `GET /v1/works/:id` — verifica `client_id` ou `professionals.profiles.id` contra `profile.id`
- [x] `GET /v1/material-lists/:id` — verifica `professional_id` contra `profile.id`
- [x] `GET /v1/material-lists/:id/offers` — valida ownership antes de retornar ofertas
- [x] Specs atualizados com casos negativos (acesso de estranho → 404)
- [x] 108 testes passando, lint limpo

### Fase 2 — Policy layer reutilizável
- [ ] `src/core/authorization/ownership.service.ts`
- [ ] `src/core/authorization/ownership.guard.ts`
- [ ] `@RequireOwnership(...)` decorator
- [ ] Substituir checks manuais nos controllers
- [ ] Testes unitários do `OwnershipService`

### Fase 3 — Multi-perfil na mesma conta
- [ ] Migração `account_roles` + backfill
- [ ] `ClerkAuthGuard` evolui para ler `X-Acting-As` e popular `account`
- [ ] `@CurrentAccount()` substitui `@CurrentUser()` com shim de retrocompat
- [ ] Endpoints trocam `role === 'x'` por `actingAs === 'x'`
- [ ] `POST /v1/account/roles/professional/activate`
- [ ] Frontend: componente `RoleSwitcher`, cookie `obrafacil_acting_as`, injeção do header
- [ ] `/solicitacoes` renderiza visão sensível a `actingAs`
- [ ] Onboarding `/onboarding/ativar-profissional`

### Fase 4 — Defense-in-depth (RLS)
- [ ] Migração Supabase com funções `current_acting_role()`
- [ ] View `v_public_profiles` + restringir `profiles` a self-read

### Fase 5 — Higienização e guardrails
- [ ] Auditoria final: todos os controllers privados têm ownership check
- [ ] ADR documentando invariante de filtro por owner
- [ ] Lint rule customizada bloqueando `findAll` sem parâmetro em repos privados

---

## 5. Checklist técnico

- [x] `GET /:id` privado retorna 404 (não 403) para recursos de outros usuários
- [x] Specs cobrem acesso de usuário não-autorizado
- [ ] Toda rota privada `GET /:id` usa `@RequireOwnership(...)` (Fase 2)
- [ ] Repositórios privados têm variante `forAccount`
- [ ] Nenhum controller chama `service.findById(id)` sem ownership (Fase 2)
- [ ] `X-Acting-As` validado em endpoints sensíveis ao contexto (Fase 3)
- [ ] `account_roles` com `UNIQUE(profile_id, role)` + índice (Fase 3)
- [ ] Frontend envia `X-Acting-As` consistentemente (Fase 3)
- [ ] `RoleSwitcher` só aparece com ≥2 roles ativas (Fase 3)
- [ ] `DISABLE_CLERK_AUTH` rejeitado em produção (já implementado)

---

## 6. Critérios de aceite (Fase 3 concluída)

1. UUID de visita de outro usuário → `GET /v1/visits/:id` retorna 404.
2. Mesmo para works, material-lists, offers, orders.
3. Usuário ativa papel profissional → consegue alternar contexto sem logout.
4. `X-Acting-As=professional` sem role ativa → 403.
5. Cliente sem papel profissional → não vê `RoleSwitcher`, não acessa `/profissional/dashboard`.
6. Catálogo `/v1/professionals` continua funcionando publicamente.
7. Usuários existentes não perdem acesso após migração (backfill preserva `primary_role`).
8. Build e lint verdes em backend e frontend.

---

## 7. Riscos e impactos

| Risco | Impacto | Mitigação |
|---|---|---|
| Backfill de `account_roles` inconsistente | Usuário perde acesso | Migração idempotente + `COUNT(*)` antes/depois |
| Frontend esquece `X-Acting-As` | Resposta inconsistente | Default no `api-client`; backend cai em `primary_role` |
| Tipo `Profile.role` quebra consumidores ao renomear | Build vermelho | Publicar tipos aditivos; `role` vira derived de `primary_role` |
| Reativar RLS derruba queries do backend | Downtime | RLS atrás de feature flag; backend mantém bypass durante transição |
| IDOR nos endpoints restantes (`/v1/orders/:id`, `/v1/conversations/:id`) | Vazamento | Já auditados — `orders` exige filtro, `conversations` valida participante |
