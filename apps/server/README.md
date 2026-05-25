# @yallasana/server

NestJS API with Prisma and PostgreSQL. See the [root README](../../README.md) for monorepo setup, env vars, and dev commands.

```bash
# Postgres
docker compose up -d

# From repo root
pnpm dev:server
pnpm --filter @yallasana/server prisma:migrate
```

API docs (Swagger): http://localhost:3000/api

## Docker image

Build from the **monorepo root** (pnpm workspace context):

```bash
docker build -f apps/server/Dockerfile -t yallasana-server .
```
