# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copia o projeto inteiro (o context do docker-compose é raiz)
COPY . .
RUN npm ci

# Builda as bibliotecas compartilhadas (essencial para o TS rootDir do NestJS)
RUN npm run build --workspace=@obrafacil/shared

# Builda a workspace específica
RUN npm run build:backend

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Adiciona o curl necessário para o healthcheck do backend (docker-compose)
RUN apk add --no-cache curl

# Copia os dados
COPY --from=builder /app ./

EXPOSE 3001
CMD ["npm", "run", "start:prod", "--workspace=backend"]
