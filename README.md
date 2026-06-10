<div align="center">

<img src="./docs/assets/banner.png" alt="Copilot Agents Dojo" width="100%">

# Copilot Agents Dojo 🏯

# A discipline framework for<br/>your GitHub Copilot agents.

---

*End-to-end framework to take AI agents from improvised assistants to disciplined, measurable, repeatable engineering partners.*

<p align="center">
  <a href="https://andreaswasita.github.io/copilot-agents-dojo/quests/"><img src="https://img.shields.io/badge/🥋_New%3F_Walk_the_Zen_Quest-f59e0b?style=for-the-badge" alt="Walk the Zen Quest"></a>
</p>

[**📖 Wiki**](../../wiki) · [**Start Here**](#enter-the-dojo) · [**🥋 Belt Quest**](https://andreaswasita.github.io/copilot-agents-dojo/quests/) · [**Skills**](./skills.md) · [**Agents**](./agents) · [**Spec**](./spec/copilot-skills-spec.md) · [**Contributor Guide**](./AGENTS.md)

![license](https://img.shields.io/badge/license-MIT-1f6feb?style=flat-square)
![version](https://img.shields.io/badge/version-1.1-3fb950?style=flat-square)
![spec](https://img.shields.io/badge/spec-v1-1f6feb?style=flat-square)
![skills](https://img.shields.io/badge/skills-29-1f6feb?style=flat-square)
![tiers](https://img.shields.io/badge/tiers-core%20%2F%20practical%20%2F%20optional-8b5cf6?style=flat-square)
![agents](https://img.shields.io/badge/personas-8-14b8a6?style=flat-square)
![curator](https://img.shields.io/badge/curator-self--improving-f59e0b?style=flat-square)
![gate](https://img.shields.io/badge/enforcement-verify.sh-3fb950?style=flat-square)

---

</div>

> *Your AI agents are untrained. Time to put them through the dojo.*

A **skills & discipline framework for GitHub Copilot agents** — for the engineers who *build with* Copilot every day to plan, code, test, review, ship, and learn alongside autonomous tooling.

Where the [Copilot Cowork Dojo](https://github.com/andreaswasita/copilot-cowork-dojo) trains AI **coworkers** for knowledge work, this dojo trains AI **builders**: software engineers, architects, TPMs, security engineers, and test engineers running Copilot in their IDE, terminal, and CI.

Drop `skills/` + `optional-skills/` + `.github/copilot-instructions.md` into any repo → Copilot agents auto-discover the index and follow the workflow. Run `bash scripts/verify.sh` as the single gate in CI or pre-PR.

**What's inside:**

- **29 production skills** across `core / practical / optional` tiers (25 always-discoverable + 4 optional)
- **8 specialized agent personas** — generalist `architect`, three TOGAF specialists (business / solution / platform), plus `security-engineer`, `software-engineer`, `technical-program-manager`, `test-engineer`
- Mandatory **BRAINSTORM → PLAN → TDD → REVIEW → FINISH** pipeline
- **Self-improving curator** — state machine, backups, idle-based trigger, per-run audit trail
- **Memory vault** — persistent, linked knowledge graph (Obsidian-compatible)
- **MCP memory server** — any MCP-capable agent can read/write the vault
- Git worktree isolation + cache-aware skill amendments
- Single enforcement gate: `scripts/verify.sh` (+ GitHub Actions)

---

## The Mandatory Workflow

Every non-trivial task follows this pipeline — no skipping, no improvising:

```
BRAINSTORM → WORKTREE → PLAN → EXECUTE → TEST → REVIEW → FINISH → LEARN
```

| Step | Skill | What happens |
|------|-------|-------------|
| 1 | [`brainstorming`](skills/brainstorming/SKILL.md) | Socratic refinement → approved design |
| 2 | [`using-git-worktrees`](skills/using-git-worktrees/SKILL.md) | Isolated workspace on feature branch |
| 3 | [`plan-before-code`](skills/plan-before-code/SKILL.md) | Bite-sized tasks in `tasks/todo.md` |
| 4 | [`executing-plans`](skills/executing-plans/SKILL.md) | One task at a time, verify each |
| 5 | [`test-writing`](skills/test-writing/SKILL.md) | RED → GREEN → REFACTOR for every change |
| 6 | [`requesting-code-review`](skills/requesting-code-review/SKILL.md) | Self-review against plan |
| 7 | [`finishing-a-development-branch`](skills/finishing-a-development-branch/SKILL.md) | Verify + merge decision + cleanup |
| 8 | [`self-improvement`](skills/self-improvement/SKILL.md) | Log lessons, promote patterns, update memory vault |

**One command runs the whole sprint.** In Copilot Chat, `/dojo-sprint <goal>`
walks every phase above in order; `/dojo-swarm <goal>` does the same but fans
EXECUTE + TEST out to parallel sub-agents. Both are driven by
[`scripts/sprint.sh`](./scripts/sprint.sh), whose phase→skill map is the single
source of truth in [`scripts/pipeline.tsv`](./scripts/pipeline.tsv):

```bash
bash scripts/sprint.sh steps                 # print the phase → skill map
bash scripts/sprint.sh start "Fix flaky auth test"   # scaffold + checklist
bash scripts/sprint.sh finish                # run the single gate, then merge/learn
```

---

## 🥋 The Belt Quest

New to the Dojo? Train interactively. **[The Belt Quest](./docs/quests/)** is a
gamified, self-contained onboarding that takes you from **白帯 white belt** to
**黒帯 black belt** — install the framework, drill the core kata, walk the
mandatory workflow, and reach mastery.

```
⚪ 白帯 White  →  🔵 青帯 Blue  →  🟤 茶帯 Brown  →  ⚫ 黒帯 Black
 Enter the Dojo    Core Kata        The Workflow      Mastery
```

| Belt | Phase | You learn to… |
|------|-------|---------------|
| ⚪ **白帯 White** | Enter the Dojo | Install the Dojo, run `verify.sh`, explore the scaffold |
| 🔵 **青帯 Blue** | Core Kata 基本型 | Plan before code, verify before done, fix bugs autonomously |
| 🟤 **茶帯 Brown** | The Workflow | Brainstorm → worktree → plan → execute → test → review → finish |
| ⚫ **黒帯 Black** | Mastery | The single gate, memory vault, curator, MCP, contribute a skill |

A winding stone path of **23 checkpoints**, each with copy-ready commands and a
"stuck?" hint. Progress is saved locally, belts unlock in sequence, and finishing
the path earns a downloadable **black-belt certificate**. No build step, no
dependencies — one static HTML file.

**Play it:** publish via GitHub Pages (**Settings → Pages → Deploy from branch →
`main` / `/docs`**), then open `…github.io/copilot-agents-dojo/quests/`. Or open
[`docs/quests/index.html`](./docs/quests/index.html) directly in a browser.

---

## Skill Sets

- [skills/](./skills) — Core + practical skill folders (always discoverable)
- [optional-skills/](./optional-skills) — Heavy / niche skills (installed explicitly)
- [agents/](./agents) — Persona briefs + [`agents/registry.yaml`](./agents/registry.yaml)
- [skills.md](./skills.md) — Master index — generated, auto-discovered by Copilot
- [spec/](./spec) — The Copilot Skills specification (v1)
- [template/](./template) — Starter template for creating new skills

### Core Kata — 基本型

Always loaded. Behavioral skills that govern *how* agents think. Style-agnostic.

| Skill | Belt |
|---|---|
| [using-superpowers](./skills/using-superpowers/SKILL.md) | 🥋 Activate the dojo framework at session start |
| [plan-before-code](./skills/plan-before-code/SKILL.md) | 🥋 Plan multi-step work before touching code |
| [durable-work](./skills/durable-work/SKILL.md) | 🥋 Pick the board over sub-agents for cross-turn work |
| [subagent-strategy](./skills/subagent-strategy/SKILL.md) | 🥋 Delegate research, analysis, and testing to sub-agents |
| [self-improvement](./skills/self-improvement/SKILL.md) | 🥋 Capture lessons, track patterns, evolve skills |
| [verify-before-done](./skills/verify-before-done/SKILL.md) | 🥋 Prove your work with tests, logs, and diffs |
| [demand-elegance](./skills/demand-elegance/SKILL.md) | 🥋 Challenge hacky solutions (without over-engineering) |
| [autonomous-bug-fix](./skills/autonomous-bug-fix/SKILL.md) | 🥋 Reproduce → diagnose → fix → verify. Zero hand-holding. |

### Flow Waza — 流れ技

Skills that orchestrate the mandatory pipeline.

| Skill | Purpose |
|---|---|
| [brainstorming](./skills/brainstorming/SKILL.md) | Socratic design refinement before any code |
| [using-git-worktrees](./skills/using-git-worktrees/SKILL.md) | Isolated workspace for every session |
| [executing-plans](./skills/executing-plans/SKILL.md) | Dispatch and execute tasks one at a time |
| [requesting-code-review](./skills/requesting-code-review/SKILL.md) | Self-review against plan between tasks |
| [receiving-code-review](./skills/receiving-code-review/SKILL.md) | Process feedback and iterate |
| [finishing-a-development-branch](./skills/finishing-a-development-branch/SKILL.md) | Final verification + merge decision + cleanup |
| [dispatching-parallel-agents](./skills/dispatching-parallel-agents/SKILL.md) | Concurrent sub-agent work when beneficial |

### Practical Kumite — 実践組手

Task-specific skills for the most common engineering work.

| Skill | Purpose |
|-------|---------|
| [code-review](./skills/code-review/SKILL.md) | Structured review with severity-based feedback |
| [refactoring](./skills/refactoring/SKILL.md) | Safe refactoring — behavior preservation, small steps |
| [test-writing](./skills/test-writing/SKILL.md) | Meaningful tests that catch bugs, not just exist |
| [pr-workflow](./skills/pr-workflow/SKILL.md) | Clean commits, good descriptions, merge-ready PRs |
| [debugging](./skills/debugging/SKILL.md) | Systematic debugging — evidence, hypotheses, divide-and-conquer |
| [codebase-onboarding](./skills/codebase-onboarding/SKILL.md) | Rapidly understand unfamiliar codebases |
| [requirements-elicitation](./skills/requirements-elicitation/SKILL.md) | Structured elicitation, user stories, acceptance criteria, Definition of Ready gate |

### Optional Skills — 選択

Heavyweight or niche. Installed explicitly from [optional-skills/](./optional-skills).

| Skill | Purpose |
|---|---|
| [writing-skills](./optional-skills/writing-skills/SKILL.md) | SKILL.md template + spec compliance |
| [using-mcp](./optional-skills/using-mcp/SKILL.md) | Call MCP tools from inside a Copilot session |
| [calling-mcp-tools-via-subprocess](./optional-skills/calling-mcp-tools-via-subprocess/SKILL.md) | Drive MCP servers from a sub-shell |
| [building-mcp-servers](./optional-skills/building-mcp-servers/SKILL.md) | Author and ship a new MCP server |

---

## Specialized Agent Personas

Personas in [agents/](./agents), with a single source of truth in [`agents/registry.yaml`](./agents/registry.yaml). `scripts/verify.sh` blocks drift between the registry and the briefs.

| Persona | Focus |
|---|---|
| [architect](./agents/architect.md) | Generalist design — system design, impact analysis, refactoring strategy. Prefer the specialised TOGAF personas for red-thread work. |
| [business-architect](./agents/business-architect.md) | TOGAF Phase A/B — elicits and ratifies business drivers (BRs); root of the requirement cascade |
| [solution-architect](./agents/solution-architect.md) | TOGAF Phase C — derives FRs and NFRs from ratified BRs; enforces the traceability gate at Phase C → D |
| [platform-architect](./agents/platform-architect.md) | TOGAF Phase D/E — derives infrastructure (IR) and technology (TR) requirements from FRs/NFRs/SRs |
| [security-engineer](./agents/security-engineer.md) | Security compliance, vulnerability identification, secure-by-default; authors security requirements (SRs) cross-cutting Phase B–E |
| [software-engineer](./agents/software-engineer.md) | Feature development, bug fixes, production-quality code |
| [technical-program-manager](./agents/technical-program-manager.md) | Project planning, requirements, Definition of Ready |
| [test-engineer](./agents/test-engineer.md) | Test strategy, implementation, quality assurance |

---

## Single Gate, Single Sources of Truth

`scripts/verify.sh` is the only enforcement entry point. Four modes: `spec` (default), `plan`, `tests`, `all`.

| Source of truth | Generated artifact | Drift detector |
|---|---|---|
| `skills/*/SKILL.md` + `optional-skills/*/SKILL.md` frontmatter | `skills.md` | `verify.sh spec` |
| `agents/registry.yaml` | `agents/*.md` briefs | `verify.sh` persona check |
| `cli/dojo_cli/registry.py` `COMMAND_REGISTRY` | CLI help table + interactive menu | (programmatic — single tuple) |
| `.dojo/delegation.yaml` | Sub-agent knobs cited by `subagent-strategy` | manual review |
| `skills/` + `optional-skills/` folder names | `.dojo/bundled-manifest.txt` | `verify.sh` curator check |

If any source of truth changes, the gate either auto-regenerates the artifact or fails loudly. No silent drift.

---

## Helper Scripts

Everything in `scripts/` honors `${DOJO_ROOT:-…}` so it works from any cwd and supports multi-instance profiles.

| Script | Purpose |
|---|---|
| [scripts/init.sh](./scripts/init.sh) | Scaffolds `tasks/{todo,lessons}.md` on first clone |
| [scripts/verify.sh](./scripts/verify.sh) | **The single gate** — spec invariants + skills.md freshness + persona drift + path audit + curator manifest |
| [scripts/run-checks.ps1](./scripts/run-checks.ps1) | Windows parity wrapper for `verify.sh` |
| [scripts/regen-skills-index.sh](./scripts/regen-skills-index.sh) | Rebuilds `skills.md` + `.dojo/bundled-manifest.txt` from frontmatter (`.ps1` mirror included) |
| [scripts/regen-prompts.sh](./scripts/regen-prompts.sh) | Rebuilds the `.github/prompts/*.prompt.md` slash-command shims from skill + persona frontmatter (`.ps1` mirror included) |
| [scripts/sprint.sh](./scripts/sprint.sh) | **One-command pipeline orchestrator** — `steps / start / gate / finish`; drives the mandatory 8-step workflow from `pipeline.tsv` (`.ps1` mirror included) |
| [scripts/lesson-updater.sh](./scripts/lesson-updater.sh) | Cache-aware skill amendments — deferred by default, `--now` to apply immediately |
| [scripts/curator.sh](./scripts/curator.sh) | Skill lifecycle: `status / record / pin / unpin / archive / restore / transition / backup / rollback / report` (`.ps1` mirror included) |
| [scripts/curator-tick.sh](./scripts/curator-tick.sh) | Idle-gated curator trigger (interval + min-idle); `.ps1` wrapper for Windows |
| [scripts/board.sh](./scripts/board.sh) | Durable task board: `new / list / status / roll-up` |
| [scripts/link-index.sh](./scripts/link-index.sh) | Memory vault link graph + backlinks + `INDEX.md` stats |
| [scripts/memory-query.sh](./scripts/memory-query.sh) | Query memory vault by tag, type, date, status, or backlinks |
| [scripts/obsidian-sync.sh](./scripts/obsidian-sync.sh) | Promote 3+ occurrence lessons to `memory/patterns/` |
| [scripts/migrate-v1.sh](./scripts/migrate-v1.sh) | Idempotent upgrade helper for pre-v1 repos |

```bash
bash scripts/init.sh                              # initialize the dojo in your repo
bash scripts/verify.sh                            # run the single gate before any PR
bash scripts/regen-skills-index.sh                # rebuild skills.md + bundled-manifest.txt
bash scripts/board.sh new "Fix flaky auth test"   # open a durable task on the board
bash scripts/link-index.sh                        # rebuild memory vault graph
bash scripts/memory-query.sh --type pattern --recent 5
```

### Slash Commands

Every skill and persona is also exposed as a discoverable GitHub Copilot
**slash command**. `scripts/regen-prompts.sh` generates one prompt shim per
skill and per agent under `.github/prompts/`, so in Copilot Chat you can type:

```text
/dojo-debugging          # load and apply the debugging skill
/dojo-plan-before-code   # load and apply the planning skill
/dojo-agent-architect    # adopt the Architect persona
/dojo-sprint <goal>      # run the whole pipeline end to end
/dojo-swarm <goal>       # same, with parallel sub-agents for execution
```

The shims are auto-generated (never hand-edited) and kept in sync by the same
gate as `skills.md`: `verify.sh` warns on drift and `tests/test_prompts.py`
fails CI if they are stale. The two pipeline shims (`/dojo-sprint`,
`/dojo-swarm`) are generated from `scripts/pipeline.tsv`. Regenerate after
adding or renaming a skill or persona:

```bash
bash scripts/regen-prompts.sh            # write the shims
bash scripts/regen-prompts.sh --check    # CI-style drift check
```

### Requirements

- `bash` (Git for Windows works on Windows hosts) and standard POSIX tools.
- `jq` — used by `curator.sh` and `lesson-updater.sh`. On Windows: `winget install jqlang.jq`.
- Python 3.10+ (optional) for the `cli/dojo_cli/` CLI and `--profile` multi-instance support.

---

## Curator + Telemetry

`scripts/curator.sh` reads `.dojo/skill-usage.json` (gitignored), enforces an `active → stale → archived` lifecycle, and writes per-run reports + tarball backups. v1.1 ports the [hermes-agent](https://github.com/andreaswasita/hermes-agent) self-improvement pattern without adding a daemon.

```bash
bash scripts/curator.sh status                       # usage counts + state per skill
bash scripts/curator.sh pin debugging                # always-load (exempt from transitions)
bash scripts/curator.sh transition --dry-run         # age-based active → stale → archived
bash scripts/curator.sh backup --reason "pre-edit"   # tar.gz snapshot (keeps last 5)
bash scripts/curator.sh rollback --list              # show available backups
bash scripts/curator.sh report                       # markdown rollup of last run
```

**Idle-based trigger** (hermes-style — fires only when the agent is quiet):

```bash
bash scripts/curator-tick.sh                         # gated: default 168h interval, 2h idle
bash scripts/curator-tick.sh --force --dry-run       # bypass gates, preview
pwsh scripts/curator-tick.ps1                        # Windows wrapper
```

Wire it into your shell init, a pre-commit hook, or a scheduled task. Knobs live in `.dojo/curator.env` (`DOJO_CURATOR_STALE_DAYS`, `DOJO_CURATOR_ARCHIVE_DAYS`, `DOJO_CURATOR_INTERVAL_HOURS`, `DOJO_CURATOR_MIN_IDLE_HOURS`, `DOJO_CURATOR_BACKUP_KEEP`, `DOJO_CURATOR_REPORT_KEEP`).

**Three-layer provenance guard.** Bundled skills can never be auto-archived. Three checks, any of which exempts a skill from every auto-transition:

1. `created_by: human` in the SKILL.md frontmatter.
2. Folder name in `.dojo/bundled-manifest.txt` (regenerated whenever you run `regen-skills-index.sh`).
3. `pinned: true` in the usage sidecar (`bash scripts/curator.sh pin <name>`).

Only agent-authored, unpinned, un-bundled skills can ever reach `archived` — and even then, "archived" means moved to `skills/.archive/`, never deleted, and restorable via `curator.sh restore <name>` or `rollback <stamp>`.

---

## Cache-Aware Self-Improvement

Mutating `skills.md` or any `SKILL.md` mid-session invalidates Copilot's prompt cache. The dojo defends against this:

- `scripts/lesson-updater.sh` (no flag) writes proposed amendments to `.dojo/pending-amendments.md`. Apply them at session boundaries.
- `scripts/lesson-updater.sh --now` applies immediately but prints a loud warning that the cache is being blown.

---

## Multi-Instance Profiles

Working on several projects concurrently? Each profile gets its own `skills/`, `tasks/`, `.dojo/` under `~/.dojo/profiles/<name>/`:

```bash
dojo --profile work status         # uses ~/.dojo/profiles/work
dojo --profile experiment menu     # uses ~/.dojo/profiles/experiment
```

`DOJO_ROOT` is exported automatically so every shell script and the `verify.sh` gate operate on the right root.

---

## Memory Vault 🧠

The `memory/` directory is the agent's **persistent knowledge graph** — structured, linked, and queryable. It replaces flat-file memory with the capabilities that make tools like Obsidian powerful, implemented as plain markdown + scripts any agent can use.

### What it replaces

| Obsidian feature | Dojo equivalent |
|---|---|
| Wikilinks + graph view | `scripts/link-index.sh` → `.link-graph.json` + auto-backlinks |
| Dataview queries | `scripts/memory-query.sh --type --tag --backlinks-for` |
| Backlinks pane | Auto-generated `## Backlinks` sections in each file |
| Tags | YAML frontmatter `tags:` array, queryable via memory-query |
| MOC (Map of Content) | `memory/INDEX.md` with auto-updated stats |

### Vault structure

```
memory/
├── INDEX.md              ← Map of Content (agents read this first)
├── .link-graph.json      ← Machine-readable link graph (auto-generated)
├── decisions/            ← Architectural decisions with context & rationale
├── patterns/             ← Proven rules promoted from lessons (3+ occurrences)
├── preferences/          ← User behavioral preferences (learned over time)
└── sessions/             ← Session summaries linking to everything above
```

### The learning loop

1. **Observe** — After every correction, log a structured lesson in `tasks/lessons.md` with YAML tags (error type, root cause, fix, rule).
2. **Store** — Lessons are tagged and queryable. Metrics track total lessons, recurring patterns, and amendment rate.
3. **Promote** — When a pattern hits 3+ occurrences, `scripts/obsidian-sync.sh` promotes it to `memory/patterns/` as a proven rule.
4. **Decide** — Architectural choices are recorded in `memory/decisions/` with context, alternatives, and consequences.
5. **Learn** — User preferences accumulate in `memory/preferences/` with confidence levels that grow over time.
6. **Link** — `scripts/link-index.sh` rebuilds the knowledge graph — backlinks, forward links, and `memory/.link-graph.json`.
7. **Query** — Agents search memory with `scripts/memory-query.sh` instead of re-reading every file.
8. **Amend** — Proven patterns feed amendments into `skills.md` via `scripts/lesson-updater.sh`.
9. **Rollback** — Failed fixes get rolled back immediately. Failed rules get revised or removed.

All files use **relative markdown links** (not wikilinks) and **YAML frontmatter** for metadata — standards any agent can parse. Zero dependencies on Obsidian or any external tool.

### Obsidian compatibility

The `memory/` directory is also a **real Obsidian vault**. Open the folder in Obsidian and the native graph view + backlinks pane just work — color groups match the Control Plane theme (decisions cyan, patterns indigo, preferences amber, sessions emerald). See [`memory/README.md`](memory/README.md) for details.

### MCP memory server

Any MCP-capable agent (Claude Code, Copilot CLI, Cursor, VS Code) can read and write the vault via tool calls. The `@dojo/mcp-memory` package exposes:

- **10 tools** — `memory_list`, `memory_search`, `memory_get`, `memory_create`, `memory_link`, `memory_supersede`, `memory_history`, `memory_recent_sessions`, `memory_decisions_active`, `memory_patterns_for_context`
- **2 resource types** — `memory://INDEX` (the Map of Content) and `memory://{type}/{slug}` (one resource per entry)
- **Session auto-resume** — installed `copilot-instructions.md` instructs agents to call `memory_recent_sessions` + `memory_decisions_active` on startup and `memory_create({type:'session'})` on completion

Install the Control Plane's MCP wiring with the **🔌 Wire MCP memory server** toggle on the Install page, or copy a sample config from [`control-plane/packages/mcp-memory/examples/`](control-plane/packages/mcp-memory/examples/). Full reference: [`docs/memory-mcp.md`](docs/memory-mcp.md).

### Time Machine 🕰

The Control Plane exposes git history as a first-class UI. On any memory entry, click **🕰 Time Machine** to scrub commits, preview a prior version, and restore it (auto-commits with audit trail). The Memory Browser also has a vault-wide **🕰 Time Slider** that filters cards + graph to the vault state at any chosen commit.

---

## Why Train Your Agents?

Untrained agents:

- Rush in without a plan — all offense, no strategy
- Never learn from their losses
- Throw sloppy patches instead of finding the root cause
- Declare victory without proof
- Flood the context window like an undisciplined sparring partner

Trained agents operate like **seasoned black belts** — plan the approach, execute with precision, verify the outcome, learn from every round.

---

## Enter the Dojo

> 🥋 **New here? Walk the [Belt Quest](./docs/quests/) first** — the gamified
> onboarding ([see above](#-the-belt-quest)). Prefer to dive straight in? Install below.

### One command (recommended)

Drop the whole framework into the current repo — no clone, no Python:

```bash
# macOS / Linux
curl -fsSL https://raw.githubusercontent.com/andreaswasita/copilot-agents-dojo/main/install.sh | bash
```

```powershell
# Windows (PowerShell)
irm https://raw.githubusercontent.com/andreaswasita/copilot-agents-dojo/main/install.ps1 | iex
```

The installer is **re-runnable and idempotent**: it refreshes the bundled
skills, agents, scripts, and spec while preserving your own additions —
`tasks/`, `memory/`, custom skills, and an edited
`.github/copilot-instructions.md` (a differing dojo version is written to
`.github/copilot-instructions.dojo.md` for you to merge). It finishes by
running `scripts/verify.sh spec` as a health gate.

Pin a release for reproducible installs, and pass options as needed:

```bash
# bash: --ref <branch|tag>  --dir <path>  --force  --no-verify
curl -fsSL https://raw.githubusercontent.com/andreaswasita/copilot-agents-dojo/main/install.sh | bash -s -- --ref v1.1
```

```powershell
# PowerShell flags: -Ref <branch|tag>  -Dir <path>  -Force  -NoVerify
# When piping (irm | iex) set env vars instead: $env:DOJO_REF='v1.1'; irm .../install.ps1 | iex
```

### Install as a Copilot CLI plugin

If you live in the [GitHub Copilot CLI](https://docs.github.com/copilot/how-tos/use-copilot-agents/use-copilot-cli),
the dojo ships as a plugin you can install from its built-in marketplace — the
25 core skills land in your Copilot CLI, no repo files required:

```shell
copilot plugin marketplace add andreaswasita/copilot-agents-dojo
copilot plugin install dojo@copilot-agents-dojo
```

Verify and manage it like any other plugin:

```shell
copilot plugin list            # confirm "dojo@copilot-agents-dojo"
copilot plugin update dojo     # pull the latest skills
copilot plugin uninstall dojo  # remove it
```

The plugin scope is the **core** discipline skills (`skills/`). The optional
tiers (`optional-skills/`) stay opt-in and are delivered through the installer
or manual setup above — keeping the dojo's "core always, optional by choice"
contract intact.

### Manual setup

Prefer to wire it up by hand? The steps the installer automates are:

1. **Copy** [`skills/`](./skills) and [`optional-skills/`](./optional-skills) into your repo — or pick the individual tiers you need.
2. **Copy** [`memory/`](./memory) — the persistent knowledge graph.
3. **Place** [`skills.md`](./skills.md) at your repo root — Copilot agents auto-discover this index.
4. **Place** [`.github/copilot-instructions.md`](./.github/copilot-instructions.md) in your `.github/` folder — customize for your stack.
5. **Run** `bash scripts/init.sh` — scaffolds `tasks/todo.md` and `tasks/lessons.md`.
6. **Run** `bash scripts/regen-skills-index.sh` — rebuilds `skills.md` and primes `.dojo/bundled-manifest.txt`.
7. **Run** `bash scripts/link-index.sh` — initializes the memory vault graph.
8. **Run** `bash scripts/verify.sh spec` — confirms the skill index, personas, and scripts are wired correctly.
9. **Author** your own skills from [`template/SKILL.md`](./template/SKILL.md) — guidance lives in [`optional-skills/writing-skills`](./optional-skills/writing-skills/SKILL.md).

Upgrading from pre-v1? Run `bash scripts/migrate-v1.sh` for the idempotent migration helper.

---

## The Dojo Layout

```
your-repo/
├── skills.md                          # Skills index (auto-generated, auto-discovered)
├── skills/                            # Core + practical tiers
│   ├── using-superpowers/             # 🥋 Activator (loaded first)
│   ├── plan-before-code/              # 🥋 Core Kata
│   ├── durable-work/                  # 🥋 Core Kata
│   ├── subagent-strategy/             # 🥋 Core Kata
│   ├── self-improvement/              # 🥋 Core Kata
│   ├── verify-before-done/            # 🥋 Core Kata
│   ├── demand-elegance/               # 🥋 Core Kata
│   ├── autonomous-bug-fix/            # 🥋 Core Kata
│   ├── brainstorming/                 # 🔄 Flow Waza
│   ├── using-git-worktrees/           # 🔄 Flow Waza
│   ├── executing-plans/               # 🔄 Flow Waza
│   ├── requesting-code-review/        # 🔄 Flow Waza
│   ├── receiving-code-review/         # 🔄 Flow Waza
│   ├── finishing-a-development-branch/# 🔄 Flow Waza
│   ├── dispatching-parallel-agents/   # 🔄 Flow Waza
│   ├── code-review/                   # ⚔️ Practical Kumite
│   ├── refactoring/                   # ⚔️ Practical Kumite
│   ├── test-writing/                  # ⚔️ Practical Kumite
│   ├── pr-workflow/                   # ⚔️ Practical Kumite
│   ├── debugging/                     # ⚔️ Practical Kumite
│   ├── codebase-onboarding/           # ⚔️ Practical Kumite
│   └── requirements-elicitation/      # ⚔️ Practical Kumite
├── optional-skills/                   # Heavyweight / niche (install explicitly)
│   ├── writing-skills/                # 🧘 Meta dō
│   ├── using-mcp/                     # 🧘 Meta dō
│   ├── calling-mcp-tools-via-subprocess/
│   └── building-mcp-servers/
├── agents/                            # Persona briefs + registry
│   ├── registry.yaml                  # Single source of truth
│   ├── architect.md
│   ├── security-engineer.md
│   ├── software-engineer.md
│   ├── technical-program-manager.md
│   └── test-engineer.md
├── memory/                            # 🧠 Persistent knowledge graph (Obsidian vault)
│   ├── INDEX.md                       # Map of Content
│   ├── .link-graph.json               # Machine-readable graph
│   ├── decisions/                     # ADRs
│   ├── patterns/                      # Proven rules (3+ occurrences)
│   ├── preferences/                   # Learned user preferences
│   └── sessions/                      # Session summaries
├── spec/
│   └── copilot-skills-spec.md         # Skill format specification (v1)
├── template/
│   └── SKILL.md                       # Starter template
├── .dojo/                             # Per-clone state (gitignored except manifest)
│   ├── bundled-manifest.txt           # Provenance guard for the curator
│   ├── skill-usage.json               # Curator telemetry sidecar
│   ├── curator-backups/               # tar.gz snapshots (rolling)
│   ├── logs/curator/                  # Per-run audit reports
│   └── curator.env                    # Optional curator knob overrides
├── .github/
│   ├── copilot-instructions.md        # The Dojo Rules
│   └── workflows/
│       └── dojo-enforce.yml           # PR enforcement
├── scripts/
│   ├── init.sh                        # First-clone scaffolding
│   ├── verify.sh                      # Single enforcement gate
│   ├── regen-skills-index.sh          # skills.md + bundled-manifest
│   ├── curator.sh                     # Skill lifecycle
│   ├── curator-tick.sh                # Idle-based curator trigger
│   ├── lesson-updater.sh              # Cache-aware amendments
│   ├── board.sh                       # Durable task board
│   ├── link-index.sh                  # Memory vault graph builder
│   ├── memory-query.sh                # Memory vault query tool
│   └── obsidian-sync.sh               # Lesson → pattern promotion
└── tasks/
    ├── todo.md                        # Battle plan
    └── lessons.md                     # Defeat log, metrics & prevention rules
```

---

## Choose Your Fighting Style

The Code Standards in `copilot-instructions.md` ship with examples for multiple stacks. Pick your style. Delete the others. The disciplines are **style-agnostic**.

- 📘 **TypeScript** — strict mode, Vitest, Tailwind, Next.js App Router
- 🐍 **Python** — pytest, Black, type hints, FastAPI / Django
- ☕ **Java** — JUnit 5, Spring Boot, Maven / Gradle
- 🐹 **Go** — standard library, table-driven tests
- 🛡️ **.NET** — xUnit, clean architecture, nullable reference types

---

## Origin Story

The Copilot Agents Dojo distills field-tested patterns from shipping production code with AI agents — watching them fail, and figuring out what actually makes them reliable:

- **Field experience** — Real-world agent sessions exposing failure modes: rushing without plans, skipping verification, repeating the same mistakes, flooding the context window. Every core kata exists because an agent failed without it.
- **[hermes-agent](https://github.com/andreaswasita/hermes-agent)** — The reference build for spec v1, the curator pattern (state machine, backups, idle trigger), durable boards, and the registry-driven CLI.
- **[Copilot Cowork Dojo](https://github.com/andreaswasita/copilot-cowork-dojo)** — The sibling project for AI **coworkers**; this one trains AI **builders**.
- **[obra/superpowers](https://github.com/obra/superpowers)** — The mandatory orchestration pipeline (BRAINSTORM → WORKTREE → … → LEARN) proving disciplined agents outperform freestyle ones.
- **[Anthropic Claude](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering)** — Structured prompting, progressive disclosure, explicit verification gates.

---

## Contributing

See [AGENTS.md](./AGENTS.md) for the contributor guide and [CONTRIBUTING.md](./CONTRIBUTING.md) for the high-level checklist. Keep contributions on-brand with the [brand & style guide](./docs/brand.md) — palette, wordmark, voice/tone. Changelog: [CHANGELOG.md](./CHANGELOG.md).

## License

[MIT](./LICENSE)
