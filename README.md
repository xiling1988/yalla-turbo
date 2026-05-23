# Yallasana monorepo

Turborepo monorepo for the Yallasana platform: marketing site, mobile app, and API server.

## Apps

| Package | Path | Description |
|---------|------|-------------|
| `@yallasana/web` | `apps/web` | Next.js marketing / landing site |
| `@yallasana/mobile` | `apps/mobile` | Expo (React Native) student app |
| `@yallasana/server` | `apps/server` | NestJS API + Prisma + PostgreSQL |

## Prerequisites

- **Node.js** 20+
- **pnpm** 9 (`corepack enable && corepack prepare pnpm@9.0.0 --activate`)
- **Docker** (for local Postgres used by the server)

## Setup

```bash
pnpm install
```

Copy environment files and fill in values:

```bash
cp apps/server/.env.example apps/server/.env
cp apps/mobile/.env.example apps/mobile/.env
cp apps/web/.env.example apps/web/.env
```

Start Postgres for the server:

```bash
cd apps/server && docker compose up -d
```

Run migrations (from repo root):

```bash
pnpm --filter @yallasana/server prisma:migrate
```

## Development

Run a single app:

```bash
pnpm dev:web      # Next.js → http://localhost:3000
pnpm dev:server   # NestJS API → http://localhost:3000 (set PORT if web also uses 3000)
pnpm dev:mobile   # Expo dev server
```

Run all apps that define `dev` (web + server + mobile):

```bash
pnpm dev
```

Other tasks:

```bash
pnpm lint
pnpm check-types
pnpm build --filter=@yallasana/web --filter=@yallasana/server
pnpm test
```

## Continuous integration

GitHub Actions runs on every push to `main` and on pull requests (`.github/workflows/ci.yml`):

- **lint**, **check-types**, and **build** for web and server
- **lint** and **check-types** for mobile (no build script yet)
- **test** for server (mobile has a no-op test script)

### Turborepo Remote Cache (optional, recommended)

Speed up CI by sharing Turborepo cache across runs and machines:

1. In [Vercel](https://vercel.com/account/tokens), create an access token.
2. In your GitHub repo → **Settings → Secrets and variables → Actions**:
   - **Secret** `TURBO_TOKEN` — paste the Vercel token
   - **Variable** `TURBO_TEAM` — your Vercel team slug (the part after `vercel.com/` in your team URL)
3. Enable Remote Caching for the team in the Vercel dashboard (team owners only).

If these are not set, CI still works — Turborepo falls back to a local cache per job.

### CI environment variables

The workflow sets placeholder values for env vars listed in `turbo.json` so builds stay deterministic without real secrets. Override any of them via GitHub Secrets when you add integration tests that need live services.

## Environment variables

| App | Variables |
|-----|-----------|
| **server** | `DATABASE_URL`, `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `PORT` |
| **mobile** | `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` |
| **web** | `MC_API_KEY`, `MC_LIST_ID` (Mailchimp waitlist) |

For local mobile + server, point `EXPO_PUBLIC_API_URL` at your machine (`http://localhost:3000` on iOS simulator; `http://10.0.2.2:3000` on Android emulator).

## Project structure

```
apps/
  web/       # Next.js
  mobile/    # Expo Router + NativeWind
  server/    # NestJS + Prisma
```

Shared packages can be added under `packages/` when needed (e.g. shared API types).
