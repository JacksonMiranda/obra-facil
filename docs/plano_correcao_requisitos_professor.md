# Plano de Correção — Conformidade com Roteiro do Professor

> **Gerado em:** 27 de abril de 2026  
> **Base:** [`docs/auditoria_requisitos_professor.md`](auditoria_requisitos_professor.md)  
> **Aderência atual:** ~82% → com P0+P1 concluídos: ~95%

---

## P0 — Obrigatório antes da entrega

> Itens que podem reprovar ou comprometer significativamente a avaliação.

---

### P0-01 — Pasta `.fluxo/` ausente no repositório ✅ CORRIGIDO

| Campo | Valor |
|---|---|
| **Status** | ✅ Corrigido nesta auditoria |
| **Problema** | O roteiro do professor referencia documentos em `.fluxo/fluxo_geral.md`, `.fluxo/roteiro_discovery.md` e `.fluxo/roteiro_delivery.md`. Esses arquivos não existiam no repositório, o que impediria o professor de verificar a rastreabilidade do processo. |
| **Impacto** | Alto — o professor poderia entender que o processo de Discovery e Delivery não foi seguido |
| **Arquivos envolvidos** | `.fluxo/fluxo_geral.md`, `.fluxo/roteiro_discovery.md`, `.fluxo/roteiro_delivery.md` |
| **Correção aplicada** | Pasta `.fluxo/` criada na raiz com os 3 arquivos de roteiro |
| **Risco residual** | Baixo — os arquivos agora existem no repositório |
| **Critério de aceite** | `ls .fluxo/` retorna os 3 arquivos; commit visível no histórico Git |

---

## P1 — Importante (impacta nota)

> Itens que reduzem a nota por ausência de artefato ou divergência técnica.

---

### P1-01 — `spec_req.md` não existe como arquivo standalone

| Campo | Valor |
|---|---|
| **Status** | ❌ Pendente |
| **Problema** | O roteiro de Discovery (seção 1.2) exige um arquivo `spec_req.md` separado do PRD. O conteúdo existe dentro de `docs/01-produto/prd.md` nas seções de requisitos funcionais (RFN-01 a RFN-04) e não funcionais (RNF-01 a RNF-03), mas o arquivo dedicado está ausente. |
| **Impacto** | Médio — o professor pode marcar como "ausente" em checklist |
| **Arquivos envolvidos** | `docs/01-produto/prd.md` (fonte), `docs/spec_req.md` (a criar) |
| **Como corrigir** | Criar `docs/spec_req.md` extraindo e expandindo as seções RFN e RNF do PRD, adicionando critérios de aceite mais completos para as funcionalidades implementadas (agendamento, avaliação, dashboard profissional, notificações) que não constavam no PRD original |
| **Risco** | Baixo — não impacta código |
| **Estimativa** | 30-60 min |
| **Critério de aceite** | Arquivo `docs/spec_req.md` com pelo menos 10 requisitos funcionais e 5 não funcionais, cada um com ID, descrição e critério de aceite |

**Estrutura sugerida para `docs/spec_req.md`:**
```markdown
# Especificação de Requisitos — Obra Fácil

## Requisitos Funcionais

### RF-01 — Autenticação e cadastro
### RF-02 — Sincronização de perfil
### RF-03 — Busca de profissionais
### RF-04 — Perfil do profissional
### RF-05 — Agendamento de visita técnica
### RF-06 — Gestão de visitas pelo profissional
### RF-07 — Conclusão de obra
### RF-08 — Avaliação do profissional
### RF-09 — Chat entre cliente e profissional
### RF-10 — Notificações
### RF-11 — Dashboard do profissional
### RF-12 — Cotação de materiais (parcial — v2)

## Requisitos Não Funcionais

### RNF-01 — Desempenho
### RNF-02 — Segurança (autenticação, RBAC, RLS)
### RNF-03 — Isolamento de dados por usuário
### RNF-04 — Manutenibilidade (monorepo, TypeScript, Zod)
### RNF-05 — Testabilidade (Jest, Vitest, Playwright)
### RNF-06 — Deployabilidade (Docker, Vercel, CI/CD)
### RNF-07 — Acessibilidade (mobile-first, contraste)
```

---

### P1-02 — `docs/testes.md` não existe

| Campo | Valor |
|---|---|
| **Status** | ❌ Pendente |
| **Problema** | O roteiro de Delivery exige evidências de testes. Existem ~68 testes automatizados rodando no CI, mas não há documento consolidado descrevendo o plano de testes, os tipos de teste, os fluxos cobertos e evidências de execução. |
| **Impacto** | Médio — professor pode não saber que os testes existem sem esse documento |
| **Arquivos envolvidos** | `docs/testes.md` (a criar), arquivos spec referenciados |
| **Como corrigir** | Criar `docs/testes.md` documentando a estratégia de testes, tipos, localização dos arquivos, como rodar e evidência do CI passando |
| **Risco** | Baixo — não impacta código |
| **Estimativa** | 30 min |
| **Critério de aceite** | Arquivo `docs/testes.md` listando: tipos de teste, comando para executar cada tipo, localização dos arquivos de teste, link para o CI com badge de status |

**Conteúdo mínimo sugerido:**
```markdown
# Estratégia de Testes — Obra Fácil

## Tipos de Teste

### Unitários — Backend (Jest)
- Localização: `apps/backend/src/**/*.spec.ts`
- Comando: `npm test --workspace=backend`
- Cobertura: módulos professionals, visits, works, reviews, guard de autenticação

### Unitários — Frontend (Vitest)
- Localização: `apps/frontend/src/**/*.test.tsx`
- Comando: `npm run test --workspace=frontend`
- Cobertura: componentes de UI, hooks

### Integração — Backend (Jest/Supertest)
- Localização: `apps/backend/test/*.e2e-spec.ts`
- Comando: `npm run test:e2e --workspace=backend`
- Cobertura: isolamento de usuário, pedidos, fluxo de autenticação

### E2E — Frontend (Playwright)
- Localização: `apps/frontend/tests-e2e/`
- Comando: `npx playwright test`
- Cobertura: fluxo do cliente, fluxo do profissional, busca pública

## Evidência de CI
Badge no README: ![CI](https://github.com/lexcesar/obra-facil/actions/workflows/ci.yml/badge.svg)
```

---

### P1-03 — `docs/modelo_dados.md` não existe

| Campo | Valor |
|---|---|
| **Status** | ❌ Pendente |
| **Problema** | O roteiro de Design exige modelo de dados documentado. O DDL completo existe em `docker/01-schema.sql`, mas não há documento dedicado em `docs/` com diagrama e descrição das tabelas e relacionamentos. |
| **Impacto** | Médio — professor pode não localizar o modelo de dados |
| **Arquivos envolvidos** | `docker/01-schema.sql` (fonte), `docs/modelo_dados.md` (a criar) |
| **Como corrigir** | Criar `docs/modelo_dados.md` com diagrama ER (Mermaid) e tabela descritiva das entidades principais |
| **Risco** | Baixo |
| **Estimativa** | 45 min |
| **Critério de aceite** | Arquivo com diagrama ER (pode ser Mermaid ou ASCII) e tabela listando entidades, atributos chave e relacionamentos |

---

### P1-04 — Deploy automático desativado no `deploy.yml`

| Campo | Valor |
|---|---|
| **Status** | ⚠️ Decisão deliberada não documentada |
| **Problema** | O roteiro 2.3.2 exige que o workflow seja acionado em `push` na branch `main`. O `deploy.yml` atual tem o trigger `push` comentado — apenas `workflow_dispatch` está ativo. |
| **Impacto** | Médio — professor pode interpretar como pipeline não funcional |
| **Arquivos envolvidos** | `.github/workflows/deploy.yml` |
| **Como corrigir** | **Opção A (recomendada):** Descomentar o trigger `push` na `main` para habilitar deploy automático. **Opção B:** Adicionar comentário no arquivo explicando a decisão de deploy manual e mencionar no README. |
| **Risco** | Opção A pode causar deploys indesejados durante desenvolvimento ativo; Opção B não fecha o requisito formalmente |
| **Estimativa** | 5 min |
| **Critério de aceite** | Opção A: Push na `main` dispara deploy automaticamente. Opção B: Comentário explicativo presente no arquivo. |

**Modificação mínima para Opção A:**
```yaml
on:
  push:
    branches:
      - main
  workflow_dispatch:
```

---

### P1-05 — `spec_tech.md` cita tecnologias incorretas

| Campo | Valor |
|---|---|
| **Status** | ⚠️ Pendente |
| **Problema** | O `spec_tech.md` menciona: Prisma como ORM (projeto usa `pg` direto), Firebase/Supabase Auth (projeto usa Clerk), AWS/GCP (projeto usa Vercel). Isso cria inconsistência entre documentação e implementação real. |
| **Impacto** | Baixo-médio — pode gerar questionamentos sobre coerência técnica |
| **Arquivos envolvidos** | `docs/02-arquitetura/spec_tech.md` |
| **Como corrigir** | Atualizar as seções **Backend → ORM**, **Integrações → Segurança** e **Integrações → Deployment** para refletir as escolhas reais: `pg` (node-postgres), Clerk, Vercel |
| **Risco** | Baixo |
| **Estimativa** | 15 min |
| **Critério de aceite** | `spec_tech.md` sem menção a Prisma, Firebase Auth ou AWS/GCP sem contexto de "alternativas não adotadas" |

**Linhas a atualizar em `spec_tech.md`:**
- `Backend → ORM`: `pg` (node-postgres) — sem ORM; queries SQL parametrizadas diretas
- `Integrações → Segurança`: Clerk (autenticação e autorização por JWT)
- `Integrações → Deployment`: Vercel (frontend serverless + backend serverless via `api/index.ts`)

---

## P2 — Melhorias desejáveis

> Itens que melhoram a apresentação mas não são bloqueantes.

---

### P2-01 — Protótipos sem evidência visual versionada

| Campo | Valor |
|---|---|
| **Status** | ⚠️ Pendente |
| **Problema** | O roteiro de Design menciona o Google Stitch para criação de protótipos. Não há imagens de wireframes/mockups versionadas no repositório. |
| **Impacto** | Baixo — UI implementada em código substitui os protótipos |
| **Como corrigir** | Tirar screenshots das telas principais (Home, Busca, Perfil Profissional, Agendamento, Dashboard) e salvar em `docs/03-design-ux/screenshots/` |
| **Estimativa** | 30 min |
| **Critério de aceite** | Pelo menos 5 screenshots das telas principais em `docs/03-design-ux/screenshots/` |

---

### P2-02 — `.env.example` consolidado na raiz

| Campo | Valor |
|---|---|
| **Status** | ⚠️ Pendente |
| **Problema** | Existem `.env.example` separados em `apps/backend/` e `apps/frontend/`. O roteiro orienta um único `.env` na raiz do monorepo. |
| **Impacto** | Baixo — setup local documentado em `docs/04-ambiente-e-processos/` |
| **Como corrigir** | Criar `.env.example` na raiz consolidando todas as variáveis dos dois apps |
| **Estimativa** | 10 min |
| **Critério de aceite** | `.env.example` na raiz listando todas as variáveis com comentários agrupados por serviço |

---

### P2-03 — `docs/api.md` listando endpoints

| Campo | Valor |
|---|---|
| **Status** | ⚠️ Pendente |
| **Problema** | Não há documento `docs/api.md`. A API é documentada via Swagger em runtime (`/api/docs`), mas não versionada em Markdown no repositório. |
| **Impacto** | Baixo — Swagger em runtime serve o mesmo propósito |
| **Como corrigir** | Criar `docs/api.md` listando os endpoints principais por módulo com método, path, descrição e autenticação necessária |
| **Estimativa** | 45 min |
| **Critério de aceite** | `docs/api.md` com pelo menos 20 endpoints documentados agrupados por módulo |

---

### P2-04 — RNFs no PRD desatualizados (apenas 3)

| Campo | Valor |
|---|---|
| **Status** | ⚠️ Pendente |
| **Problema** | O `prd.md` lista apenas 3 RNFs (Desempenho, Manutenibilidade, Acessibilidade). A implementação real satisfaz muito mais RNFs: segurança com RLS, isolamento de dados, testabilidade, deployabilidade, monorepo modular. |
| **Impacto** | Baixo — não compromete, mas subestima o projeto |
| **Como corrigir** | Expandir seção RNF no PRD **ou** criar `spec_req.md` (P1-01) com seção RNF completa |
| **Estimativa** | 20 min |
| **Critério de aceite** | Pelo menos 6 RNFs documentados, cobrindo segurança, isolamento e testabilidade |

---

## Resumo de Priorização

| ID | Título | Prioridade | Status | Esforço |
|---|---|---|---|---|
| P0-01 | Pasta `.fluxo/` no repositório | P0 | ✅ Corrigido | — |
| P1-01 | Criar `docs/spec_req.md` | P1 | ❌ Pendente | 1h |
| P1-02 | Criar `docs/testes.md` | P1 | ❌ Pendente | 30min |
| P1-03 | Criar `docs/modelo_dados.md` | P1 | ❌ Pendente | 45min |
| P1-04 | Habilitar deploy automático | P1 | ⚠️ Decisão | 5min |
| P1-05 | Atualizar stack em `spec_tech.md` | P1 | ⚠️ Pendente | 15min |
| P2-01 | Screenshots de telas | P2 | ⚠️ Pendente | 30min |
| P2-02 | `.env.example` na raiz | P2 | ⚠️ Pendente | 10min |
| P2-03 | Criar `docs/api.md` | P2 | ⚠️ Pendente | 45min |
| P2-04 | Expandir RNFs no PRD | P2 | ⚠️ Pendente | 20min |

**Esforço total estimado P0+P1: ~2h45min**  
**Esforço total estimado P0+P1+P2: ~5h**
