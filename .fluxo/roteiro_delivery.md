# Roteiro de Delivery

## Pré-requisitos

- Node.js instalado localmente.
- Git instalado localmente.
- Docker e Docker Compose instalados localmente.
- Conta GitHub.
- Conta Vercel.
- Conta Supabase.
- Conta Clerk.

## 2.1 Desenvolvimento

**Visão geral**

Resultados:
- Scaffold
- Incremento de Produto

Participantes:
- Designer UX
- Desenvolvedor

---

### 2.1.1 Estrutura do projeto

- Criar monorepo com `apps/frontend` e `apps/backend`.
- Garantir separação clara entre frontend e backend.
- Comunicação via API REST.

### 2.1.2 Criação do projeto

- Scaffold inicial com estrutura modular.
- Dockerfiles para frontend e backend.
- Docker Compose com serviços: db, backend, frontend.

---

## 2.2 Testes

- Navegar pela aplicação para verificar as páginas criadas.
- Corrigir erros encontrados.

---

## 2.3 Liberação

- Commit e push para o repositório remoto.

### 2.3.1 Criação dos projetos no Vercel

- Criar projeto backend e frontend no Vercel.

### 2.3.2 Configuração do pipeline CI/CD

- Criar workflow GitHub Actions (`.github/workflows/deploy.yml`).
- Trigger: push na branch `main`.
- Etapas: lint, test, build, deploy Vercel.
- Secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.

### 2.3.3 Configuração de segurança com Clerk

- Configurar autenticação e autorização com Clerk.
- Lógica de autenticação tratada no backend.
- Frontend consome serviços do backend.
- Sincronização de dados do usuário com banco de dados local.
