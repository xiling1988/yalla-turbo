# Build from the monorepo root (pnpm workspace):
#   docker build -f apps/server/Dockerfile -t yallasana-server .

FROM node:22-slim AS base
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable

FROM base AS deps
WORKDIR /app

# Workspace manifests (cache-friendly layer)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/server/package.json apps/server/
COPY apps/web/package.json apps/web/
COPY apps/mobile/package.json apps/mobile/
COPY packages/trpc/package.json packages/trpc/
COPY packages/eslint-config/package.json packages/eslint-config/
COPY packages/typescript-config/package.json packages/typescript-config/

# Prisma schema must exist before postinstall runs prisma generate
COPY apps/server/prisma.config.ts apps/server/
COPY apps/server/src/common/database/prisma/schema.prisma \
  apps/server/src/common/database/prisma/schema.prisma

ENV DATABASE_URL=postgresql://build:build@localhost:5432/build
RUN pnpm install --frozen-lockfile --filter @yallasana/server...

FROM deps AS builder
COPY apps/server apps/server
COPY packages/trpc packages/trpc

RUN pnpm --filter @yallasana/server build

# Portable production tree (includes prisma CLI for runtime migrate deploy)
RUN pnpm --filter @yallasana/server deploy --legacy /prod/server

FROM node:22-slim AS production
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /prod/server ./

ENV NODE_ENV=production
EXPOSE 3000

CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && node dist/main.js"]
