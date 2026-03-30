# 🏗️ Obra Fácil

> **Transformando a jornada de reforma e manutenção residencial em uma experiência simples, segura e integrada.**

![Status do Projeto](https://img.shields.io/badge/Status-Em%20Desenvolvimento-orange)
![UI/UX](https://img.shields.io/badge/Design-UX%20Research-blue)
![Tech](https://img.shields.io/badge/Stack-Next.js%20%7C%20NestJS%20%7C%20Supabase-green)

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

* [📄 PRD (Requisitos)](docs/prd.md) - Visão geral e regras de negócio.
* [🛠️ Especificação Técnica](docs/spec_tech.md) - Arquitetura, Backend e Frontend.
* [🎨 Guia de UI/UX](docs/spec_ui.md) - Fluxo de telas e identidade visual.
* [💡 Definição do Problema](docs/definicao_problema.md) - Contexto e impacto no mercado.
* [stitch](https://stitch.withgoogle.com/projects/10387496590250121391) - Design do projeto

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 15, React 19, Tailwind CSS, TypeScript |
| Backend | NestJS 11, TypeScript, Swagger |
| Banco de Dados | PostgreSQL (Supabase) com RLS |
| Autenticação | Clerk |
| Deploy | Vercel (frontend + backend) |
| CI/CD | GitHub Actions |

---

## ⚡ Setup Local

```bash
# Clone o repositório
git clone https://github.com/lexcesar/app-devai.git
cd app-devai

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
cp apps/frontend/.env.local.example apps/frontend/.env.local
cp apps/backend/.env.example apps/backend/.env
# Preencha os valores de Supabase e Clerk nos 3 arquivos

# Rode o frontend
npm run dev:frontend    # http://localhost:3000

# Rode o backend (em outro terminal)
npm run dev:backend     # http://localhost:3333
```

### Variáveis de Ambiente Necessárias

| Variável | Onde obter |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk → API Keys |
| `CLERK_SECRET_KEY` | Clerk → API Keys |

---

## 📂 Estrutura do Projeto

```
app-devai/
├── apps/
│   ├── frontend/          # Next.js 15 (App Router)
│   └── backend/           # NestJS 11
├── packages/
│   └── shared/            # Types, schemas Zod, interfaces
├── supabase/
│   ├── migrations/        # Schema SQL
│   └── seed.sql           # Dados de teste
├── docs/                  # Documentação do produto
└── .github/workflows/     # CI/CD pipelines
```

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
