# 🏗️ Obra Fácil

> **Transformando a jornada de reforma e manutenção residencial em uma experiência simples, segura e integrada.**

![Status do Projeto](https://img.shields.io/badge/Status-Em%20Desenvolvimento-orange)
![CI](https://github.com/lexcesar/obra-facil/actions/workflows/ci.yml/badge.svg)
![Tech](https://img.shields.io/badge/Stack-Next.js%20%7C%20NestJS%20%7C%20PostgreSQL-green)

O **Obra Fácil** é um marketplace inovador que conecta proprietários de imóveis a profissionais autônomos da construção civil. Diferente de soluções genéricas, integramos a contratação do serviço com a cotação de materiais em lojas parceiras, resolvendo a fragmentação do mercado de reformas.

---

## 🎯 O Problema
Proprietários de residências sofrem com a falta de confiança em profissionais aleatórios, orçamentos opacos e a dificuldade de conciliar a mão de obra com a compra de materiais. O **Obra Fácil** centraliza essa jornada, garantindo segurança através de avaliações reais e agilidade via geolocalização.

## 👥 Persona Principal
**Carlos Alberto, 45 anos (Despachante)**
Um usuário que busca agilidade e segurança, mas possui pouco tempo para pesquisas presenciais e sente-se inseguro ao receber desconhecidos em casa sem referências sólidas.

---

## 🚀 Funcionalidades Principais
- 🔍 **Busca Inteligente:** Encontre Pedreiros, Eletricistas e Pintores por geolocalização.
- ⭐ **Portfólio & Avaliações:** Visualize fotos de trabalhos anteriores e notas de outros clientes.
- 📅 **Agendamento Integrado:** Reserve visitas técnicas diretamente pelo app.
- 🛒 **Módulo de Materiais:** Cote materiais necessários para o serviço em lojas próximas.
- 📄 **Orçamentos Transparentes:** Receba propostas claras de serviço e material em um só lugar.

---

## 📂 Documentação do Projeto
Para facilitar a navegação no repositório, consulte os documentos detalhados:

* [📄 PRD (Requisitos)](docs/01-produto/prd.md) - Visão geral e regras de negócio.
* [🛠️ Especificação Técnica](docs/02-arquitetura/spec_tech.md) - Arquitetura, Backend e Frontend.
* [🎨 Guia de UI/UX](docs/03-design-ux/spec_ui.md) - Fluxo de telas e identidade visual.
* [💡 Definição do Problema](docs/01-produto/definicao_problema.md) - Contexto e impacto no mercado.
* [stitch](https://stitch.withgoogle.com/projects/10387496590250121391) - Design do projeto

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia | Detalhes |
|---|---|---|
| **Frontend** | Next.js 15, React 19 | Layout responsivo (Tailwind CSS), ES2020+ |
| **Backend** | NestJS 11 | API RESTful protegida, TypeScript |
| **Banco de Dados** | PostgreSQL 17 | Persistência relacional protegida |
| **Autenticação** | Clerk | Autenticação externa & RBAC |
| **IA (NLP)** | Claude 3.5 Haiku | Geração inteligente de lista de materiais |
| **Observabilidade** | Pino / Winston | Logs estruturados, Correlação de RequestID |
| **Infraestrutura** | Docker / Terraform | Containers OCI, IaC (Vercel/Supabase) |

---

## 🧱 Requisitos Não Funcionais (RNFs)

O projeto foi concebido para atender a padrões rigorosos de engenharia de software, mapeados conforme os requisitos abaixo:

| ID | Requisito | Implementação Técnica |
|---|---|---|
| **RNF-01** | Acessibilidade e Portabilidade | Frontend Next.js com Tailwind CSS (Mobile-First) e compilação para ES2020+. |
| **RNF-02** | Segurança | Autenticação via **Clerk**, RBAC via Metadados, HTTPS forçado e DB encryption at-rest. |
| **RNF-03** | Interoperabilidade | Funcionalidades expostas via **API RESTful** documentada com Swagger/OpenAPI. |
| **RNF-04** | Observabilidade | Logs estruturados (Pino), Correlation IDs, Healthchecks e Auditoria em tempo real. |
| **RNF-05** | Manutenibilidade | Suíte completa: Jest (Unit/E2E Backend), Vitest e Playwright (Frontend). |
| **RNF-06** | Implantação e Portabilidade | Empacotamento **Docker (OCI)** e automação via **Terraform (IaC)** e GitHub Actions. |
| **RNF-07** | Persistência | Uso de **PostgreSQL 17** com transações ACID e esquemas tipados via Prisma. |
| **RNF-08** | Governança | Git (GitHub), Gestão de dependências (npm), Configuração via variáveis `.env`. |

---

## ⚡ Setup Local

> Guia completo: [docs/04-ambiente-e-processos/setup-local.md](docs/04-ambiente-e-processos/setup-local.md)

**Pré-requisitos**: Node.js 20+, Docker Desktop

```bash
# Clone o repositório
git clone https://github.com/lexcesar/obra-facil.git
cd obra-facil

# Instale as dependências
npm install

# Configure as variáveis de ambiente (valores padrão já funcionam)
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.local.example apps/frontend/.env.local

# Suba o ambiente completo (DB + Backend + Frontend)
npm run docker:up
```

Acesse:

| Serviço | URL local | URL produção |
|---|---|---|
| Frontend (Next.js) | http://localhost:3000 | https://app-devai-frontend.vercel.app |
| Backend API | http://localhost:3333/api | https://app-devai-backend.vercel.app/api |
| **Swagger (OpenAPI)** | http://localhost:3333/api/docs | https://app-devai-backend.vercel.app/api/docs |
| Health check | http://localhost:3333/api/health | https://app-devai-backend.vercel.app/api/health |

### 📖 Swagger / OpenAPI

O backend expõe toda a API em **Swagger UI** em `/api/docs` — útil pra explorar endpoints, ver schemas de request/response e testar chamadas diretamente pelo navegador.

Principais grupos de endpoints documentados:
- `professionals` — busca de profissionais, dashboard
- `orders` — pedidos de materiais (isolados por cliente)
- `works` — obras (iniciar, atualizar progresso, concluir)
- `visits` — visitas técnicas (agendar, cancelar, concluir)
- `material-lists` / `messages` / `conversations` — fluxo de cotação
- `ai` — geração de cotação por IA
- `health` — healthcheck
- `webhooks` — integração Clerk

---

### 🔑 Perfis de teste (modo bypass — ambiente LOCAL)

No ambiente local (`DISABLE_CLERK_AUTH=true`), o usuário logado é escolhido pela env `NEXT_PUBLIC_BYPASS_USER_CLERK_ID` no frontend ou pelo header `X-Dev-User-Id` no backend. Perfis disponíveis no seed:

| clerk_id | Nome | Role |
|---|---|---|
| `demo_client_001` (default) | Carlos Alberto | client |
| `demo_client_002` | Joana Mendes | client |
| `demo_professional_001` | Ricardo Silva | professional |
| `demo_professional_002` | José da Silva | professional |
| `demo_professional_003` | Ana Rodrigues | professional |

### 🧪 Credenciais de avaliação (ambiente de PRODUÇÃO)

Em produção o Clerk está ativo e não usa bypass. Para avaliação pela banca, o time cria duas contas reais seguindo o processo abaixo.

#### Como criar um usuário **cliente**
1. Abrir https://app-devai-frontend.vercel.app/sign-up
2. Cadastrar com email e senha (verificação por email do Clerk)
3. O backend faz JIT provisioning (ou o webhook do Clerk) e cria um profile com `role='client'` automaticamente
4. A conta já tem acesso a `/pedidos`, `/cotacao/ia`, `/busca`

#### Como criar um usuário **profissional**
1. Seguir os passos 1–3 acima (criar conta via sign-up)
2. Entrar em https://dashboard.clerk.com → **Users** → selecionar o usuário
3. Em **Public metadata**, definir:
   ```json
   { "role": "professional" }
   ```
4. Salvar. O webhook `user.updated` atualiza `profiles.role` no banco
5. Deslogar e logar novamente
6. A conta passa a ter acesso a `/profissional/dashboard` (com ações de iniciar/concluir obra e concluir/cancelar visitas)

> **Observação para o time**: as credenciais reais (email/senha) não ficam versionadas neste repositório — são entregues à banca via canal seguro (chat do Canvas, etc.).

---

## 📂 Estrutura do Projeto

```
obra-facil/
├── apps/
│   ├── frontend/          # Next.js 15 (App Router) + Dockerfile
│   └── backend/           # NestJS 11 + Dockerfile
├── packages/
│   └── shared/            # Types, schemas Zod, interfaces
├── infra/                 # Infraestrutura como Código (IaC)
│   └── terraform/         # Scripts Terraform (Provedor Vercel)
├── docker/
│   ├── 01-schema.sql      # Schema do banco de dados (Infra de Dados)
│   └── 02-seed.sql        # Dados de exemplo para testes
├── docs/
│   ├── 01-produto/        # PRD, personas, jornada, lean canvas
│   ├── 02-arquitetura/    # Arquitetura técnica e spec
│   ├── 03-design-ux/      # Design system, UI spec
│   ├── 04-ambiente-e-processos/  # Setup local, fluxo git, variáveis
│   └── 05-prompts-e-referencias/ # Prompts de IA e referências
├── scripts/
│   └── setup/             # Scripts de configuração e automação
└── .github/workflows/     # CI/CD (GitHub Actions)
```

### 📚 Documentação

| Documento | Descrição |
|---|---|
| [docs/04-ambiente-e-processos/setup-local.md](docs/04-ambiente-e-processos/setup-local.md) | Como rodar o projeto localmente |
| [docs/02-arquitetura/arquitetura.md](docs/02-arquitetura/arquitetura.md) | Arquitetura técnica detalhada |
| [docs/04-ambiente-e-processos/variaveis-ambiente.md](docs/04-ambiente-e-processos/variaveis-ambiente.md) | Todas as variáveis de ambiente |
| [docs/04-ambiente-e-processos/fluxo-git.md](docs/04-ambiente-e-processos/fluxo-git.md) | Convenções de branches e commits |
| [docs/01-produto/prd.md](docs/01-produto/prd.md) | Product Requirements Document |
| [docs/02-arquitetura/spec_tech.md](docs/02-arquitetura/spec_tech.md) | Especificação técnica |

---

## 👥 Equipe
Projeto desenvolvido como parte do trabalho final de Práticas de Implementação e Evolução de Software:
- Alexander Cesar Luiz Costa
- Anderson Arruda
- Jackson Jovino Miranda
- Marcelo Granzoto
- Renan Carlos Silva Braz Tafner

---
<p align="center">
Desenvolvido com foco na experiência do usuário e na eficiência na construção civil. 🛠️
</p>
