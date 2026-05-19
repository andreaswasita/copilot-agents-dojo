---
name: calling-mcp-tools-via-subprocess
description: Bypasses a flaky MCP broker by spawning the server directly.
tier: optional
category: integration
created_by: human
platforms: [windows, macos, linux]
tags: [mcp, subprocess, reliability]
author: Andreas Wasita (@andreaswasita)
---

# Calling MCP Tools via Subprocess Skill

Bypasses a flaky MCP broker by spawning the server binary directly and speaking JSON-RPC over stdio, using the dojo helpers `mcp/scripts/mcp-subprocess.js` and `mcp-subprocess.ps1`. Does NOT replace `using-mcp` for normal operation — broker is the fast path; subprocess is the reliable fallback.

## When to Use

- Broker shows the server as connected but `tools/call` hangs or times out.
- Building a script (CI job, scheduled refresh, batch backfill) that needs MCP data without an IDE.
- Deterministic agent workflows that must succeed regardless of client flakiness.
- Diagnosing whether a problem is in the broker or in the server itself.
- User says "broker stuck", "tools not loading", "tools_changed notice".

## Prerequisites

- The dojo helpers `mcp/scripts/mcp-subprocess.js` and `mcp/scripts/mcp-subprocess.ps1`.
- The MCP server binary resolvable (npm install or known path).
- Node 18+ on the path.
- Required auth context set in env BEFORE spawning (e.g. `az login`, `gh auth`).
- The `powershell` Copilot tool to run the helper.

## How to Run

```text
1. Resolve the server binary path.
2. Call the helper with binary, tool name, and JSON args.
3. Receive parsed `result.content` text.
4. Wrap recurring calls in a per-server module to keep skill code clean.
5. Cache results in-session (or to `.cache/mcp/`) since startup is 200–800ms.
```

## Quick Reference

| Helper | Use from |
|---|---|
| `node mcp/scripts/mcp-subprocess.js call <bin> <tool> <jsonArgs>` | bash / cmd / CI |
| `Invoke-McpTool -Bin <bin> -Tool <name> -Params @{...}` | PowerShell |

| Binary location | Source |
|---|---|
| `~/.copilot/installed-plugins/_direct/<vendor>--<name>/dist/index.js` | Copilot CLI |
| `~/.npm/_npx/<hash>/node_modules/<pkg>/dist/index.js` | npx cache |
| Global install: `npm i -g <pkg>` then `which <pkg>` | Most reliable |

| Auth source | Set before spawn |
|---|---|
| Azure / MSX | `az login` |
| GitHub | `gh auth login` OR `$env:GITHUB_PERSONAL_ACCESS_TOKEN` |
| Kubernetes | Current `kubeconfig` context |

## Procedure

### Step 1: Resolve the Binary

Pick the most reliable location from the table. For production scripts, `npm i -g <pkg>` once and pin the version — do not depend on the npx cache.

### Step 2: Call the Helper

bash:

```bash
node mcp/scripts/mcp-subprocess.js call "$BIN" get_my_deals '{"limit":10}'
```

PowerShell:

```powershell
. mcp/scripts/mcp-subprocess.ps1
Invoke-McpTool -Bin "C:\path\to\server\index.js" -Tool "get_my_deals" -Params @{ limit = 10 }
```

Both helpers do exactly:

1. Spawn `node <bin>` with piped stdio.
2. Send `initialize` (id=1).
3. Send `tools/call` (id=2).
4. Parse the response line containing `"id":2`.
5. Return `result.content` text.
6. Time out after 60s and kill the child.

### Step 3: Wrap Per Server

Do not sprinkle subprocess calls through skills. Wrap each server in one module:

```js
// scripts/github-mcp.js
const { callTool } = require("../mcp/scripts/mcp-subprocess.js");
const BIN = require("path").join(process.env.HOME, ".npm", "_npx", "...", "server-github", "dist", "index.js");
exports.searchRepos = (q) => callTool(BIN, "search_repositories", { query: q });
```

### Step 4: Cache

Subprocess startup costs 200–800ms per call. For multi-call flows:

- Batch related calls into one subprocess run if the server supports it.
- Cache in-session keyed by `(tool, JSON.stringify(args))`.
- Persist to `.cache/mcp/<server>.json` for long-running scripts.

### Step 5: Timeouts and Errors

- Use the 60s default; override only for known-slow tools.
- Never block forever.
- On failure, log captured stderr — the truth is there.

### Step 6: Fallback Wrapper

```js
async function callWithFallback(toolName, args) {
  try {
    return await nativeMcpCall(toolName, args);
  } catch (err) {
    console.error(`Broker failed (${err.message}); falling back to subprocess.`);
    return await callTool(BIN, toolName, args);
  }
}
```

Test the subprocess path in CI even if your IDE uses the broker.

## Pitfalls

- **DO NOT** re-implement JSON-RPC framing inline. Use the helper.
- **DO NOT** rely on `npx -y` per invocation in production scripts. Install once.
- **DO NOT** swallow errors. Always surface stderr.
- **DO NOT** keep a single child process open for the whole session pushing many requests through it — response correlation races will bite.
- **DO NOT** pass credentials via tool arguments. Set env before spawn.

## Verification

- [ ] Helper invocation returns the expected tool output (text content) for at least one call.
- [ ] Server binary path is resolved deterministically (not from a transient cache).
- [ ] Timeout is set (default 60s, or explicit override).
- [ ] Wrapper module exists per server — no raw `callTool` scattered across skills.
- [ ] CI exercises the subprocess path independently of the broker.
- [ ] No secrets passed through tool arguments (`grep` the call sites).
