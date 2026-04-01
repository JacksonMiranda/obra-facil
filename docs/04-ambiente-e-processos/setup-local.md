# Guia de Setup Local — Obra Fácil

Este guia mostra como levantar o ambiente de desenvolvimento completo em qualquer máquina em poucos minutos.

## Pré-requisitos

| Ferramenta | Versão mínima | Instalação |
|---|---|---|
| Node.js | 20 LTS | https://nodejs.org |
| Docker Desktop | 4.x | https://www.docker.com/products/docker-desktop |
| Git | 2.x | https://git-scm.com |

> **Windows**: certifique-se de que o Docker Desktop está rodando antes de executar qualquer comando Docker.

---

## 1. Clonar o repositório

```bash
git clone https://github.com/lexcesar/obra-facil.git
cd obra-facil
```

---

## 2. Instalar dependências

```bash
npm install
```

Isso instala dependências do monorepo inteiro (workspaces: `apps/backend`, `apps/frontend`, `packages/shared`).

---

## 3. Configurar variáveis de ambiente

```bash
# Backend
cp apps/backend/.env.example apps/backend/.env

# Frontend
cp apps/frontend/.env.local.example apps/frontend/.env.local
```

Os arquivos de exemplo já vêm com os valores padrão para desenvolvimento local com Docker (Clerk desabilitado, banco de dados Docker na porta 5433). **Não é necessário alterar nada para rodar localmente.**

---

## 4. Subir o ambiente com Docker

```bash
npm run docker:up
```

Este comando sobe os 3 serviços:

| Serviço | URL | Descrição |
|---|---|---|
| `obrafacil-frontend` | http://localhost:3000 | Next.js 15 |
| `obrafacil-backend` | http://localhost:3001/api | NestJS 11 |
| `obrafacil-db` | localhost:5433 | PostgreSQL 17 |

O banco de dados é inicializado automaticamente com o schema e dados de seed na primeira execução.

---

## 5. Verificar se está tudo funcionando

```bash
# Listar profissionais (deve retornar 3 profissionais do seed)
curl http://localhost:3001/api/v1/professionals

# Abrir o frontend no navegador
start http://localhost:3000
```

---

## Outros comandos úteis

```bash
# Parar os containers
npm run docker:down

# Reconstruir containers após mudanças no código
npm run docker:up -- --build

# Resetar o banco de dados (apaga e recria do zero)
npm run docker:reset

# Ver logs em tempo real
docker compose logs -f
```

---

## Desenvolvimento fora do Docker (opcional)

Se preferir rodar backend e frontend diretamente no host (para hot-reload mais rápido):

```bash
# Terminal 1: banco de dados (apenas o DB no Docker)
docker compose up db -d

# Terminal 2: backend
npm run dev:backend

# Terminal 3: frontend
npm run dev:frontend
```

Variáveis de ambiente necessárias:
- `apps/backend/.env` com `DATABASE_URL=postgresql://obrafacil:obrafacil@localhost:5433/obrafacil_db`
- `apps/frontend/.env.local` com `NEXT_PUBLIC_API_URL=http://localhost:3001/api`

---

## Troubleshooting

### Porta 5432 já em uso
Outro container PostgreSQL pode estar ocupando a porta. O projeto usa `5433` por padrão para evitar conflito. Se a porta 5433 também estiver ocupada, edite `docker-compose.yml` e altere o mapeamento de porta do serviço `db`.

### Frontend inacessível (ERR_CONNECTION_RESET no Windows)
O Docker Desktop no Windows pode ter problemas com binding IPv6. O `docker-compose.yml` já usa `127.0.0.1` (IPv4) explicitamente nas portas.

### Banco de dados vazio após restart
O schema e seed são executados apenas na **primeira inicialização** do volume. Para refazer, execute:
```bash
npm run docker:reset
```
