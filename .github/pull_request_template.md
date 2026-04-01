## Descrição

<!-- Descreva o que este PR faz e por quê. -->

## Tipo de mudança

- [ ] `feat` — Nova funcionalidade
- [ ] `fix` — Correção de bug
- [ ] `refactor` — Refatoração (sem mudança de comportamento)
- [ ] `chore` — Atualização de deps, config, docs
- [ ] `test` — Adição ou correção de testes

## Contexto

<!-- Número da issue relacionada (ex: Closes #42) -->

## Checklist

- [ ] O CI está verde (lint + typecheck + build)
- [ ] Não há `console.log` ou código comentado
- [ ] Não há `any` sem comentário justificando
- [ ] Variáveis de ambiente novas foram documentadas em `docs/variaveis-ambiente.md`
- [ ] Mudanças no schema do banco foram adicionadas em `docker/01-schema.sql`

## Como testar

<!-- Explique os passos para testar manualmente as mudanças. -->

1. `npm run docker:up`
2. Acesse http://localhost:3000
3. ...
