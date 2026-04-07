# Diagrama de Código (Nível 4) - Backend

Este diagrama apresenta a arquitetura em nível de código (Nível 4 do modelo C4) da API REST do backend do sistema construído em **NestJS 11**.

```mermaid
graph TD
    %% Ponto de Entrada principal
    Main[main.ts] --> AppModule[AppModule]
    
    %% Módulos Base
    AppModule --> Core[Core Layers]
    AppModule --> Database[DatabaseModule]
    
    %% Detalhamento do Core
    subgraph Core[Core - Camadas Transversais]
        Filter[HttpExceptionFilter\n(Garante resp. {error, code})]
        Interceptor[ResponseEnvelopeInterceptor\n(Garante resp. {data: T})]
        Guard[ClerkAuthGuard\n(Protege endpoints com Token Bearer)]
        Pipe[ZodValidationPipe / Decorators\n(Validação de Dados)]
    end
    
    Main -.->|Usa globalmente| Filter
    Main -.->|Usa globalmente| Interceptor
    Main -.->|Usa globalmente| Guard
    
    %% Biblioteca Compartilhada
    Shared[( @obrafacil/shared )] -.->|Fornece Zod Schemas e Tipos| Pipe
    Shared -.->|Fornece Tipagem| Modulos_Dominio
    
    %% Módulos de Domínio
    AppModule --> Modulos_Dominio[Módulos de Negócio]

    subgraph Modulos_Dominio[Módulos de Domínio REST]
        Prof[ProfessionalsModule]
        Ord[OrdersModule]
        Conv[ConversationsModule]
        Msg[MessagesModule]
        Mat[MaterialListsModule]
        Wrk[WorksModule]
        Whk[WebhooksModule]
    end

    %% Exemplo de Fluxo Interno
    subgraph Estrutura_Interna_Modulo [Estrutura Interna Padrão]
        Controller[Domain Controller\n(Recebe HTTP)] -->|Injeta Serviço| Service[Domain Service\n(Regra de Negócio)]
        Service -->|Consulta BD| DbSvc[DatabaseService]
    end

    Modulos_Dominio -.-> Estrutura_Interna_Modulo
    Database -->|Exporta provedor| DbSvc

    %% Serviços Externos
    DbSvc -->|pg pool (queries)| Postgres[(PostgreSQL)]
    Guard -->|Verificação de Autenticação| Clerk[Clerk Auth API]
```

### Detalhamento dos Componentes

- **main.ts / AppModule:** Ponto de entrada (bootstrap) do NestJS. Nele as dependências principais da arquitetura (Guards, Pipes, Filters, Interceptors globais) são atreladas.
- **Camada Core (Infraestrutura):** 
  - **HttpExceptionFilter:** Captura as exceções da aplicação e assegura que a resposta de erro respeite a convenção configurada (`{ error: string, code: string }`).
  - **ResponseEnvelopeInterceptor:** Padroniza as respostas de sucesso emulando o padrão adotado na estrutura (`{ data: T }`).
  - **ClerkAuthGuard:** Efetua a verificação e a proteção de rotas privadas utilizando as chaves e validações do **Clerk**, checando por um token Bearer válido na requisição.
- **DatabaseService:** Abstração utilizada no backend para lidar com as queries e a manipulação dos dados diretos pelo pool do **PostgreSQL**.
- **Módulos de Domínio:** Concentram o agrupamento lógico da aplicação, seguindo o Module Pattern do NestJS (contém _Controllers_ para lidar com as rotas HTTP e _Services_ em que residem as lógicas e processos relativos a _Profissionais_, _Obras_, _Mensagens_, _Pedidos_, etc.).
- **@obrafacil/shared:** Pacote global e fonte da verdade onde ficam localizados todos os Schemas de validação por meio do **Zod** e tipagens para entrada/saída, sendo utilizado tanto pelo Backend (pipes de validação) como Frontend.
