# Especificação Técnica

## Visão Geral Técnica
Este documento estabelece a base tecnológica, decisões arquiteturais e padrões de integração para a plataforma de marketplace de serviços e produtos Obra Fácil. O público-alvo principal inclui engenheiros de software, arquitetos de solução, product managers e stakeholders responsáveis pela viabilização e implantação do sistema.

---

## Arquitetura de Referência
- **Estilo Arquitetural:** Microsserviços para facilitar a escalabilidade dos domínios isolados (Usuários, Matchmaking, Catálogo de Lojas, Chat). No início do projeto, recomenda-se iniciar com um Monolito Modular fortemente baseado em Clean Architecture e Domain-Driven Design (DDD).
- **Componentes Principais:** 
  - API Core (Gestão de usuários e Matchmaking)
  - API de Pagamentos/Checkout Integrado
  - Serviço de Mensagens em Tempo Real (Chat/Notificações)
  - Integração de Catálogo e Cotações das Lojas
- **Serviço de Observabilidade:** Abordagem abrangente combinando trace distribuído, agregação de logs centralizada padrão de métricas de negócio (APM) contendo tempos de resposta de cotação das lojas.
- **Autenticação e Autorização:** JWT (JSON Web Tokens) as-a-service garantindo facilidade num acesso unificado e seguro.
- **Protocolos de Comunicação:** API REST para acesso síncrono geral, WebSockets para a comunicação reativa do Chat Profissionais-Clientes (RFN-02).
- **Infraestrutura de Deployment:** Componentes provisionados em nuvem usando serviços gerenciados em containers.

---

## Stack Tecnológica

### Frontend
- **Linguagem**: TypeScript
- **Framework web**: Next.js para painel administrativo e backoffice de lojistas (Web) e Flutter ou React Native para o aplicativo mobile B2C (Cliente Final) e B2B (Profissional).
- **Estilização**: Tailwind CSS no ambiente Web / Componentização de Design System nativo no mobile (ex: Material 3).

### Backend
- **Linguagem**: TypeScript ou Go (conforme especialidade do time), priorizadas pelo balanceamento entre escalabilidade e ecossistema robusto.
- **Runtime**: Node.js (se TS).
- **Framework**: Fastify/Express ou NestJS (visando estrutura MVC/Modular).
- **Persistência**: Bancos de dados relacionais e em memória.
- **Acesso ao banco**: `pg` (node-postgres) diretamente via `DatabaseService` — sem ORM. Queries SQL parametrizadas (`$1, $2, ...`) para evitar SQL injection.

### Stack de Desenvolvimento
- **IDE**: VS Code ou Cursor com extensões de linters (ESLint, Prettier).
- **Gerenciamento de pacotes**: npm ou pnpm.
- **Ambiente de desenvolvimento local**: Containers via Docker e Docker Compose, réplica de banco local para desenvolvimento isolado.
- **Infraestrutura como Código (IaC)**: Terraform ou AWS CloudFormation/CDK.
- **Pipeline CI/CD**: Actions de repositório com validações automáticas de build, unit testing e submissão automatizada de deployments *blue-green*.

### Integrações
- **Persistência**: PostgreSQL via nuvem gerenciada (RDS ou similar) + Redis para sessões e mensagens pré-persistidas de chat.
- **Deployment**: Vercel (frontend via Next.js preset; backend via função serverless em `api/index.ts`).
- **Segurança (autenticação e autorização)**: Clerk — Bearer token validado no backend via `ClerkAuthGuard`.
- **Observabilidade**: Datadog ou Sentry (Logging & APM).
- **Gateway de Pagamento**: Stripe Connect ou Pagar.me para gerenciar multitenancy, split de pagamento do material e comissão do profissional numa única cobrança de cartão.

---

## Segurança

### Autenticação e Gestão de Sessão
- Autenticação via provedor externo com multi-factor opcional para profissionais. Tokens gerados com expirações muito curtas e validação por rotatividade do Refresh Token em HTTP-Only Cookies (no lado web).

### Controle de Acesso e Autorização
- RBAC baseado em *Claims*: Controle rígido que permite apenas à ROLE "Lojista" ver e interagir em domínios de catálogo de produtos, e ROLE "Profissional" na geração de listas de material.
- Isolamento contextual total das rotas via Policy Rulesetes nas *middlewares* da API.

### Segurança de Dados e Validação
#### Criptografia e Proteção de Dados
- Criptografia em repouso nos bancos gerenciados. PII (Personally Identifable Information) cifradas no nível da aplicação utilizando libs crypto, garantindo conformidade com LGPD.
- Validação agressiva de entradas de usuário (ex. Zod / Joi) impedindo injeções SQL e XSS.

### Segurança da Infraestrutura e Configuração
- Bancos de recursos providos em VPC fechada. As APIs operam atrás de um WAF (Web Application Firewall) com Rate Limiting e detecção de anomalias (DDoS proxy protection, como Cloudflare).

### Segurança no Desenvolvimento e Operação (DevSecOps)
- Análise de segurança estática no código (SAST) inserida na build CI, bloqueando merge requests com dependências de CVSS alto ou strings vazadas em repositório (ex.: gitleaks, Dependabot).

---

## APIs
- **Endpoint principal:** `api.obrafacil.com.br`
- **Versionamento:** Versionamento via URI (ex: `/v1/`, `/v2/`) e/ou Accept Headers para evitar instabilidade a longo prazo entre mobile/backend.
- **Padrão de nomenclatura:** REST convencional pragmático (`/v1/work-orders/:id/materials`). Retorno padronizado em JSON com envelope para metadados e código HTTP refletindo status corretos da RFC (200, 201, 400, 401, 403, 404, 422, 500).
- **Autenticação:** Baseada em Bearer Token no cabeçalho (*Authorization*).
- **Endpoints públicos:** Inicializações, webhooks de pagamentos e login.
- **Endpoints protegidos:** Toda jornada transacional, manipulação de carrinhos, perfis e chat.

---

## Tenancy
- **Estratégia:** Multi-tenant usando "Row-Level Isolation" por um identificador universal como `tenant_id` ou `store_id` (para lojistas). A base compartilha os mesmos esquemas de tabelas.
- **Isolamento:** As queries precisam estritamente envolverem repositórios restritos pelo contexto logado nos middlewares de API para que um "Lojista A" não emita cotações para a "Loja B".
- **Identificação:** Pelo token decodificado do requisitante.
- **Migrações:** Execução de migrações em via de etapa única para todo o single database centralizado.
- **Segurança:** Políticas Row Level Security implementadas a nível de banco de dados se aplicável (ex. RLS no PostgreSQL), bloqueando reads acidentais de outros tenants. 

---

## Diretrizes para Desenvolvimento Assistido por IA
- Baseie sempre no escopo de Single Responsibility e Inversion of Control definidos na Clean Architecture.
- Nunca gere código com misturas de lógicas de "Business" acopladas a frameworks http como "Express" e "Next". Use interfaces para definir contratos de entrada e saída nos UseCases.
- Ao sugerir implementações de ORM, seja resiliente e aponte para possíveis transações concorrentes na "Cotação Automática da Lista de Materiais".
