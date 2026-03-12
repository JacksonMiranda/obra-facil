# Discovery — Prompts conforme Roteiro

---

## 1.1 Definição do Problema → `docs/definicao_problema.md`

```
Atue como: Product Manager Sênior.

Objetivo: Ajude-me a criar a "Declaração de Problema" (Problem Statement) para um novo produto de software.

Contexto:
Cenário: Mercado de serviços domésticos e construção civil no Brasil
Persona: Proprietários de imóveis como Carlos Alberto, 45 anos, despachante, que possui casa recém-comprada, tem pouco tempo para pesquisar profissionais e não possui conhecimento técnico em construção
A Dor: Dificuldade em encontrar profissionais confiáveis da construção civil, falta de tempo para pesquisa, informações incompletas em anúncios e dificuldade em comparar preços de materiais
Impacto: Perda de tempo, risco de contratar profissionais não qualificados, dificuldade em planejar reformas e manutenções domésticas e custos elevados por falta de comparação de preços
Solução Atual: Pedir indicações a vizinhos, pesquisar em sites genéricos, visitar lojas de materiais presencialmente e comparar manualmente orçamentos de diferentes fontes

Resultado esperado:
- Definição do problema (problem_statement.md) com a seguinte estrutura:

# Declaração de Problema

## 1. Problema
[Descrição clara e concisa do problema]

## 2. Público-Alvo/Persona
[Descrição da persona que enfrenta o problema]

## 3. Objetivo
[Objetivo do produto]
```

> Revise o documento e faça os devidos ajustes.
> Registre o problema no arquivo `docs/definicao_problema.md`.

---

## 1.2a Definição do Produto → `docs/prd.md`

```
Atue como: Product Manager Sênior.

Objetivo: Ajude-me a criar o "Product Requirements Document" (PRD) para um novo produto de software.

Contexto:
<inclua aqui o conteúdo de docs/definicao_problema.md>

Resultado esperado:
- Definição do PRD (prd.md) com a seguinte estrutura:

# Definição de Requisitos do Produto (PRD)

## Descrição do produto
**Problema** [resuma o problema].
**Solução** [resuma a solução].
Para o **[público-alvo]** [ganhos para o público-alvo].
Nossos Diferenciais:
- [listar diferenciais]

---

## Perfis de Usuário
[lista de usuários]

### [usuário 1]
- Problemas: [problemas do usuário 1]
- Objetivos: [objetivos do usuário 1]
- Dados demográficos: [dados demográficos do usuário 1]
- Motivações: [motivações do usuário 1]
- Frustrações: [frustrações do usuário 1]

---

## Principais Funcionalidades
[lista de funcionalidades]

### RFN-[número] [título da funcionalidade]
- [detalhes da funcionalidade]
Critérios de Aceitação:
- [critérios de aceitação]

---

## Requisitos Não Funcionais
[lista de requisitos não funcionais]

### RNF-[número] - [título do requisito]
[descrição do requisito]

---

## Métricas de Sucesso
[lista de métricas]

---

## Premissas e Restrições
[lista de premissas e restrições]

## Escopo
[lista de entregas por versão, v1, v2 etc.]
```

> Revise o documento e faça os devidos ajustes.
> Registre o documento no arquivo `docs/prd.md`.

---

## 1.2b Especificação Técnica → `docs/spec_tech.md`

```
Atue como: Arquiteto de software.

Objetivo: Ajude-me a criar a "Especificação Técnica do Produto" para um novo produto de software.

Contexto:
<inclua aqui o conteúdo de docs/prd.md>

Resultado esperado:
- Definição da especificação técnica (spec_tech.md) com a seguinte estrutura:

# Especificação Técnica

## Visão Geral Técnica
[objetivos do documento e público-alvo]

---

## Arquitetura de Referência
[decisões técnicas resumidas sobre Estilo arquitetural, Componentes principais, Serviço de observabilidade, Autenticação e autorização, Protocolos de Comunicação, Infraestrutura de deployment etc.]

---

## Stack Tecnológica

### Frontend
- **Linguagem**:
- **Framework web**:
- **Estilização**:

### Backend
- **Linguagem**:
- **Runtime**:
- **Framework**:
- **Persistência**:
- **ORM**:

### Stack de Desenvolvimento
- **IDE**:
- **Gerenciamento de pacotes**:
- **Ambiente de desenvolvimento local**:
- **Infraestrutura como Código (IaC)**:
- **Pipeline CI/CD**:

### Integrações
- **Persistência**:
- **Deployment**:
- **Segurança (autenticação e autorização)**:
- **Observabilidade**:

---

## Segurança

### Autenticação e Gestão de Sessão
### Controle de Acesso e Autorização
### Segurança de Dados e Validação
#### Criptografia e Proteção de Dados
### Segurança da Infraestrutura e Configuração
### Segurança no Desenvolvimento e Operação (DevSecOps)

---

## APIs
[detalhes de APIs como Endpoint principal, Versionamento, Padrão de nomenclatura, Autenticação, Endpoints públicos e protegidos etc.]

---

## Tenancy
[detalhes de tenancy como Estratégia, Isolamento, Identificação, Migrações, Segurança etc.]

---

## Diretrizes para Desenvolvimento Assistido por IA
[detalhes de como a IA deve interpretar o documento]
```

> Revise o documento e faça os devidos ajustes.
> Registre o documento no arquivo `docs/spec_tech.md`.

---

## 1.2c Especificação de UI → `docs/spec_ui.md`

```
Atue como: Designer de UX.

Objetivo: Ajude-me a criar a "Especificação de UI" para um novo produto de software.

Contexto:
<inclua aqui o conteúdo de docs/prd.md>

Resultado esperado:
- Definição da especificação de UI (spec_ui.md) com a seguinte estrutura:

# Especificação de UI

## Interfaces Gráficas
[listagem das interfaces gráficas]

### INT-[identificador] - [título da interface gráfica]
- [tipo de contêiner (ex.: página, tabela, formulário etc.)]
- **Campos:** [lista de campos]
- **Botões:** [lista de botões]
- **Links:** [lista de links]
- **Considerações:** informações complementares relevantes

---

## Fluxo de Navegação
[listagem dos componentes visuais e fluxo de navegação]

---

## Diretrizes para IA
[detalhes de como a IA deve interpretar o documento]
```

> Revise o documento e faça os devidos ajustes.
> Registre o documento no arquivo `docs/spec_ui.md`.

---

## 1.2d Revisão do Refinamento

```
Revise os seguintes documentos:

<inclua aqui o conteúdo de docs/prd.md>
<inclua aqui o conteúdo de docs/spec_tech.md>
<inclua aqui o conteúdo de docs/spec_ui.md>
```

> Revise o relatório e faça os devidos ajustes nos documentos.
> Atualize os arquivos `docs/prd.md`, `docs/spec_tech.md` e `docs/spec_ui.md` com as revisões.

---

## 1.3 Desenho — Prompt para Prototipação no Google Stitch

```
Crie um arquivo markdown com um prompt para o papel de designer de UX que solicita a uma ferramenta de prototipagem como o Google Stitch criar templates de protótipos para um projeto.

Siga estritamente as informações providas pelos documentos:

<inclua aqui o conteúdo de docs/prd.md>
<inclua aqui o conteúdo de docs/spec_tech.md>
<inclua aqui o conteúdo de docs/spec_ui.md>
```

> Acesse o Stitch em https://stitch.withgoogle.com/
> Selecione "Web" para o design.
> Selecione um modelo com melhor reasoning (ex.: 3.0 Pro).
> Informe o prompt gerado acima.
