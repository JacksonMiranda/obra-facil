# Obra Fácil — Agent Rules

## Mandatory checks before completing any task

1. **ALWAYS run lint** before finalizing changes:
   ```bash
   npm run lint --workspace=backend
   npm run lint --workspace=frontend
   ```

2. **NO TypeScript errors** — strict type safety is enforced in both apps. Run:
   ```bash
   npm run build --workspace=backend
   npm run build --workspace=frontend
   ```

3. **Unit tests are mandatory** for all new backend services.
   Run: `npm test --workspace=backend`

---

## Project Structure

```
apps/
  backend/   ← NestJS 11 REST API (Supabase + Clerk)
  frontend/  ← Next.js 15 (Tailwind CSS + Clerk + Supabase Realtime)
```

Backend follows the module pattern:
```
src/
  core/        ← Guards, decorators, pipes, interceptors, filters
  modules/     ← Domain modules (professionals, orders, chats, ...)
  supabase/    ← Database client (SupabaseService)
  main.ts
  app.module.ts
```

Frontend follows Next.js App Router with route groups:
```
src/
  app/(app)/   ← Protected app routes
  app/sign-in/ ← Auth routes
  components/  ← Reusable UI components
  lib/api/     ← HTTP client (server-side, uses Clerk token)
  lib/supabase/ ← Supabase Realtime client (browser only)
```

---

## Code Conventions

- **Commits**: Conventional Commits — `feat|fix|refactor|test|docs|chore(scope): description`
- **API responses**: always wrapped in `{ data: T }` envelope via `ResponseEnvelopeInterceptor`
- **Errors**: always `{ error: string, code: string }` via `HttpExceptionFilter`
- **Auth**: Clerk Bearer token on every protected endpoint via `ClerkAuthGuard`
- **Validation**: Zod schemas from `@obrafacil/shared` for all inputs
- **Types**: shared types from `@obrafacil/shared` (never duplicate type definitions)
- **No `any`**: use proper types; add `// eslint-disable-next-line @typescript-eslint/no-explicit-any` only when absolutely unavoidable
