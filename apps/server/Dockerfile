# Build stage
FROM node:20-slim AS builder

WORKDIR /app

# 1. Copy package files
COPY package*.json ./

# 2. Copy Prisma schema FIRST (so postinstall can find it)
RUN mkdir -p prisma
COPY src/common/database/prisma/schema.prisma prisma/schema.prisma

# 3. NOW install deps → postinstall runs prisma generate and finds the schema
RUN npm ci

# 4. Copy the rest of the source code
COPY . .

# 5. Build NestJS (client is now generated)
RUN npm run build

# Production stage
FROM node:20-slim AS production

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules 
COPY --from=builder /app/prisma ./prisma

# ←←← ADD THIS LINE ←←←
COPY --from=builder /app/src/common/database/prisma/migrations ./prisma/migrations

ENV NODE_ENV=production
EXPOSE ${PORT:-3000}

# Only run migrations at runtime (DATABASE_URL exists here)
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]