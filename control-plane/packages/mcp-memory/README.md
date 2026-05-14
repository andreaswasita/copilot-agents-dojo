# @dojo/mcp-memory

Model Context Protocol server exposing the [Copilot Agents Dojo](../..) memory vault to AI coding agents (Claude Code, Copilot CLI, Cursor, VS Code, …) over **stdio**.

## What it does

Gives any MCP-capable agent direct, structured access to your shared agent memory:

- **Tools** — `memory_list`, `memory_search`, `memory_get`, `memory_create`, `memory_link`, `memory_recent_sessions`, `memory_decisions_active`, `memory_patterns_for_context`, `memory_supersede`, `memory_history`
- **Resources** — `memory://INDEX` (Map of Content) + `memory://{type}/{slug}` per entry

The vault on disk is the source of truth. The server reads the same files Obsidian and the Control Plane UI browse — agents see exactly what humans see.

## Install / build

From the control-plane root:

```bash
pnpm install
pnpm --filter @dojo/mcp-memory build
```

Outputs `dist/index.js` with a shebang. Has the `dojo-mcp-memory` bin.

## Run

```bash
node dist/index.js --dojo-root /absolute/path/to/copilot-agents-dojo
# or
DOJO_ROOT=/absolute/path/to/copilot-agents-dojo node dist/index.js
```

## Wire into clients

See [examples/](./examples) for ready-to-copy configs:

- [`claude-code.mcp.json`](./examples/claude-code.mcp.json)
- [`copilot-cli.mcp.json`](./examples/copilot-cli.mcp.json)
- [`cursor.mcp.json`](./examples/cursor.mcp.json)
- [`vscode.mcp.json`](./examples/vscode.mcp.json)

The Control Plane Install page can write the right config file for you when "Wire MCP memory server" is checked.

## Tools at a glance

| Tool | When to call |
|---|---|
| `memory_recent_sessions` | At session start — load what the previous agent did |
| `memory_decisions_active` | At session start — load architectural constraints |
| `memory_patterns_for_context` | When working in a specific language / file type |
| `memory_search` | Free-text search across all entries |
| `memory_get` | Fetch one entry with backlinks + forward links |
| `memory_create` | Log a new decision / pattern / preference / session |
| `memory_link` | Wire two entries together |
| `memory_supersede` | Mark a decision as replaced by another |
| `memory_history` | Git log for one entry |
