# Memory Vault, MCP, and Time Machine

The dojo's memory vault is **portable**, **agent-accessible**, and **time-aware**.

- **Portable** — `memory/` is a real Obsidian vault. Open in Obsidian.app for native graph + backlinks; open in the Control Plane for the dojo-themed UI; or both at the same time.
- **Agent-accessible** — `@dojo/mcp-memory` is a stdio MCP server. Any MCP-capable agent (Claude Code, Copilot CLI, Cursor, VS Code) can list / search / read / create / link entries via tool calls.
- **Time-aware** — git is the source of truth for history. The Control Plane exposes per-entry Time Machine + a vault-wide Time Slider, and any version can be restored with one click.

---

## Vault Structure

```
memory/
├── .obsidian/            ← Obsidian config (graph colors, core plugins enabled)
├── README.md             ← "This is an Obsidian vault" pointer
├── INDEX.md              ← Map of Content (auto-generated)
├── .link-graph.json      ← Machine-readable link graph (auto-generated)
├── decisions/            ← Architectural decisions
├── patterns/             ← Proven coding patterns
├── preferences/          ← User behavioral preferences
└── sessions/             ← Session summaries
```

Every entry is plain markdown with YAML frontmatter. Cross-references use standard `[text](relative/path.md)` links — Obsidian reads them natively, no wikilink rewrite needed.

### Color Convention

| Type | Color | Used by |
|---|---|---|
| decisions | cyan (`#06b6d4`) | UI graph nodes, Obsidian graph color group |
| patterns | indigo (`#6366f1`) | UI graph nodes, Obsidian graph color group |
| preferences | amber (`#f59e0b`) | UI graph nodes, Obsidian graph color group |
| sessions | emerald (`#10b981`) | UI graph nodes, Obsidian graph color group |

Match between Obsidian.app and the Control Plane UI is intentional.

---

## Obsidian Usage

1. Open Obsidian.
2. **Open folder as vault** → choose `memory/` inside your dojo checkout.
3. Open the graph view (`Ctrl/Cmd+G`). Color groups + filter are pre-configured.
4. Click a node → backlinks panel auto-populates from the relative-link parser.

> **Heads-up:** if you edit files directly in Obsidian, run `scripts/link-index.sh` (or hit `POST /api/memory/scan` from the Control Plane) afterwards so the Control Plane's DB picks up your changes.

---

## MCP Memory Server (`@dojo/mcp-memory`)

### Setup

```bash
cd control-plane
pnpm install
pnpm --filter @dojo/mcp-memory build
```

This produces `control-plane/packages/mcp-memory/dist/index.js` (the stdio binary).

### Tools (10)

| Tool | What it does |
|---|---|
| `memory_list` | List entries with optional filters (`type`, `tag`, `since`, `q`) |
| `memory_search` | Full-text search across title + body |
| `memory_get` | Read one entry (frontmatter + markdown + backlinks) |
| `memory_create` | Create a new entry (auto-slugs, writes frontmatter, runs link-index) |
| `memory_link` | Add a bidirectional `[text](path)` link between two entries |
| `memory_supersede` | Mark one decision as superseded by another |
| `memory_history` | Per-entry git log (sha, date, author, message, optional session-id) |
| `memory_recent_sessions` | Last N session entries (used by the auto-boot prompt) |
| `memory_decisions_active` | Active (non-superseded) decisions (used by the auto-boot prompt) |
| `memory_patterns_for_context` | Patterns matching the current language/task context |

### Resources (2)

| URI | Returns |
|---|---|
| `memory://INDEX` | The auto-generated Map of Content |
| `memory://{type}/{slug}` | One resource per entry (1 per markdown file) |

### Sample MCP Configs

In `control-plane/packages/mcp-memory/examples/`:

- `claude-code.mcp.json` — drop into `.mcp.json` at the project root
- `copilot-cli.mcp.json` — merge into `~/.copilot/mcp.json`
- `cursor.mcp.json` — drop into `.cursor/mcp.json`
- `vscode.mcp.json` — drop into `.vscode/mcp.json`

All four invoke the same stdio binary with `--dojo-root <path>` and optional `--database-url <url>`. If `DATABASE_URL` is set, the server reads from Postgres; otherwise it scans the filesystem.

### Auto-Resume / Auto-Update

When you install the dojo into a project with the Control Plane and tick **Include Memory Vault** + **🔌 Wire MCP memory server**, the generated `copilot-instructions.md` includes:

```md
## Memory (auto-boot)

At session start: call `memory_recent_sessions` and `memory_decisions_active`.
During work: call `memory_patterns_for_context` when starting a new module.
On completion: call `memory_create` with `type:'session'` and a summary that links to any decisions/patterns referenced.
```

The Install flow also writes a merged `.mcp.json` to the target project pointing at the built MCP server.

---

## Time Machine

### Per-Entry (Memory Detail)

Click **🕰 Time Machine** on any entry page. A modal opens with three columns:

1. **Commits** — the file's full git log (newest first).
2. **At &lt;sha&gt;** — markdown rendered from the file content at the selected sha.
3. **Current** — the file content at HEAD.

Click **Restore this version** to write the selected content back to the working copy and commit (`chore(memory): restore <slug> from <sha-short>`).

### Vault-Wide (Memory Browser)

Toggle the **🕰 Time Slider** checkbox at the top of the Memory Browser. Drag the slider to choose any past commit; the cards grid + the knowledge-graph view both filter down to the set of entries that existed at that commit.

> Currently the slider loads commits from the first ~10 entries to keep the bar snappy. For large vaults this may miss earlier commits affecting other files — drag the slider all the way left to confirm coverage.

### Server Endpoints

| Endpoint | Returns |
|---|---|
| `GET /api/memory/at/:sha` | Full vault listing at that commit (used by the Time Slider) |
| `GET /api/memory/history/:slug` | Commit list for one entry |
| `GET /api/memory/history/:slug?sha=<sha>` | Rendered frontmatter + body of that file at that commit |
| `POST /api/memory/restore/:slug` | Restore a file from a sha; auto-commits unless `commit:false` |

All four use `git` CLI under the hood (`execFileSync`, not shell) for argument safety.

---

## End-to-End Walkthrough

1. **Install** — open the Control Plane Install page, tick a preset, tick **Include Memory Vault**, tick **🔌 Wire MCP memory server**, point at a target dir, click Install. Verify `.mcp.json`, `memory/`, and `.github/copilot-instructions.md` are present.
2. **Open** — start a Claude Code / Copilot CLI / Cursor session in that target dir. Confirm the MCP server appears (`/mcp` in Claude Code, `mcp list` in Copilot CLI). Confirm the agent's startup includes a `memory_recent_sessions` call.
3. **Edit** — open `memory/` in Obsidian, add a `decisions/2026-XX-some-call.md`. Save. Go back to the Control Plane, hit Scan, see the new entry in the graph.
4. **Travel** — click the new entry → 🕰 Time Machine → see the single commit you just made. Make another edit, commit, refresh — now two commits in the timeline.
5. **Restore** — hit Restore on the older commit. A new commit lands in git with the restore message. The current view re-renders with the older content.

---

## Known Limitations

- `git log --follow` is used for per-file history; renames are tracked but file moves across `memory/{type}/` boundaries may behave oddly.
- The Time Slider only loads commits from the first ~10 entries (perf hedge for large vaults).
- The Time Machine modal uses side-by-side rendered markdown — there's no syntax-highlighted unified diff yet.
- The `.mcp.json` examples use absolute paths to the built MCP binary. After publishing `@dojo/mcp-memory` to npm we'll switch to `npx @dojo/mcp-memory`.
