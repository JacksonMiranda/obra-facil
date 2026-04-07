# Diagrama de Componentes (Nível 3) - Frontend Web App

Este diagrama apresenta a arquitetura a nível de Componentes (Nível 3 do modelo C4) focada no "Frontend Web App". Ele destrincha a aplicação Next.js em sua estrutura de roteamento, componentes de interface, integrações com o backend e provedor de autenticação.

```mermaid
graph TD
    %% Interagentes Externos
    User["Usuário / Cliente<br/>(Navegador Web/Mobile)"]
    BackendAPI["Backend REST API<br/>(Servidor NestJS)"]
    ClerkAuth["Clerk API<br/>(Serviço de Identidade)"]
    
    %% Borda do Container Frontend
    subgraph FrontendContainer ["Frontend App (Next.js 15)"]
        
        %% Cross-Cutting e Infra
        Middleware["Middleware Router<br/>(Validação de Rotas via Clerk)"]
        ApiClient["API Client<br/>(lib/api - Interceptor Bearer)"]
        UIComponents["UI Components<br/>(TailwindCSS)"]
        
        %% Interfaces e Fluxos de Autenticação
        subgraph AuthPages ["Auth Routes (/sign-in, /sign-up)"]
            LoginUI["Login / Cadastro<br/>(Componentes do Clerk)"]
        end
        
        %% Componentes de Funcionalidades (App Router)
        subgraph AppRoutes ["Protected Routes (/app)"]
            ObrasPage["Obras UI<br/>(Gestão de Obras)"]
            PedidosPage["Pedidos UI<br/>(Gestão de Pedidos)"]
            ProfissionalPage["Profissional UI<br/>(Perfil e Busca)"]
            ChatPage["Chat / Mensagens UI<br/>(Comunicação)"]
            CotacaoPage["Cotação UI<br/>(Listas de Materiais)"]
        end
    end

    %% Fluxo de Acesso
    User -->|Acessa URL| Middleware
    
    %% Autenticação
    Middleware -.->|Requer Autenticação| ClerkAuth
    Middleware -->|Acesso Negado| AuthPages
    Middleware -->|Acesso Permitido| AppRoutes
    LoginUI -->|Callback Sucesso| AppRoutes
    
    %% Composição de Interface
    AppRoutes -.->|Consome componentes| UIComponents
    AuthPages -.->|Consome componentes| UIComponents
    
    %% Comunicação com API
    ObrasPage -->|Fetch (Client/Server)| ApiClient
    PedidosPage -->|Fetch (Client/Server)| ApiClient
    ProfissionalPage -->|Fetch (Client/Server)| ApiClient
    ChatPage -->|Fetch (Client/Server)| ApiClient
    CotacaoPage -->|Fetch (Client/Server)| ApiClient
    
    %% Cliente API falando com APIs externas
    ApiClient -->|Req HTTPS c/ Token (Tipagem @obrafacil/shared)| BackendAPI
    
```

## Detalhamento dos Componentes

- **Middleware Router (`middleware.ts`):** Executa no Next.js (Edge/Node) funcionando junto ao Clerk para bloquear rotas protegidas (ex: todo o escopo do folder `(app)`) de acessos não logados antes de sequer renderizar a página.
- **API Client (`lib/api/`):** Centraliza chamadas HTTP ao Backend. É responsável por obter de maneira segura o session token ativo do Clerk e inseri-lo no cabeçalho HTTP (`Authorization: Bearer <token>`) de cada requisição.
- **UI Components (`components/`):** Biblioteca unificada de componentes React (botões, inputs, dialogs, cards, etc) tipicamente configurados com Tailwind CSS para garantir consistência visual no produto.
- **Protected Routes (`(app)/*`):** Representa a área logada seguindo a arquitetura do Next.js App Router. Divide-se em lógicas isoladas agrupadas por módulos (Obras, Pedidos, Chat, Profissional, Cotação), orquestrando Server e Client Components.
- **Auth Routes (`/sign-in`, `/sign-up`):** Interface para entrada de novos usuários, utilizando os blocos prontos do Clerk integrados a um shell/layout próprio para oferecer credenciais seguras.
- **Frontend App Container:** É a aplicação Node baseada no Next.js 15, unindo Server Components (RSC) para aquisição de dados otimizada e Client Components nativos, importando definições do Monorepo unificado (`@obrafacil/shared`) para ter garantias de DTOs e Schemas Zod idênticos ao Backend.
