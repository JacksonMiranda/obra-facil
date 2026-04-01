# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# O docker-compose foi configurado com context root (.)
COPY . .
RUN npm ci

# Builda as dependências compartilhadas do monorepo
RUN npm run build --workspace=@obrafacil/shared

# Fallbacks mockados para o NextJS embutir no bundle (evita crash do Supabase Client)
ENV NEXT_PUBLIC_DISABLE_CLERK_AUTH=true
ENV NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=dummy

# Builda a workspace do frontend
RUN npm run build:frontend

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copia a pasta inteira buildada
COPY --from=builder /app ./

EXPOSE 3000

# Next.js via scripts do workspace
CMD ["npm", "run", "start", "--workspace=frontend"]
