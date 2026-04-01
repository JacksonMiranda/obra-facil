# Fluxo Git — Obra Fácil

## Branches

| Branch | Propósito |
|---|---|
| `main` | Código em produção. Deploy automático no Vercel. |
| `develop` | Integração contínua. CI roda aqui. |
| `feat/<escopo>` | Nova funcionalidade. |
| `fix/<escopo>` | Correção de bug. |
| `chore/<escopo>` | Tarefas de manutenção (deps, config, docs). |
| `refactor/<escopo>` | Refatoração sem mudança de comportamento. |

---

## Fluxo de Trabalho

```
main ──────────────────────────────────────────────────► produção
  └── develop ◄── feat/xxx ──► PR → review → merge
                ◄── fix/yyy  ──► PR → review → merge
```

1. **Criar branch** a partir de `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feat/nome-da-feature
   ```

2. **Commits** seguindo [Conventional Commits](https://www.conventionalcommits.org):
   ```
   feat(professionals): add search by service type
   fix(orders): handle null status in list query
   chore(deps): upgrade nestjs to 11.2
   docs(readme): update setup instructions
   refactor(database): extract pool config to constants
   test(orders): add unit test for status transition
   ```

3. **Push** e abrir Pull Request para `develop`:
   ```bash
   git push origin feat/nome-da-feature
   ```

4. O CI roda automaticamente no PR (lint + typecheck + build).

5. Após aprovação e CI verde → **Squash and Merge** em `develop`.

6. Para release → PR de `develop` para `main` → merge → Vercel faz deploy automático.

---

## Convenção de Commits

Formato: `tipo(escopo): descrição`

| Tipo | Quando usar |
|---|---|
| `feat` | Nova funcionalidade para o usuário |
| `fix` | Correção de bug |
| `refactor` | Mudança de código sem alterar comportamento |
| `test` | Adição ou correção de testes |
| `docs` | Documentação |
| `chore` | Atualização de deps, config, scripts |
| `style` | Formatação, espaços (sem mudança lógica) |
| `perf` | Melhoria de performance |
| `ci` | Mudanças em pipeline CI/CD |

**Escopos comuns**: `backend`, `frontend`, `shared`, `db`, `docker`, `ci`, e nomes de módulos (`professionals`, `orders`, `works`, `messages`, `conversations`).

---

## Pull Request

Ao abrir um PR, preencha o template disponível em `.github/pull_request_template.md`.

Requisitos para merge:
- [ ] CI verde (lint + typecheck + build)
- [ ] Code review de pelo menos 1 colega
- [ ] Sem `console.log` ou código comentado
- [ ] Sem `any` sem justificativa
- [ ] Sem dependências Supabase JS (removidas — usamos `pg` diretamente)

---

## Commits de emergência em `main`

Evite commitar diretamente em `main`. Em casos extremos (hotfix crítico em produção):

```bash
git checkout main
git checkout -b fix/hotfix-descricao
# ...correção...
git push origin fix/hotfix-descricao
# Abrir PR direto para main com revisão urgente
```
