---
name: building-mcp-servers
description: Authors an MCP server with the official SDK and gates.
tier: optional
category: integration
created_by: human
platforms: [windows, macos, linux]
tags: [mcp, sdk, server-authoring]
author: Andreas Wasita (@andreaswasita)
---

# Building MCP Servers Skill

Authors a Model Context Protocol server in TypeScript or Python using the official SDKs (`@modelcontextprotocol/sdk`, `mcp`), with deliberate tool/resource/prompt design, both stdio and Streamable HTTP transports, OAuth 2.1 auth, and a test fixture. Does NOT roll its own JSON-RPC framing and does NOT ship without registry + config snippet.

## When to Use

- A required system is not in `mcp/registry.yaml`.
- An existing MCP server is too broad; you need a domain-specific facade.
- User says "build", "write", "author", "create" + "MCP server".
- Wrapping internal APIs so an agent can call them without bespoke skills.

## Prerequisites

- Node 20+ (TypeScript) or Python 3.11+.
- The official SDK installed (`@modelcontextprotocol/sdk` or `mcp`).
- An auth strategy decided upfront (CLI inheritance for local, OAuth 2.1 + PKCE for hosted).
- `mcp/registry.yaml` and `mcp/configs/` writable.
- `@modelcontextprotocol/inspector` for handshake debugging.

## How to Run

```text
1. Pick primitives: tools / resources / prompts. Default to tools.
2. Design tool names (verb_object) and JSON Schema inputs.
3. Scaffold the server with the official SDK + stdio transport.
4. Add Streamable HTTP transport if the server is hosted.
5. Implement auth — CLI inheritance (local) or OAuth 2.1 + PKCE (hosted).
6. Add tests: in-memory transport unit tests + a real stdio smoke test.
7. Register in `mcp/registry.yaml` and add a `mcp/configs/` snippet.
```

## Quick Reference

| Primitive | Use for | Mental model |
|---|---|---|
| tools | Side-effectful or arg'd queries | RPC the agent decides to invoke |
| resources | Read-only documents addressable by URI | Things the agent or user attaches |
| prompts | Pre-baked agent instructions | Slash commands the user invokes |

| Concern | Rule |
|---|---|
| Tool naming | `verb_object` snake_case (`get_my_deals`) |
| Input schema | JSON Schema, required fields marked, `description` on every property |
| Output | Text content first; structured JSON in a second content block |
| Logging | stderr only — stdout is reserved for JSON-RPC framing |
| Auth | CLI inheritance (local) or OAuth 2.1 + PKCE (hosted), never tokens in tool args |
| Pagination | Every list tool has `limit` (default ≤50) and `cursor` |
| Idempotency | Mutations accept a client-provided idempotency key |
| Versioning | Bump `serverInfo.version` on schema changes |

## Procedure

### Step 1: Choose Primitives

Default to tools. Use resources only when the data is naturally addressable by URI. Use prompts only when the user invokes them explicitly (slash commands).

### Step 2: Design Tool Surface

For each tool:

- Name: `verb_object` snake_case.
- Description: answer "when do I call this?", not "what does it do internally". Lead with the trigger context.
- Input: JSON Schema with `required`, every property has a human-readable `description`.
- Output: text summary first; machine-readable JSON in a second content block if the agent will chain calls.

### Step 3: Stdio Scaffold (TypeScript)

```ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server(
  { name: "my-server", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(/* tools/list */, async () => ({ tools: [...] }));
server.setRequestHandler(/* tools/call */, async (req) => { /* ... */ });

await server.connect(new StdioServerTransport());
```

### Step 4: Streamable HTTP (Hosted)

- Use `StreamableHTTPServerTransport`.
- Mount behind a real auth provider (Entra ID, Auth0, custom OAuth 2.1).
- Implement `/mcp` POST + GET (SSE streaming). Do not invent endpoints.
- Add protected resource metadata so clients can discover the auth server.

### Step 5: Stdout Discipline

The single most common failure: a `console.log` or stray print before the JSON-RPC handshake corrupts the stream. The client silently dies.

- TypeScript: route logs to `console.error`.
- Python: configure `logging` to `sys.stderr`, never `print`.

### Step 6: Auth Without Inline Secrets

- Local dev: inherit from `az`, `gh`, `kubectl`, `gcloud`.
- Hosted: OAuth 2.1 + PKCE. Map `Authorization: Bearer …` to your resource server.
- Never accept tokens via tool arguments — that places them in the agent's context window and chat history.

### Step 7: Tests

- Unit-test handlers with the SDK's in-memory transport.
- Smoke test: spawn the server, call `tools/list` then one representative `tools/call`.
- Ship an `auth_status` tool for diagnostics.
- Provide a `--inspect` mode wired to `@modelcontextprotocol/inspector`.

### Step 8: Register and Document

After the server works:

1. Add an entry to `mcp/registry.yaml` (transport, scopes, auth model).
2. Add a config snippet under `mcp/configs/`.
3. Cross-link from the relevant consumer skill.

## Pitfalls

- **DO NOT** log to stdout in a stdio server.
- **DO NOT** build a mega-tool with a `mode` enum that switches behavior. One job per tool.
- **DO NOT** write tool descriptions that explain implementation. Lead with the trigger context.
- **DO NOT** return unbounded result sets. Every list tool has `limit` and `cursor`.
- **DO NOT** accept credentials as tool arguments. They will end up in chat history.
- **DO NOT** re-implement JSON-RPC framing. Use the SDK.
- **DO NOT** ship a server without an `auth_status` / health tool.

## Verification

- [ ] Built with `@modelcontextprotocol/sdk` (TS) or `mcp` (Python) — no custom framing.
- [ ] All tools have JSON Schema input with `required` set and per-property `description`.
- [ ] Stdout is reserved for JSON-RPC; all logs go to stderr.
- [ ] Auth uses CLI inheritance (local) or OAuth 2.1 + PKCE (hosted).
- [ ] `auth_status` tool exists.
- [ ] Smoke test covers `tools/list` and one `tools/call` over real stdio.
- [ ] Registry entry and `mcp/configs/` snippet exist.
- [ ] `serverInfo.version` set and bumped on every schema change.
