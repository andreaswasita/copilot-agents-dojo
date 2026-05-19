---
name: using-mcp
description: Wires MCP servers into a Copilot client and verifies them.
tier: optional
category: integration
created_by: human
platforms: [windows, macos, linux]
tags: [mcp, integration, tools]
author: Andreas Wasita (@andreaswasita)
---

# Using MCP Skill

Discovers, configures, and verifies Model Context Protocol servers from Copilot, Claude Code, Cursor, and other MCP-compliant clients. Treats `mcp/registry.yaml` as the source of truth and least-privilege scopes as non-negotiable. Does NOT itself author servers (see `building-mcp-servers`) or bypass the broker (see `calling-mcp-tools-via-subprocess`).

## When to Use

- User mentions MCP, MCP server, "add a tool", "connect to <service>".
- Agent needs data from an external system (GitHub, Postgres, Azure, Graph, browser, FS).
- "Why can't Copilot see X?" — check the MCP wiring before anything else.
- Authoring or modifying `.vscode/mcp.json`, `.mcp.json`, `.cursor/mcp.json`.

## Prerequisites

- A Copilot client that supports MCP (Copilot CLI, VS Code agent mode, Claude Code, Cursor).
- `mcp/registry.yaml` accessible in the dojo (this skill is parasitic on the registry).
- `npx` / `node` available for stdio servers, or hosted endpoint for Streamable HTTP.
- Auth context already set up (`az login`, `gh auth`, OAuth flow, etc.) — never paste raw secrets into configs.
- The `view`, `edit`, and `powershell` Copilot tools.

## How to Run

```text
1. Open `mcp/registry.yaml`. Find the server.
2. Pick the transport (stdio for local, Streamable HTTP for hosted).
3. Drop the config snippet from `mcp/configs/` into the client's config file.
4. Set scopes to least privilege.
5. Verify the server is green in the client; call one tool end-to-end.
```

## Quick Reference

| Transport | When | Auth model |
|---|---|---|
| stdio | Local dev, single user | Inherits CLI session env (`az`, `gh`) |
| Streamable HTTP | Hosted, teams, sandboxed | OAuth 2.1 + PKCE |
| SSE (legacy) | Only if server still requires it | Migrate to Streamable HTTP |

| Client | Config file |
|---|---|
| VS Code / GHCP agent mode | `.vscode/mcp.json` (workspace) or user-level via `MCP: Open User Configuration` |
| Copilot CLI | `~/.copilot/mcp.json` or per-project `.copilot/mcp.json` |
| Claude Code | `.mcp.json` (repo) or `~/.claude.json` (user) |
| Cursor | `.cursor/mcp.json` or `~/.cursor/mcp.json` |

| Scope rule | Concrete |
|---|---|
| GitHub MCP | Fine-grained PAT, read-only where possible, scoped to specific repos |
| Filesystem MCP | Explicit allow-list of dirs — never `/` or `~` |
| Postgres / MSSQL MCP | Read-only role for assistant work |
| Azure MCP | Inherit `az login` identity, no SP secrets in config |

## Procedure

### Step 1: Registry First

Use `view` on `mcp/registry.yaml`. If the server is listed, use its sanctioned config. If it is not listed, hand off to `building-mcp-servers` first and add a registry entry before consuming it.

### Step 2: Pick Transport

Use the transport table above. Default to stdio for dev; Streamable HTTP for anything shared.

### Step 3: Configure

Use `edit` to add the snippet to the client's config file. Reference env vars (`${env:VAR}`) — never inline secrets. Pin server version (`@x.y.z`) for reproducibility.

```jsonc
// .vscode/mcp.json
{
  "servers": {
    "github": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github@1.4.0"],
      "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "${env:GH_PAT}" }
    }
  }
}
```

### Step 4: Scope Down

Apply the scope table. Default to read-only unless the workflow demonstrably requires writes. Document the scope in the registry entry, not just the config.

### Step 5: Verify

Run via the `powershell` tool:

```text
VS Code        → "MCP: Show Installed Servers" command, confirm green status
Claude Code    → claude mcp list
Copilot CLI    → /mcp list
Generic        → node mcp/scripts/mcp-subprocess.js list <server-binary>
```

Then ask the agent to perform a tiny task that exercises one tool. Failure modes to check:

- Trailing commas in JSON.
- Wrong `type` (`stdio` vs `http`).
- Server printed to stdout before the JSON-RPC handshake (kills framing).
- Missing env var the server silently needs.

### Step 6: Fallback When the Broker Misbehaves

If `tools/call` hangs or "tools_changed" loops, do not reconfigure — bypass. Switch to `calling-mcp-tools-via-subprocess`.

## Pitfalls

- **DO NOT** paste an MCP URL into chat instead of a config file.
- **DO NOT** use a `repo`-scope classic GitHub token. Fine-grained, scoped.
- **DO NOT** allow-list `/` or `~` for the filesystem MCP server.
- **DO NOT** hard-code tokens into committed configs. Use `${env:VAR}`.
- **DO NOT** add a server without verifying the agent can actually invoke it.
- **DO NOT** re-implement GitHub / Postgres / FS access as a custom skill when an MCP server already exists.

## Verification

- [ ] Server entry exists in `mcp/registry.yaml` (with scopes documented).
- [ ] Config file uses the snippet from `mcp/configs/` verbatim (except env / scopes).
- [ ] Server pinned to a specific version (no floating `latest`).
- [ ] Client shows the server as connected / green.
- [ ] One representative tool call executed end-to-end via the agent.
- [ ] No secrets in committed files (`grep` for token patterns).
