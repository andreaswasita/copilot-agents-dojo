# MCP Registry

Curated, vetted Model Context Protocol servers for use with the Copilot
Agents Dojo. Each entry is documented in [`registry.yaml`](registry.yaml)
with its transport, scopes, auth model, and per-client config snippets.

## Layout

```
mcp/
├── README.md              ← you are here
├── registry.yaml          ← machine-readable manifest of vetted servers
├── configs/               ← copy-paste config files per client
│   ├── vscode-mcp.example.json   (.vscode/mcp.json — VS Code / GHCP agent)
│   ├── claude-mcp.example.json   (.mcp.json — Claude Code, generic stdio)
│   └── cursor-mcp.example.json   (.cursor/mcp.json — Cursor)
├── servers/               ← per-server JSON snippets to drop into a client config
│   ├── github.json
│   ├── filesystem.json
│   ├── playwright.json
│   ├── azure.json
│   ├── microsoft-graph.json
│   ├── postgres.json
│   ├── fetch.json
│   └── git.json
└── scripts/               ← reusable subprocess helpers (broker fallback)
    ├── mcp-subprocess.js
    └── mcp-subprocess.ps1
```

## Quick start

1. Pick a server from `registry.yaml`.
2. Copy its snippet from `servers/<name>.json` into the right client config
   in `configs/`.
3. Set the env vars listed in the registry entry (never inline secrets).
4. Verify: open the client and confirm the server shows green / list its
   tools.
5. If the client's broker is flaky, bypass it via
   [`skills/calling-mcp-tools-via-subprocess`](../skills/calling-mcp-tools-via-subprocess/SKILL.md).

## Adding a server

1. Author or audit it (see [`skills/building-mcp-servers`](../skills/building-mcp-servers/SKILL.md)).
2. Add an entry to `registry.yaml` with all required fields.
3. Add a snippet to `servers/<name>.json`.
4. Cross-link from any domain skill that should call it.
5. Open a PR — registry changes require review.

## Principles

- **Vetted only**: no random servers. Every entry has an owner and known
  scopes.
- **Least privilege**: every entry documents the *minimum* scopes; never
  the maximum.
- **Pinned versions**: floating `latest` is forbidden in committed configs.
- **Auth via env or CLI session**: never inline tokens.
- **Same shape, every client**: configs only differ in wrapper keys
  (`servers` vs `mcpServers`).
