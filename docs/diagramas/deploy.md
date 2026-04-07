# Diagrama de Implantação - Obra Fácil

Este diagrama foca na infraestrutura de hospedagem e *deployment* dos sistemas, detalhando como os contêineres de software identificados anteriormente são de fato fisicamente executados nos ambientes de hardware, servidores em nuvem ou serviços em nuvem gerenciados (_PaaS_ / _SaaS_), cobrindo o trajeto desde o maquinário do usuário final.

```mermaid
flowchart TD
    %% Nós do Ambiente do Usuário Final
    subgraph ClientEnv [Nó: Dispositivo do Usuário Final]
        Browser["Navegador Web<br/>(Chrome, Safari, Edge, Mobile)"]
    end

    %% Nós de Infraestrutura Frontend (PaaS)
    subgraph VercelCloud [Nó SaaS de Hospedagem: Edge / Serverless]
        subgraph VercelEdge [Ambiente Serverless Next.js]
            FrontendContainer("Frontend App Instância<br/>[Next.js 15, SSR/CSR]")
        end
    end

    %% Nós de Infraestrutura Backend (Cloud VPS / Docker)
    subgraph BackendEnv [Nó de Computação em Nuvem: Servidor VPS / Cloud]
        subgraph DockerEngine [Ambiente / Engine de Contêineres: Docker]
            BackendContainer("Backend App Contêiner<br/>[NestJS 11, Node.js]")
            %% Em casos de failover pode rodar um "Redis Container" aqui dentro para gerência da fila do WPP
        end
    end
    
    %% Nó do Banco de Dados
    subgraph DatabaseEnv [Nó de Banco de Dados Seguro]
        DatabaseServer[("PostgreSQL Server<br/>[DB Otimizado para Relacional]")]
    end

    %% Provedores Externos Cloud (Identity / Mensageria)
    subgraph ExternalSaaS [Rede Externa Global]
        ClerkSaaS(("Clerk Auth Servers<br/>[Serviço Cloud Especializado em Identidade]"))
        WhatsAppCloud(("Rede de Mensageria<br/>[Interfaces WhatsApp Bot]"))
    end

    %% ---- Relacionamentos e Portas de Rede ----

    %% Cliente Consumindo
    Browser -- "HTTPS (Porta 443)<br/>[Carrega Interface UI]" --> FrontendContainer
    
    %% Frontend falando com Backend e Auth
    FrontendContainer -- "Chamadas API HTTPS" --> ClerkSaaS
    FrontendContainer -- "Fetch API (Requisições HTTPS)" --> BackendContainer
    
    %% Backend falando com o Banco de Dados, Mensageria e Auth
    BackendContainer -- "Comunicações TCP/IP seguras<br/>[Validação Sessão JWT]" --> ClerkSaaS
    BackendContainer -- "Conexão Pool<br/>(Protocolo DB TCP Porta 5432)" --> DatabaseServer
    BackendContainer -- "Rede HTTPS<br/>(Webhooks, Status e Filas Wpp)" --> WhatsAppCloud
    
```

## Detalhamento da Topologia de Rede e Nuvens

- **Nó - Dispositivo do Usuário:** O hardware final do cliente (desktops em escritórios ou celulares diretamente numa obra). Como o "Obra Fácil" é concebido como um Web App adaptativo, o único requisito físico é possuir um navegador atualizado executando JavaScript nativo de cliente; nenhum instalador pesado local se faz obrigatório de praxe.
- **Nó - Hospedagem Serverless (Provedor do Frontend):** O Next.js (com sua arquitetura Frontend moderna) geralmente roda hospedado em redes *Edge* (sistemas na borda) permitindo processamento Server-Side e entrega de conteúdo cacheado geograficamente próximo do originador da requisição, mantendo latências quase nulas de renderização de interface.
- **Nó - Computação do Backend (Cloud/VPS executando Docker):** Espaço provisionado com isolamento e confiabilidade. Executando o **NestJS** obrigatoriamente acoplado em contêiner **Docker**. Essa conteinerização certifica que se a imagem empacotou de forma bem-sucedida num computador, a sua execução binária será estável no Linux de produção sem conflitos de variáveis do SO host. Abstrações de Filas em Memória para retentativas/fallbacks (caso o provedor do bot falhe) residem isoladas no ciclo de vida desta conteinerização backend.
- **Nó - Banco de Dados de Produção (PostgreSQL):** Pode tratar-se de um banco conteinerizado autogerido numa VPC privada paralela, ou um DBAS (*Database As A Service*) nativo num provedor na nuvem. A sua política de acesso é rígida operando normalmente portas cruas (5432) trancadas com restrição de IPS e abertas preferivelmente apenas para o Servidor de Backend isolado.
- **As Nuvens Externas (Clerk e Mensageria WPP):** Elementos cruciais SaaS para a arquitetura do "Obra Fácil". O negócio do aplicativo é dominar e prever a gestão da construção civil. A infraestrutura dolorosa de *Single Sign On*, Criptografia de perfis na borda e rotatividade de Tokens fica estritamente na jurisdição dos clusters do sistema do Clerk. Em uníssono assíncrono, a plataforma da rede WhatsApp (meta/parceiros) administra a parte severa de rotear mensagens aos celulares.
