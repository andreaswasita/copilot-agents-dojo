# Dojo Control Plane

A web-based control plane for the [Copilot Agents Dojo](https://github.com/user/copilot-agents-dojo) — browse, search, filter, and install skills + agents visually.

## Quick Start

```bash
# 1. Start PostgreSQL
docker compose up -d

# 2. Install dependencies
pnpm install

# 3. Run migrations + seed presets
pnpm db:migrate
pnpm db:seed

# 4. Start dev servers
pnpm dev
```

- **API:** http://localhost:3131
- **UI:** http://localhost:5173

## Architecture

```
packages/
  db/       → Drizzle ORM schema + PostgreSQL migrations
  server/   → Hono API server (scans skills/agents on startup)
  ui/       → React + Vite SPA with dojo theme
```

## Environment

Copy `.env.example` to `.env` and adjust if needed:

```
DATABASE_URL=postgresql://dojo:dojo@localhost:5432/dojo
DOJO_ROOT=../
PORT=3131
```

## Development

- `pnpm dev` — starts both server and UI in parallel
- `pnpm test` — runs all tests
- `pnpm db:generate` — generates new migration after schema changes
- `pnpm db:migrate` — applies pending migrations
- `pnpm db:seed` — seeds preset profiles
