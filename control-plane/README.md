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
  db/         → Drizzle ORM schema + PostgreSQL migrations
  server/     → Hono API server (scans skills/agents on startup, exposes git-history endpoints)
  ui/         → React + Vite SPA with dojo theme (browser, graph, Time Machine modal, vault Time Slider)
  mcp-memory/ → Stdio MCP server exposing the memory vault to any MCP-capable agent
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

## Memory Vault, MCP, and Time Machine

This control plane is Phase 2 of the dojo's memory story:

- **Memory Browser** (`/memory`) — knowledge-graph view of decisions, patterns, preferences, sessions. Cyan = decisions, indigo = patterns, amber = preferences, emerald = sessions.
- **Time Slider** (Memory Browser) — toggle 🕰 to filter cards + graph to the vault state at any past commit.
- **Time Machine modal** (Memory Detail) — per-entry commit history with preview + Restore (auto-commits as `chore(memory): restore <slug> from <sha>`).
- **MCP server** (`packages/mcp-memory/`) — stdio MCP server. Build with `pnpm --filter @dojo/mcp-memory build`. Sample MCP client configs are in `packages/mcp-memory/examples/`.
- **Install flow** — the Install page now offers **🔌 Wire MCP memory server** which writes a `.mcp.json` to the target project (merging if one exists) and injects a session-boot prompt into `copilot-instructions.md` so agents auto-load memory context on every session start.

Full reference: [`../docs/memory-mcp.md`](../docs/memory-mcp.md).

