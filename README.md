# 🏗️ Obra Fácil

> **Transformando a jornada de reforma e manutenção residencial em uma experiência simples, segura e integrada.**

![Status do Projeto](https://img.shields.io/badge/Status-Em%20Desenvolvimento-orange)
![CI](https://github.com/lexcesar/obra-facil/actions/workflows/ci.yml/badge.svg)
![Tech](https://img.shields.io/badge/Stack-Next.js%20%7C%20NestJS%20%7C%20PostgreSQL-green)

O **Obra Fácil** é um marketplace que conecta proprietários de imóveis a profissionais autônomos da construção civil, centralizando a busca, o agendamento e o acompanhamento de serviços de reforma em um único lugar.

---

## 🎯 O Problema
Proprietários de residências frequentemente enfrentam falta de confiança, orçamentos opacos e a dificuldade de conciliar a mão de obra com a compra de materiais. O **Obra Fácil** centraliza essa jornada, garantindo segurança através de avaliações reais e agilidade via geolocalização.

## 🚀 Funcionalidades Principais
- 🔍 **Busca Inteligente:** Encontre Pedreiros, Eletricistas e Pintores por geolocalização.
- ⭐ **Portfólio & Avaliações:** Visualize fotos de trabalhos anteriores e notas de outros clientes.
- 📅 **Agendamento Integrado:** Reserve visitas técnicas diretamente pelo app.
- � **Notificações:** Receba alertas sobre mudanças de status nos seus atendimentos diretamente no app.

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia | Detalhes |
|---|---|---|
| **Frontend** | Next.js 15 (App Router) | React 19, Tailwind CSS, Componentes Responsivos |
| **Backend** | NestJS 11 | API RESTful, Arquitetura Modular, TypeScript |
| **Banco de Dados** | PostgreSQL 17 | Persistência Relacional (Supabase/Docker) |
| **Autenticação** | Clerk | Gestão de Identidade e Controle de Acesso (RBAC) |
| **IA (NLP)** | Gemini 1.5 Flash | Geração inteligente de lista de materiais |
| **Infraestrutura** | Docker | Containers OCI para ambiente de desenvolvimento |

---

## 🧱 Requisitos Não Funcionais (RNFs)

O projeto segue padrões rigorosos de engenharia de software para garantir escalabilidade e manutenção:

- **Desempenho (RNF-01):** Tempo de resposta inferior a 2 segundos para 95% das requisições.
- **Manutenibilidade (RNF-02):** Arquitetura limpa com separação de responsabilidades (Clean Architecture) e cobertura de testes com Jest, Vitest e Playwright.
- **Acessibilidade (RNF-03):** Interface com alto contraste, botões de toque amplo e fluxos simplificados, projetada para usuários acima de 45 anos.

---

## 📂 Estrutura do Repositório

```bash
obra-facil/
├── apps/
│   ├── frontend/          # Aplicação Web (Next.js)
│   └── backend/           # API Core (NestJS)
├── packages/
│   └── shared/            # Tipagens e Schemas compartilhados
├── docker/                # Scripts de Inicialização e Seed do DB
├── docs/                  # Documentação detalhada (PRD, Arquitetura, UI)
└── .github/workflows/     # CI/CD Pipelines
```

---

## ⚡ Setup Local

Para rodar o projeto localmente, você precisará do **Node.js 20+** e **Docker**.

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/lexcesar/obra-facil.git
   cd obra-facil
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Build do pacote compartilhado:**
   ```bash
   npm run build --workspace=@obrafacil/shared
   ```

4. **Inicie o ambiente de desenvolvimento:**
   ```bash
   npm run docker:up
   ```

Para guias detalhados sobre variáveis de ambiente e processos de desenvolvimento, consulte a [Documentação de Setup](docs/04-ambiente-e-processos/setup-local.md).

---

## 📖 Documentação Adicional

* [📄 PRD (Requisitos)](docs/01-produto/prd.md)
* [🛠️ Especificação Técnica](docs/02-arquitetura/spec_tech.md)
* [🎨 Guia de UI/UX](docs/03-design-ux/spec_ui.md)
* [🔐 Variáveis de Ambiente](docs/04-ambiente-e-processos/variaveis-ambiente.md)

---

## 👥 Equipe
Projeto desenvolvido por:
- Alexander Cesar Luiz Costa
- Anderson Arruda
- Jackson Jovino Miranda
- Marcelo Granzoto
- Renan Carlos Silva Braz Tafner

---
<p align="center">
Desenvolvido com foco na experiência do usuário e na eficiência na construção civil. 🛠️
</p>
