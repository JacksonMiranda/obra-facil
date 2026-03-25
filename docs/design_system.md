# Design System — Obra Fácil

> Referência completa de tokens, componentes e padrões visuais.  
> Fonte da verdade: `apps/web/tailwind.config.ts` + `src/app/globals.css`

---

## 1. Fundamentos

### Tipografia
| Uso | Fonte | Peso | Tamanho |
|-----|-------|------|---------|
| Corpo | Inter | 400 | 14px |
| Label / Chip | Inter | 500 (Medium) | 12–13px |
| Subtítulo | Inter | 600 (SemiBold) | 16px |
| Título de tela | Inter | 700 (Bold) | 18–20px |
| Destaque métrico | Inter | 900 (Black) | 36–48px |

> Fonte definida em `spec_ui.md`: *"fontes robustas como Inter, pesos Medium/Semi-Bold"*

### Ícones
Sistema: **Material Symbols Outlined** (Google Fonts CDN).  
- Ícone ativo na BottomNav: classe `.filled` via CSS `font-variation-settings: 'FILL' 1`
- Tamanho base: 24px (`text-2xl`)

---

## 2. Paleta de Cores

| Token Tailwind | Hex | Semântica |
|----------------|-----|-----------|
| `trust` | `#1E40AF` | Primário / Confiança — botões principais, links, perfis |
| `brand` | `#ec5b13` | Marca / Laranja — FAB, destaques, BottomNav active |
| `savings` | `#10B981` | Economia / Sucesso — melhor oferta, obras concluídas |
| `error` | `#EF4444` | Erro / Cancelado — status badge, validações |
| `surface` | `#f8f6f6` | Fundo da aplicação |

> Fonte: `spec_ui.md` — *"Erros sejam Vermelhos Soft (#EF4444), Bons Práticas e Botões seguros como Azuis Escuros (#1e40af) ou Verdes Brandos (#10b981)"*

### Cores de Status (StatusBadge)
| Status | Cor de fundo | Cor do texto |
|--------|-------------|--------------|
| `a-caminho` | `bg-blue-100` | `text-blue-700` |
| `entregue` | `bg-green-100` | `text-green-700` |
| `ativo` | `bg-blue-100` | `text-blue-700` |
| `agendado` | `bg-slate-100` | `text-slate-600` |
| `pendente` | `bg-amber-100` | `text-amber-700` |
| `cancelado` | `bg-red-100` | `text-red-700` |

---

## 3. Layout Mobile-First

```css
/* Container principal */
.mobile-container {
  max-width: 430px;       /* largura máxima iPhone 14 Pro Max */
  min-height: max(884px, 100dvh);
  margin: 0 auto;
  position: relative;
  overflow: hidden;
}
```

- **BottomNav**: altura `64px`, safe-area-inset-bottom padding
- **StickyBottomCTA**: `fixed bottom-0`, `pb-safe`, `pt-3`, `px-4` — para ergonomia com polegar
- **PageHeader**: `sticky top-0`, `z-10`, backdrop-blur para transparência

---

## 4. Componentes

### `<StatusBadge>`
```tsx
<StatusBadge variant="a-caminho" label="A caminho" />
<StatusBadge variant="entregue" label="Entregue" />
```
Variantes: `a-caminho | entregue | ativo | agendado | pendente | cancelado`

### `<StarRating>`
```tsx
<StarRating rating={4.9} count={128} size="lg" />
```
Tamanhos: `sm` (10px) · `md` (14px, padrão) · `lg` (18px)

### `<Avatar>`
```tsx
<Avatar src={url} name="Ricardo Silva" size="md" online showVerified />
```
Tamanhos: `sm` (32px) · `md` (44px) · `lg` (64px) · `xl` (96px)  
- Fallback: inicial do nome sobre fundo `bg-trust`
- Badge online: ponto verde `bg-savings`
- Badge verificado: escudo `bg-trust`

### `<PrimaryButton>` / `<StickyBottomCTA>`
```tsx
<StickyBottomCTA>
  <PrimaryButton variant="trust">Confirmar</PrimaryButton>
</StickyBottomCTA>
```
Variantes: `trust` (azul) · `brand` (laranja) · `savings` (verde)  
Sempre colocado em `StickyBottomCTA` em telas que exigem decisão (`spec_ui.md`).

### `<PageHeader>`
```tsx
<PageHeader title="Meus Pedidos" hideBack />
<PageHeader title="" transparent actions={<ShareButton />} />
```
- `hideBack`: esconde seta de voltar (para telas-raiz)
- `transparent`: fundo transparente (para telas com hero photo)

### `<FAB>`
```tsx
<FAB icon="support_agent" variant="brand" ariaLabel="Suporte" />
```
Variantes: `brand` (laranja) · `trust` (azul) · `savings` (verde)

### `<SearchBar>`
```tsx
<SearchBar />
```
Navega para `/busca?q=...` ao submeter. Placeholder: *"Encontre um encanador, pedreiro..."*

### `<Card>`
```tsx
<Card onClick={...}>Conteúdo</Card>
```
- Clickable: escala 98% no toque, `shadow-sm`, `rounded-2xl`

---

## 5. Navegação (BottomNav)

5 abas fixas:
| Aba | Ícone | Rota |
|-----|-------|------|
| Home | `home` | `/` |
| Pedidos | `receipt_long` | `/pedidos` |
| Obras | `construction` | `/obras` |
| Chat | `chat_bubble` | `/chat` |
| Perfil | `person` | `/perfil` |

- Ícone ativo: variante `.filled`, cor `text-brand`
- Ícone inativo: `text-slate-400`

---

## 6. Padrões de Interação

| Padrão | Implementação |
|--------|--------------|
| Carrossel horizontal | `overflow-x-auto` + `.no-scrollbar` + `flex gap-3` |
| Pull-to-refresh | nativo do browser em iOS/Android |
| Scroll infinito | paginação via `offset` no `/api/v1/professionals` |
| Realtime | `supabase.channel().on('postgres_changes')` no ChatView cliente |
| Otimistic UI | Messages adicionadas localmente antes de confirmar via API |
| Loading states | Spinner inline `border-t-transparent animate-spin` |

---

## 7. Acessibilidade (prd.md RNF-03)

- Todos os botões têm `aria-label`
- `<input type="radio">` real (oculto via `sr-only`) nos cards de cotação
- Contraste mínimo 4.5:1 em todos os pares cor/fundo
- Fonte mínima de 10px em labels auxiliares
- Targets de toque ≥ 44×44px em todas as ações primárias

---

## 8. Convenções de Código

- **Componentes de servidor**: `async function`, sem `'use client'`
- **Componentes cliente**: marcados com `'use client'` somente quando necessário (interações, Realtime)
- **Clean Architecture**: lógica de negócio em `src/lib/use-cases/`, nunca em Routes ou Server Components
- **Validação**: sempre via Zod nos limites de entrada (API routes, use-cases)
- **RBAC**: verificado em routes e use-cases antes de qualquer acesso ao banco
