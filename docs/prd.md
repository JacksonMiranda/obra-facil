# Definição de Requisitos do Produto (PRD)

## Descrição do produto
**Problema** A jornada de contratação de serviços residenciais e compra de materiais de construção é extremamente descentralizada, gerando perda de tempo, insegurança na qualificação dos profissionais e custos elevados por falta de ferramentas de comparação.
**Solução** Uma plataforma digital, o "Obra Fácil", que conecta em um só lugar clientes, profissionais avaliados da área e lojas de materiais de construção locais, facilitando o agendamento, comunicação e a cotação/compra de materiais.
Para o **Proprietário de imóvel sem conhecimento técnico (como o Carlos Alberto)**, a plataforma oferece ganho de tempo, segurança baseada em avaliações reais e economia com uma experiência fluida ("all-in-one").
Nossos Diferenciais:
- Conexão tripla nativa: Cliente, Profissional e Loja Local no mesmo ecossistema.
- Sistema de reputação verificado para mitigar o déficit de confiança do setor.
- Funcionalidade inovadora de cotação de lista de materiais integrada entre o obreiro e as lojas próximas, convertida diretamente no aplicativo.

---

## Perfis de Usuário

### Carlos Alberto (Cliente)
- Problemas: Falta de tempo para pesquisa, falta de confiança em profissionais desconhecidos, dificuldade em comparar preços de materiais.
- Objetivos: Encontrar rápido profissionais confiáveis, prever o custo antes da obra, centralizar as etapas.
- Dados demográficos: Homem, 45 anos, Despachante, proprietário de casa nova.
- Motivações: Otimizar rotina, segurança na prova social, resoluções ágeis.
- Frustrações: Informações incompletas, necessidade de orçar materiais técnicos sozinho, medo de cobranças abusivas.

### Prestador de Serviços (Profissional)
- Problemas: Dificuldade em achar novos clientes com recorrência, falta de organização de agenda.
- Objetivos: Aumentar renda, gerenciar compromissos, agilizar envio de orçamentos e materiais.
- Dados demográficos: 30-60 anos, área da construção, autônomo.
- Motivações: Construir reputação digital consolidada.
- Frustrações: Clientes pechinchando valores irreais ou fornecendo informações pela metade.

### Lojista Local (Lojas de Material)
- Problemas: Perda de competitividade para gigantes (Home Centers), baixo raio de alcance logístico/digital.
- Objetivos: Aumentar giro de estoque e vendas.
- Dados demográficos: Dono/Gerente de material de bairro.
- Motivações: Receber "leads" já aquecidos e com a lista exata do que precisam.
- Frustrações: Orçamentos manuais não convertidos.

---

## Principais Funcionalidades

### RFN-01 - Busca e *Match* de Profissionais
- Permitir clientes buscarem categorias (encanador, pedreiro) em sua localidade.
Critérios de Aceitação:
- Os profissionais mais bem avaliados devem aparecer no topo (ordenamento nativo).
- O sistema deve puxar localização GPS para os profissionais num raio de X km.

### RFN-02 - Chat e Agendamento Integrado
- Comunicação direta app-to-app contendo histórico para segurança e possibilidade de enviar fotos/áudio e propor datas.
Critérios de Aceitação:
- O cliente deve poder aprovar ou rejeitar o agendamento de visita/orçamento inicial através da mesma tela do Chat.

### RFN-03 - Geração e Cotação de Lista de Materiais
- O profissional compõe uma Lista Padrão de Material pelo app, que é disparada às lojas locais credenciadas. A loja (ou o sistema automatizado) retorna o valor, facilitando a decisão do cliente final.
Critérios de Aceitação:
- A interface deve exibir pelo menos as 3 melhores opções de lojas com menor valor global da "cesta de materiais".

### RFN-04 - Pagamentos e *Checkout* Unificado
- Check-out de finalização de obra + compra do material de construção em formato consolidado e parcelável.
Critérios de Aceitação:
- Integração funcional com Gateways para reter o *take-rate* e fazer a divisão (Lojista / Plataforma / Profissional).

---

## Requisitos Não Funcionais

### RNF-01 - Desempenho
A plataforma deve suportar picos de uso sem lentidão (tempo de carregamento inferior a 2 segundos nas buscas e cotações da RFN-03).

### RNF-02 - Manutenibilidade
As regras de negócio do *take-rate* financeiro devem estar altamente desacopladas na camada de infraestrutura/pagamento para facilitar auditorias (Clean Architecture).

### RNF-03 - Acessibilidade
UI com alto contraste text/back e facilidade de cliques devido ao perfil etário (+45).

---

## Métricas de Sucesso
- Taxa de Retenção de profissionais (% que mantém uso mensal).
- GMV Transacionado de materiais de construção pela aplicação.
- Taxa de conclusão e avaliação das obras/reparos.
- Custo de Aquisição de Cliente (CAC) vs. LTV (Lifetime Value).

---

## Premissas e Restrições
- Adoção hyper-local: lançar bairro a bairro / cidade metropolitana para evitar "falta de liquidez" (poucos profissionais / poucas lojas).
- Restrição técnica: Exigirá validação inicial em *Background Check* (antecedentes) e MEI para profissionais a fim de resguardar o nível "Premium" e segurança total exigida pela persona cliente.

## Escopo
- **v1 (MVP):** Cadastro, Catálogo e Busca de profissionais, Chat entre Cliente e Profissional, Avaliações (*Reviews*).
- **v2:** Módulo da Lista de Materiais com exportação em PDF ou notificação WhatsApp para lojas parceiras orçarem e responderem no app.
- **v3:** E-commerce interno (*Checkout* Full Integrado), pagamento de serviços e do próprio material dentro do Obra Fácil.
