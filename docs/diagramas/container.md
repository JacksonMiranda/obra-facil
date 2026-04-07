# Diagrama de Contêineres (Nível 2) - Obra Fácil

Este diagrama apresenta a arquitetura a nível de Contêineres (Nível 2 do modelo C4). Aqui a visão do sistema é aprofundada demonstrando os aplicativos hospedáveis, as estruturas de banco de dados e as dependências e sistemas externos mapeando o fluxo de macro comunicação.

```mermaid
graph TD
    %% Atores e Clientes
    User(["Usuário / Cliente<br/>(Pessoa)"])
    
    %% Borda do Sistema Obra Fácil
    subgraph SystemBoundary ["Sistema Obra Fácil"]
        Frontend["Frontend Web App<br/>(Next.js 15, React, TailwindCSS)"]
        Backend["Backend REST API<br/>(NestJS 11, Node.js, TS)"]
        Database[("PostgreSQL Database<br/>(Persistência Relacional)")]
    end
    
    %% Sistemas e Serviços Externos
    ClerkAuth["Serviço de Autenticação Clerk<br/>(Sistema Externo / SaaS)"]
    WhatsAppBot["WhatsApp Bot Provider<br/>(Serviço Mensageria)"]
    
    %% Fluxos de Comunicação (C4 style labels)
    User -->|"Acessa a plataforma, gerencia obras, pedidos e perfil usando navegador web"| Frontend
    
    %% Comunicação Interna do Sistema
    Frontend -->|"Realiza chamadas HTTP/REST consumindo e enviando payload JSON"| Backend
    Backend -->|"Lê e grava dados da aplicação utilizando queries SQL"| Database
    
    %% Comunicação com Sistemas Externos
    Frontend -->|"Delega gerenciamento de login, cadastro e sessão"| ClerkAuth
    Backend -->|"Verifica e valida o Token Bearer (JWT) fornecido pelo cliente"| ClerkAuth
    Backend -->|"Envia e recebe interações de mensageria da plataforma"| WhatsAppBot
    
```

## Detalhamento dos Contêineres

- **Usuário / Cliente:** O ator primário que utiliza o sistema (construtores, clientes, corretores, etc.) acessando via navegador web ou de um dispostivo móvel.
- **Frontend Web App (Next.js):** Contêiner que fornece todo o SPA/SSR (Single Page Application / Server-Side Rendering) que roda no browser. Ele é inteiramente responsável por prover a experiência UI/UX, formulários, renderização visual e interface de roteamento ao usuário final.
- **Backend REST API (NestJS):** Contêiner lógico responsável pelas regras de escopo de negócio do sistema. Protegendo a integridade, validando dados (Zod, Pipes), interligando módulos (Obras, Pedidos, Profissionais, Webhooks) e conversando de modo transacional com o recurso principal de banco de dados e APIs terceiras.
- **PostgreSQL Database:** Contêiner de armazenagem de dados persistente. Entidade isolada responsável por fornecer confiabilidade, relacionamentos complexos, e velocidade de busca aos dados cadastrais e transacionais do domínio do projeto. 
- **Serviço de Autenticação (Clerk):** Um sistema externo robusto consumido pelos contêineres principais de modo que alivia ao máximo carga sensível do projeto em si. O front-end delega a ele o Input das credenciais do usuário. O back-end delega a ele a checagem se o token da requisição é autêntico de fato.
- **WhatsApp Bot / Mensageria:** Ator de sistema externo onde o Backend também se conecta para o disparo proativo de status/updates e interações automáticas visando enriquecer a conexão com clientes.
