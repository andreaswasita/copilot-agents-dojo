<div align="center">

# Copilot Agents Dojo 🏯

# A discipline framework for<br/>your GitHub Copilot agents.

---

*End-to-end framework to take AI agents from improvised assistants to disciplined, measurable, repeatable engineering partners.*

[**📖 Wiki**](../../wiki) · [**Start Here**](#enter-the-dojo) · [**Quickstart**](#enter-the-dojo) · [**Skills**](./skills.md) · [**Agents**](./agents) · [**Spec**](./spec/copilot-skills-spec.md) · [**Contributor Guide**](./AGENTS.md)

![license](https://img.shields.io/badge/license-MIT-1f6feb?style=flat-square)
![version](https://img.shields.io/badge/version-1.0-3fb950?style=flat-square)
![spec](https://img.shields.io/badge/spec-v1-1f6feb?style=flat-square)
![skills](https://img.shields.io/badge/skills-26-d2691e?style=flat-square)
![tiers](https://img.shields.io/badge/tiers-core%20%2F%20practical%20%2F%20optional-8b5cf6?style=flat-square)
![agents](https://img.shields.io/badge/personas-5-14b8a6?style=flat-square)
![gate](https://img.shields.io/badge/enforcement-verify.sh-ec4899?style=flat-square)

---

</div>

> *Your AI agents are untrained. Time to put them through the dojo.*

A **skills & discipline framework for GitHub Copilot agents** — for the engineers who *build with* Copilot every day to plan, code, test, review, ship, and learn alongside autonomous tooling.

Where the [Copilot Cowork Dojo](https://github.com/andreaswasita/copilot-cowork-dojo) trains AI **coworkers** for knowledge work, this dojo trains AI **builders**: software engineers, architects, TPMs, security engineers, and test engineers running Copilot in their IDE, terminal, and CI.

Drop `skills/` + `optional-skills/` + `.github/copilot-instructions.md` into any repo → Copilot agents auto-discover the index and follow the workflow. Run `bash scripts/verify.sh` as the single gate in CI or pre-PR.

Includes:
- **23 production skills** (6 core kata + 7 flow waza + 7 practical kumite + 3 meta dō)
- Mandatory **BRAINSTORM → PLAN → TDD → REVIEW → FINISH** pipeline
- **Memory vault** — persistent, linked knowledge graph (replaces flat-file memory)
- Git worktree isolation
- Self-improving `tasks/lessons.md` → promoted to `memory/patterns/`
- `scripts/verify.sh` enforcement gates
- GitHub Actions PR enforcement

## The Mandatory Workflow

Every non-trivial task follows this pipeline — no skipping, no improvising:

```
BRAINSTORM → WORKTREE → PLAN → EXECUTE → TEST → REVIEW → FINISH → LEARN
```

| Step | Skill | What Happens |
|------|-------|-------------|
| 1 | [`brainstorming`](skills/brainstorming/SKILL.md) | Socratic refinement → approved design |
| 2 | [`using-git-worktrees`](skills/using-git-worktrees/SKILL.md) | Isolated workspace on feature branch |
| 3 | [`plan-before-code`](skills/plan-before-code/SKILL.md) | Bite-sized tasks in `tasks/todo.md` |
| 4 | [`executing-plans`](skills/executing-plans/SKILL.md) | One task at a time, verify each |
| 5 | [`test-writing`](skills/test-writing/SKILL.md) | RED-GREEN-REFACTOR for every change |
| 6 | [`requesting-code-review`](skills/requesting-code-review/SKILL.md) | Self-review against plan |
| 7 | [`finishing-a-development-branch`](skills/finishing-a-development-branch/SKILL.md) | Verify + merge decision + cleanup |
| 8 | [`self-improvement`](skills/self-improvement/SKILL.md) | Log lessons, promote patterns, update memory vault |

## Skill Sets

- [skills/](./skills) — Core + practical skill folders (always discoverable)
- [optional-skills/](./optional-skills) — Heavy / niche skills (installed explicitly)
- [agents/](./agents) — Persona briefs + [`agents/registry.yaml`](./agents/registry.yaml)
- [skills.md](./skills.md) — Master index — generated, auto-discovered by Copilot
- [spec/](./spec) — The Copilot Skills specification (v1)
- [template/](./template) — Starter template for creating new skills

---

## Core Kata — 基本型

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

## Flow Waza — 流れ技

Skills that orchestrate the mandatory pipeline.

| Skill | |
|---|---|
| [brainstorming](./skills/brainstorming/SKILL.md) | Socratic design refinement before any code |
| [using-git-worktrees](./skills/using-git-worktrees/SKILL.md) | Isolated workspace for every session |
| [executing-plans](./skills/executing-plans/SKILL.md) | Dispatch and execute tasks one at a time |
| [requesting-code-review](./skills/requesting-code-review/SKILL.md) | Self-review against plan between tasks |
| [receiving-code-review](./skills/receiving-code-review/SKILL.md) | Process feedback and iterate |
| [finishing-a-development-branch](./skills/finishing-a-development-branch/SKILL.md) | Final verification + merge decision + cleanup |
| [dispatching-parallel-agents](./skills/dispatching-parallel-agents/SKILL.md) | Concurrent sub-agent work when beneficial |

## Practical Kumite — 実践組手

Task-specific skills for the most common engineering work.

| Skill | Purpose |
|-------|---------|
| [`code-review`](skills/code-review/SKILL.md) | Structured review with severity-based feedback |
| [`refactoring`](skills/refactoring/SKILL.md) | Safe refactoring — behavior preservation, small steps |
| [`test-writing`](skills/test-writing/SKILL.md) | Meaningful tests that catch bugs, not just exist |
| [`pr-workflow`](skills/pr-workflow/SKILL.md) | Clean commits, good descriptions, merge-ready PRs |
| [`debugging`](skills/debugging/SKILL.md) | Systematic debugging — evidence, hypotheses, divide-and-conquer |
| [`codebase-onboarding`](skills/codebase-onboarding/SKILL.md) | Rapidly understand unfamiliar codebases |
| [`requirements-elicitation`](skills/requirements-elicitation/SKILL.md) | Structured elicitation, user stories, acceptance criteria, Definition of Ready gate |

## Optional Skills — 選択

Heavyweight or niche. Installed explicitly from [optional-skills/](./optional-skills).

| Skill | |
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
| [architect](./agents/architect.md) | System design, technical strategy, impact analysis, traceability |
| [security-engineer](./agents/security-engineer.md) | Security compliance, vulnerability identification, secure-by-default |
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

If any source of truth changes, the gate either auto-regenerates the artifact or fails loudly. No silent drift.

---

## Helper Scripts

Everything in `scripts/` honors `${DOJO_ROOT:-…}` so it works from any cwd and supports multi-instance profiles.

| Script | Purpose |
|---|---|
| [scripts/init.sh](./scripts/init.sh) | Scaffolds `tasks/{todo,lessons}.md` on first clone |
| [scripts/verify.sh](./scripts/verify.sh) | **The single gate** — spec invariants + skills.md freshness + persona drift + path audit |
| [scripts/run-checks.ps1](./scripts/run-checks.ps1) | Windows parity wrapper for `verify.sh` |
| [scripts/regen-skills-index.sh](./scripts/regen-skills-index.sh) | Rebuilds `skills.md` from frontmatter (`.ps1` mirror included) |
| [scripts/lesson-updater.sh](./scripts/lesson-updater.sh) | Cache-aware skill amendments — deferred by default, `--now` to apply immediately |
| [scripts/curator.sh](./scripts/curator.sh) | Skill lifecycle: `status / record / pin / unpin / archive / restore / prune / report` (`.ps1` mirror included) |
| [scripts/board.sh](./scripts/board.sh) | Durable task board: `new / list / status / roll-up` |
| [scripts/migrate-v1.sh](./scripts/migrate-v1.sh) | Idempotent upgrade helper for pre-v1 repos |

```bash
# Initialize the dojo in your repo
bash scripts/init.sh

# Run all gates before submitting a PR (use scripts/run-checks.ps1 on Windows)
bash scripts/verify.sh

# Rebuild the skills index after adding or renaming skills
bash scripts/regen-skills-index.sh

# Open a new durable task on the board
bash scripts/board.sh new "Fix flaky auth test"
```

### Requirements

- `bash` (Git for Windows works on Windows hosts) and standard POSIX tools.
- `jq` — used by `curator.sh` and `lesson-updater.sh`. On Windows: `winget install jqlang.jq`.
- Python 3.10+ (optional) for the `cli/dojo_cli/` CLI and `--profile` multi-instance support.

---

## Curator + Telemetry

`scripts/curator.sh` reads `.dojo/skill-usage.json` (gitignored) and keeps the tier list honest.

| Agent | Focus Area |
|-------|-----------|
| [`architect.md`](agents/architect.md) | System design, technical strategy, and the engineering half of requirements — impact analysis, specification, traceability |
| [`security-engineer.md`](agents/security-engineer.md) | Security compliance, vulnerability identification, and secure practices |
| [`software-engineer.md`](agents/software-engineer.md) | Feature development, bug fixes, and production-quality code |
| [`technical-program-manager.md`](agents/technical-program-manager.md) | Project planning, timeline coordination, and the business half of requirements — elicitation, user stories, Definition of Ready gate |
| [`test-engineer.md`](agents/test-engineer.md) | Test strategy, test implementation, and quality assurance |

## Cache-Aware Self-Improvement

Mutating `skills.md` or any `SKILL.md` mid-session invalidates Copilot's prompt cache. The dojo defends against this:

- `scripts/lesson-updater.sh` (no flag) writes proposed amendments to `.dojo/pending-amendments.md`. Apply them at session boundaries.
- `scripts/lesson-updater.sh --now` applies immediately but prints a loud warning that the cache is being blown.

| Script | Purpose |
|--------|---------|
| [`scripts/init.sh`](scripts/init.sh) | Scaffolds `tasks/todo.md` and `tasks/lessons.md` on first clone |
| [`scripts/lesson-updater.sh`](scripts/lesson-updater.sh) | Scans lessons for recurring patterns (3+), proposes skill amendments |
| [`scripts/verify.sh`](scripts/verify.sh) | Pre-PR verification: tests, clean tree, plan check |
| [`scripts/link-index.sh`](scripts/link-index.sh) | Builds memory vault link graph, backlinks, and INDEX.md stats |
| [`scripts/memory-query.sh`](scripts/memory-query.sh) | Query memory by tag, type, date, status, or backlinks |
| [`scripts/obsidian-sync.sh`](scripts/obsidian-sync.sh) | Promotes 3+ occurrence lessons to `memory/patterns/` |

```bash
dojo --profile work status         # uses ~/.dojo/profiles/work
dojo --profile experiment menu     # uses ~/.dojo/profiles/experiment
```

`DOJO_ROOT` is exported automatically so every shell script and the `verify.sh` gate operate on the right root.

# Verify before submitting a PR
bash scripts/verify.sh

# Rebuild memory vault link graph
bash scripts/link-index.sh

# Query memory vault
bash scripts/memory-query.sh --type pattern --recent 5
bash scripts/memory-query.sh --tag architecture
bash scripts/memory-query.sh --backlinks-for decisions/chose-postgres.md

# Promote lessons to memory vault
bash scripts/obsidian-sync.sh
```

## Enter the Dojo

1. Copy [`skills/`](./skills) and [`optional-skills/`](./optional-skills) into your repo — or pick the individual tiers you need.
2. Place [`skills.md`](./skills.md) at your repo root — Copilot agents auto-discover this index.
3. Place [`.github/copilot-instructions.md`](./.github/copilot-instructions.md) in your `.github/` folder — customize for your stack.
4. Run `bash scripts/init.sh` — scaffolds `tasks/todo.md` and `tasks/lessons.md`.
5. Run `bash scripts/verify.sh spec` — confirms the skill index, personas, and scripts are wired correctly.
6. Author your own skills from [template/SKILL.md](./template/SKILL.md) — guidance lives in [optional-skills/writing-skills](./optional-skills/writing-skills/SKILL.md).

---

## Choose Your Fighting Style

1. **Observe**: After every correction, log a structured lesson in `tasks/lessons.md` with YAML tags (error type, root cause, fix, rule).
2. **Store**: Lessons are tagged and queryable. Metrics track total lessons, recurring patterns, and amendment rate.
3. **Promote**: When a pattern hits 3+ occurrences, `scripts/obsidian-sync.sh` promotes it to `memory/patterns/` as a proven rule.
4. **Decide**: Architectural choices are recorded in `memory/decisions/` with context, alternatives, and consequences.
5. **Learn**: User preferences accumulate in `memory/preferences/` with confidence levels that grow over time.
6. **Link**: `scripts/link-index.sh` rebuilds the knowledge graph — backlinks, forward links, and `memory/.link-graph.json`.
7. **Query**: Agents search memory with `scripts/memory-query.sh` instead of re-reading every file.
8. **Amend**: Proven patterns feed amendments into `skills.md` via `scripts/lesson-updater.sh`.
9. **Rollback**: Failed fixes get rolled back immediately. Failed rules get revised or removed.

## Memory Vault 🧠

The `memory/` directory is the agent's **persistent knowledge graph** — structured, linked, and queryable. It replaces flat-file memory with the capabilities that make tools like Obsidian powerful, implemented as plain markdown + scripts that any agent can use.

### What It Replaces

| Obsidian Feature | Dojo Equivalent |
|-----------------|----------------|
| Wikilinks + graph view | `scripts/link-index.sh` → `.link-graph.json` + auto-backlinks |
| Dataview queries | `scripts/memory-query.sh --type --tag --backlinks-for` |
| Backlinks pane | Auto-generated `## Backlinks` sections in each file |
| Tags | YAML frontmatter `tags:` array, queryable via memory-query |
| MOC (Map of Content) | `memory/INDEX.md` with auto-updated stats |

### Vault Structure

```
memory/
├── INDEX.md              ← Map of Content (agents read this first)
├── .link-graph.json      ← Machine-readable link graph (auto-generated)
├── decisions/            ← Architectural decisions with context & rationale
│   └── _template.md
├── patterns/             ← Proven rules promoted from lessons (3+ occurrences)
│   └── _template.md
├── preferences/          ← User behavioral preferences (learned over time)
│   └── _template.md
└── sessions/             ← Session summaries linking to everything above
    └── _template.md
```

### How It Works

1. **Session start**: Agent reads `memory/INDEX.md` to understand stored knowledge
2. **During work**: Agent queries memory with `scripts/memory-query.sh` for relevant context
3. **After corrections**: Agent logs lessons in `tasks/lessons.md` (short-term capture)
4. **On promotion**: When lessons hit 3+ occurrences, `scripts/obsidian-sync.sh` promotes them to `memory/patterns/`
5. **Session end**: Agent writes `memory/sessions/` summary, records decisions and preferences
6. **Graph rebuild**: `scripts/link-index.sh` updates backlinks, stats, and `.link-graph.json`

All files use **relative markdown links** (not wikilinks) and **YAML frontmatter** for metadata — standards any agent can parse. Zero dependencies on Obsidian or any external tool.

### Obsidian compatibility

The `memory/` directory is also a **real Obsidian vault**. Open the folder in Obsidian.app and the native graph view + backlinks pane just work — color groups match the Control Plane theme (decisions cyan, patterns indigo, preferences amber, sessions emerald). See [`memory/README.md`](memory/README.md) for details.

### MCP memory server

Any MCP-capable agent (Claude Code, Copilot CLI, Cursor, VS Code) can read and write the vault via tool calls. The `@dojo/mcp-memory` package exposes:

- **10 tools** — `memory_list`, `memory_search`, `memory_get`, `memory_create`, `memory_link`, `memory_supersede`, `memory_history`, `memory_recent_sessions`, `memory_decisions_active`, `memory_patterns_for_context`
- **2 resource types** — `memory://INDEX` (the Map of Content) and `memory://{type}/{slug}` (one resource per entry)
- **Session auto-resume** — installed `copilot-instructions.md` instructs agents to call `memory_recent_sessions` + `memory_decisions_active` on startup and `memory_create({type:'session'})` on completion

Install the Control Plane's MCP wiring with the **🔌 Wire MCP memory server** toggle on the Install page, or copy a sample config from [`control-plane/packages/mcp-memory/examples/`](control-plane/packages/mcp-memory/examples/). Full reference: [`docs/memory-mcp.md`](docs/memory-mcp.md).

### Time Machine 🕰

The Control Plane exposes git history as a first-class UI. On any memory entry, click **🕰 Time Machine** to scrub commits, preview a prior version, and restore it (auto-commits with audit trail). The Memory Browser also has a vault-wide **🕰 Time Slider** that filters cards + graph to the vault state at any chosen commit.

## Why Train Your Agents?

Untrained agents:

- Rush in without a plan — all offense, no strategy
- Never learn from their losses
- Throw sloppy patches instead of finding the root cause
- Declare victory without proof
- Flood the context window like an undisciplined sparring partner

Trained agents operate like **seasoned black belts** — plan the approach, execute with precision, verify the outcome, learn from every round.

## Enter the Dojo

1. **Copy the `skills/` folder** into your repo — or pick individual skills you need
2. **Copy the `memory/` folder** into your repo — the persistent knowledge graph
3. **Place `skills.md` at your repo root** — Copilot agents auto-discover this index and activate skills
4. **Place `.github/copilot-instructions.md`** in your `.github/` folder — customize for your stack
5. **Run `bash scripts/init.sh`** — scaffolds `tasks/todo.md` and `tasks/lessons.md`
6. **Run `bash scripts/link-index.sh`** — initializes the memory vault graph
7. **Create custom skills** — Use `template/SKILL.md` or the `skill-creator` skill for your team's workflows

## The Dojo Layout

```
your-repo/
├── skills.md                          # Skills index (auto-discovered)
├── skills/
│   ├── plan-before-code/
│   │   └── SKILL.md                   # 🥋 Core Kata
│   ├── subagent-strategy/
│   │   └── SKILL.md                   # 🥋 Core Kata
│   ├── self-improvement/
│   │   ├── SKILL.md                   # 🥋 Core Kata
│   │   └── examples/
│   │       └── lesson-entry.md        # Worked example
│   ├── verify-before-done/
│   │   └── SKILL.md                   # 🥋 Core Kata
│   ├── demand-elegance/
│   │   └── SKILL.md                   # 🥋 Core Kata
│   ├── autonomous-bug-fix/
│   │   └── SKILL.md                   # 🥋 Core Kata
│   ├── brainstorming/
│   │   └── SKILL.md                   # 🔄 Flow Waza
│   ├── using-git-worktrees/
│   │   └── SKILL.md                   # 🔄 Flow Waza
│   ├── executing-plans/
│   │   └── SKILL.md                   # 🔄 Flow Waza
│   ├── requesting-code-review/
│   │   └── SKILL.md                   # 🔄 Flow Waza
│   ├── receiving-code-review/
│   │   └── SKILL.md                   # 🔄 Flow Waza
│   ├── finishing-a-development-branch/
│   │   └── SKILL.md                   # 🔄 Flow Waza
│   ├── dispatching-parallel-agents/
│   │   └── SKILL.md                   # 🔄 Flow Waza
│   ├── code-review/
│   │   └── SKILL.md                   # ⚔️ Practical Kumite
│   ├── refactoring/
│   │   └── SKILL.md                   # ⚔️ Practical Kumite
│   ├── test-writing/
│   │   └── SKILL.md                   # ⚔️ Practical Kumite
│   ├── pr-workflow/
│   │   └── SKILL.md                   # ⚔️ Practical Kumite
│   ├── debugging/
│   │   └── SKILL.md                   # ⚔️ Practical Kumite
│   ├── codebase-onboarding/
│   │   └── SKILL.md                   # ⚔️ Practical Kumite
│   ├── requirements-elicitation/
│   │   └── SKILL.md                   # ⚔️ Practical Kumite
│   ├── skill-creator/
│   │   └── SKILL.md                   # 🧘 Meta Dō
│   ├── writing-skills/
│   │   └── SKILL.md                   # 🧘 Meta Dō
│   └── using-superpowers/
│       └── SKILL.md                   # 🧘 Meta Dō (Activator)
├── memory/                            # 🧠 Persistent Knowledge Graph
│   ├── INDEX.md                       # Map of Content — agents read first
│   ├── .link-graph.json               # Machine-readable link graph
│   ├── decisions/                     # Architectural decision records
│   │   └── _template.md
│   ├── patterns/                      # Proven rules (promoted from lessons)
│   │   └── _template.md
│   ├── preferences/                   # Learned user preferences
│   │   └── _template.md
│   └── sessions/                      # Session summaries with links
│       └── _template.md
├── spec/
│   └── copilot-skills-spec.md         # Skill format specification
├── template/
│   └── SKILL.md                       # Starter template
├── .github/
│   ├── copilot-instructions.md        # The Dojo Rules
│   └── workflows/
│       └── dojo-enforce.yml           # PR enforcement
├── scripts/
│   ├── init.sh                        # Dojo initialization
│   ├── lesson-updater.sh              # Pattern scanner & amendment proposer
│   ├── verify.sh                      # Pre-PR verification
│   ├── link-index.sh                  # Memory vault graph builder
│   ├── memory-query.sh                # Memory vault query tool
│   └── obsidian-sync.sh               # Lesson → pattern promotion
└── tasks/
    ├── todo.md                        # Battle plan
    └── lessons.md                     # Defeat log, metrics & prevention rules
```

## Choose Your Fighting Style

The Code Standards in `copilot-instructions.md` ship with examples for multiple stacks:

- **TypeScript** 📘: strict mode, Vitest, Tailwind, Next.js App Router
- **Python** 🐍: pytest, Black, type hints, FastAPI/Django
- **Java** ☕: JUnit 5, Spring Boot, Maven/Gradle
- **Go** 🐹: standard library, table-driven tests
- **.NET** 🛡️: xUnit, clean architecture, nullable reference types

Pick your style. Delete the others. The Six Disciplines are **style-agnostic**.

## Origin Story

The Copilot Agents Dojo distills field-tested patterns from shipping production code with AI agents — watching them fail, and figuring out what actually makes them reliable:

- **Field experience** — Real-world agent sessions exposing failure modes: rushing without plans, skipping verification, repeating the same mistakes, flooding the context window. Every core kata exists because an agent failed without it.
- **[hermes-agent](https://github.com/andreaswasita/hermes-agent)** — The reference build for spec v1, the curator pattern, durable boards, and the registry-driven CLI.
- **[obra/superpowers](https://github.com/obra/superpowers)** — The mandatory orchestration pipeline (BRAINSTORM → WORKTREE → … → LEARN) proving disciplined agents outperform freestyle ones.
- **[Anthropic Claude](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering)** — Structured prompting, progressive disclosure, explicit verification gates.

---

## Contributing

See [AGENTS.md](./AGENTS.md) for the contributor guide and [CONTRIBUTING.md](./CONTRIBUTING.md) for the high-level checklist.

## License

[MIT](./LICENSE)

⭐ Star this dojo if you're done babysitting your AI agents. Fork it, train your agents, earn your belt.
