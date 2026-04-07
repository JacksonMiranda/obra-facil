---
title: "feat: Complete Navigation Flow — Missing Pages & Dead-End Fixes"
type: feat
status: active
date: 2026-04-06
---

# feat: Complete Navigation Flow — Missing Pages & Dead-End Fixes

## Overview

O app Obra Facil tem 12 rotas implementadas com UI de alta qualidade, mas **15 botoes/links levam a lugar nenhum**, **5 paginas estao faltando**, e **3 error boundaries nao existem**. O fluxo principal (INT-01 → INT-02 → INT-03 → INT-04) funciona mas tem gaps criticos na transicao e no pos-compra.

Este plano visa tornar o app 100% navegavel de ponta a ponta no branch `feat/layout-adjustments`.

## Problem Statement / Motivation

- Professor aprovou o deploy no Vercel — app precisa estar solido antes que colegas alterem a infraestrutura
- Botoes visiveis que nao fazem nada quebram a confianca do usuario (e do avaliador)
- Paginas de erro/404 caem no default do Next.js, quebrando a identidade visual
- Tabs decorativas (Pedidos, Obras) sao enganosas

## Proposed Solution

Criar todas as paginas e handlers faltantes em **7 grupos de trabalho**, priorizados pelo impacto no fluxo do usuario.

---

## Grupo 1 — Error Boundaries e Loading (Fundacao)

Criar paginas de erro e loading no nivel `(app)` para que qualquer falha seja tratada com a identidade visual do app.

### 1.1 `apps/frontend/src/app/(app)/not-found.tsx`
- Icone `search_off`, titulo "Pagina nao encontrada"
- Botao "Voltar ao Inicio" linkando para `/`
- Fundo `bg-surface`, tipografia consistente

### 1.2 `apps/frontend/src/app/(app)/error.tsx`
- `'use client'` (obrigatorio pelo Next.js)
- Icone `error_outline`, titulo "Algo deu errado"
- Botao "Tentar novamente" (`reset()`) e "Voltar ao Inicio"

### 1.3 `apps/frontend/src/app/(app)/loading.tsx`
- Spinner centralizado com classe `border-trust border-t-transparent animate-spin`
- Texto "Carregando..."

---

## Grupo 2 — Paginas de Suporte do Perfil

### 2.1 `apps/frontend/src/app/(app)/perfil/notificacoes/page.tsx`
- Lista de notificacoes mockadas (ex: "Profissional confirmou visita", "Pedido a caminho")
- Empty state: "Nenhuma notificacao"
- Icones por tipo: `notifications`, `local_shipping`, `check_circle`

### 2.2 `apps/frontend/src/app/(app)/perfil/configuracoes/page.tsx`
- Menu simples com toggles mockados: "Notificacoes Push", "Modo Escuro" (disabled), "Idioma"
- PageHeader com "Configuracoes"

### 2.3 `apps/frontend/src/app/(app)/perfil/ajuda/page.tsx`
- FAQ mockado (3-4 perguntas expandiveis com `<details>`)
- Link "Falar com Suporte" apontando para WhatsApp ou email
- Secao "Canais de Atendimento"

### 2.4 `apps/frontend/src/app/(app)/perfil/termos/page.tsx`
- Texto lorem ipsum estilizado como documento legal
- PageHeader com "Termos de Uso"

### 2.5 Wiring em `perfil/page.tsx`
- Converter botoes `<button>` (linhas 37-53) em `<Link>` para as rotas acima
- Converter icone de notificacao no Home (linha 41) e Obras (linha 44) em `<Link href="/perfil/notificacoes">`

---

## Grupo 3 — Pagina de Detalhe do Pedido e Confirmacao

### 3.1 `apps/frontend/src/app/(app)/pedidos/[id]/page.tsx`
- Server component async com `api.get('/v1/orders/${id}')`
- Secoes: header com status badge, info da loja, lista de itens, valor total, datas, endereco de entrega
- Botao "Rastrear Entrega" (mock: abre modal/toast "Em breve")
- Botao "Cancelar Pedido" (mock: toast "Solicitacao enviada")

### 3.2 `apps/frontend/src/app/(app)/pedidos/confirmacao/page.tsx`
- Tela de sucesso pos-checkout
- Icone `check_circle` verde grande, "Pedido Confirmado!"
- Numero do pedido, resumo (loja, valor)
- Botoes: "Ver Meus Pedidos" (`/pedidos`), "Voltar ao Inicio" (`/`)
- Redirecionar para ca apos POST de ordem no CotacaoClient (em vez de `/pedidos`)

### 3.3 Wiring em `pedidos/page.tsx`
- "Ver Detalhes" e "Rastrear Entrega" → `<Link href="/pedidos/${o.id}">`
- "Comprar Novamente" → `<Link href="/">` (volta ao inicio para novo fluxo)

---

## Grupo 4 — Tabs Interativas (Client Components)

### 4.1 Pedidos: tabs Materiais/Servicos
- Extrair a secao de tabs para um client component `PedidosTabs.tsx`
- Estado local `activeTab: 'materiais' | 'servicos'`
- Filtrar lista de pedidos por tipo
- Tab "Servicos" mostra empty state por enquanto
- Adicionar ARIA: `role="tablist"`, `role="tab"`, `aria-selected`

### 4.2 Obras: tabs Em andamento/Finalizadas
- Extrair para client component `ObrasTabs.tsx`
- Estado local `activeTab: 'andamento' | 'finalizadas'`
- Filtrar obras renderizadas por status
- Adicionar ARIA

### 4.3 Obras: Search bar funcional
- Substituir `<div>` estatico por `<input>` real
- Filtro client-side por titulo da obra
- Debounce de 300ms

---

## Grupo 5 — Wiring de Botoes Mortos (Paginas Existentes)

### 5.1 Home (`page.tsx`)
- Emergency banner → `<Link href="/perfil/ajuda">` (com `role="link"` e `aria-label`)
- FAB → `onClick` abre link para `/perfil/ajuda` ou WhatsApp

### 5.2 Profissional (`profissional/[id]/page.tsx`)
- "Compartilhar Perfil" → client component que usa `navigator.share()` com fallback para `navigator.clipboard`
- "Ler todos os N" → expandir reviews inline (mostrar `allReviews` em vez de `reviews.slice(0,3)`) com toggle "Ver menos"

### 5.3 Chat (`ChatView.tsx`)
- Info button no header → `router.push('/profissional/${otherProfile.id}')` (quando role === 'professional')
- "Enviar Foto" → abrir `<input type="file" accept="image/*">` (upload mock: mostra toast "Em breve")
- "Enviar Audio" → toast "Funcionalidade em breve"

### 5.4 Cotacao (`cotacao/[id]/page.tsx`)
- "Revisar / Editar itens" → expandir/colapsar lista de itens com toggle visual

### 5.5 Obras (`obras/page.tsx`)
- "Ver todas" fotos → `<Link href="/obras/${w.id}">` (navega para detalhe que ja mostra fotos)

---

## Grupo 6 — Feedback de Erro no Fluxo Principal

### 6.1 CotacaoClient: erro no checkout
- Adicionar estado `error` e exibir banner vermelho "Nao foi possivel confirmar o pedido. Tente novamente."
- Mudar texto do botao de "Confirmar e Ir Para o Pagamento" → "Confirmar Pedido" (nao ha pagamento real)

### 6.2 CotacaoClient: redirecionar para confirmacao
- Apos POST bem-sucedido, redirecionar para `/pedidos/confirmacao?order=${orderId}` em vez de `/pedidos`

### 6.3 StartConversationButton: erro visivel
- Adicionar estado `error` com mensagem "Nao foi possivel iniciar conversa" abaixo do botao

### 6.4 Cotacao: empty state para zero ofertas
- Se `offers.length === 0`, mostrar mensagem "Aguardando cotacoes das lojas..."

---

## Grupo 7 — Chat: BottomNav Overlap Fix

### 7.1 Ocultar BottomNav na tela de chat
- No `BottomNav.tsx`, usar `usePathname()` para esconder quando `pathname.startsWith('/chat/')`
- Ou: criar layout separado para `/chat/[id]` fora do grupo `(app)` (mais complexo)
- Solucao simples: `if (pathname.startsWith('/chat/')) return null;` no BottomNav

---

## Acceptance Criteria

- [ ] Nenhum botao/link visivel leva a lugar nenhum (0 dead-ends)
- [ ] Todas as rotas do BottomNav funcionam e mostram conteudo
- [ ] 404 e erros mostram pagina estilizada com navegacao de volta
- [ ] Tabs de Pedidos e Obras sao interativas
- [ ] Fluxo completo navegavel: Home → Busca → Profissional → Chat → Cotacao → Confirmacao → Pedidos
- [ ] `npm run build` no frontend passa sem erros
- [ ] Chat nao mostra BottomNav sobreposta ao input

## Technical Considerations

- **Todas as novas paginas** seguem o padrao: server component async, `auth()` guard, `bg-surface min-h-screen pb-24`, PageHeader
- **Dados mockados** sao aceitaveis onde a API nao tem endpoint (notificacoes, configuracoes)
- **Nenhuma dependencia nova** deve ser adicionada
- **Tokens Tailwind** (`text-brand`, `bg-trust`, `bg-surface`) devem ser preferidos sobre hex hardcoded
- **Client components** somente onde necessario (tabs, share, input handlers)

## Dependencies & Risks

- **Risco baixo**: todas as mudancas sao frontend-only, sem alteracao de banco ou API
- **Build**: verificar que o build do Next.js passa apos todas as mudancas
- **Colegas**: branch separado (`feat/layout-adjustments`) isola o trabalho

## Estimativa de Arquivos

| Grupo | Arquivos novos | Arquivos editados |
|-------|---------------|-------------------|
| 1. Error Boundaries | 3 | 0 |
| 2. Perfil suporte | 4 | 2 |
| 3. Pedido detalhe | 2 | 2 |
| 4. Tabs interativas | 2 | 2 |
| 5. Wiring botoes | 1 | 5 |
| 6. Feedback erro | 0 | 3 |
| 7. Chat BottomNav | 0 | 1 |
| **Total** | **12 novos** | **15 editados** |

## Sources & References

- **Design System**: `docs/03-design-ux/design_system.md`
- **UI Spec**: `docs/03-design-ux/spec_ui.md`
- **Stitch Prompt**: `docs/05-prompts-e-referencias/stitch_prompt.md`
- **Pagina referencia (padrao)**: `apps/frontend/src/app/(app)/page.tsx`
- **Componentes UI**: `apps/frontend/src/components/ui/`
- **AGENTS.md**: Conventional Commits, Zod validation, no `any`
