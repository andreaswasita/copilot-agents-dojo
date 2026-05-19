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

> 🆕 **New here?** Run `bash scripts/init.sh` after cloning to scaffold `tasks/`. Then `bash scripts/verify.sh spec` to confirm everything is wired.
>
> ℹ️ Upgrading from a pre-v1 layout? Run [`bash scripts/migrate-v1.sh`](./scripts/migrate-v1.sh). See [`CHANGELOG.md`](./CHANGELOG.md) for the v1.0 release notes.

## Includes

- 26 production skills across three tiers (8 core kata + 14 practical kumite + 4 optional)
- Mandatory **BRAINSTORM → WORKTREE → PLAN → EXECUTE → TEST → REVIEW → FINISH → LEARN** pipeline
- Single source of truth for skills (`skills.md`), personas (`agents/registry.yaml`), CLI commands (`cli/dojo_cli/registry.py`), and delegation knobs (`.dojo/delegation.yaml`)
- Single gate — `scripts/verify.sh` enforces spec invariants, skill-index freshness, persona drift, and `DOJO_ROOT` hygiene
- Durable work board — `tasks/board/` + `scripts/board.sh` for work that must outlive a single session
- Curator + telemetry — `.dojo/skill-usage.json` + `scripts/curator.sh` for pin / archive / report
- Cache-aware self-improvement — `scripts/lesson-updater.sh` defers amendments to `.dojo/pending-amendments.md` so the prompt cache survives mid-session
- Multi-instance profiles — `dojo --profile <name>` swaps in `~/.dojo/profiles/<name>` as `DOJO_ROOT`
- PowerShell mirrors for every shell script (Windows-first parity)

---

## The Mandatory Workflow

Every non-trivial task follows this pipeline — no skipping, no improvising:

```
BRAINSTORM → WORKTREE → PLAN → EXECUTE → TEST → REVIEW → FINISH → LEARN
```

| # | Skill | Purpose |
|---|---|---|
| 1 | [brainstorming](./skills/brainstorming/SKILL.md) | Socratic refinement → approved design |
| 2 | [using-git-worktrees](./skills/using-git-worktrees/SKILL.md) | Isolated workspace on a feature branch |
| 3 | [plan-before-code](./skills/plan-before-code/SKILL.md) | Bite-sized tasks in `tasks/todo.md` or `tasks/board/` |
| 4 | [executing-plans](./skills/executing-plans/SKILL.md) | One task at a time, verify each |
| 5 | [test-writing](./skills/test-writing/SKILL.md) | RED-GREEN-REFACTOR for every change |
| 6 | [requesting-code-review](./skills/requesting-code-review/SKILL.md) | Self-review against plan |
| 7 | [finishing-a-development-branch](./skills/finishing-a-development-branch/SKILL.md) | Verify + merge decision + cleanup |
| 8 | [self-improvement](./skills/self-improvement/SKILL.md) | Log lessons, update metrics, propose amendments |

---

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

| Skill | |
|---|---|
| [code-review](./skills/code-review/SKILL.md) | Structured review with severity-based feedback |
| [refactoring](./skills/refactoring/SKILL.md) | Safe refactoring — behavior preservation, small steps |
| [test-writing](./skills/test-writing/SKILL.md) | Meaningful tests that catch bugs, not just exist |
| [debugging](./skills/debugging/SKILL.md) | Evidence, hypotheses, divide-and-conquer |
| [pr-workflow](./skills/pr-workflow/SKILL.md) | Clean commits, good descriptions, merge-ready PRs |
| [codebase-onboarding](./skills/codebase-onboarding/SKILL.md) | Rapidly understand unfamiliar codebases |
| [requirements-elicitation](./skills/requirements-elicitation/SKILL.md) | User stories, acceptance criteria, Definition of Ready |

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

```bash
bash scripts/curator.sh status                   # usage counts per skill
bash scripts/curator.sh pin debugging            # always-load this skill
bash scripts/curator.sh archive my-old-skill     # move to skills/.archive/
bash scripts/curator.sh report                   # markdown rollup for review
```

## Cache-Aware Self-Improvement

Mutating `skills.md` or any `SKILL.md` mid-session invalidates Copilot's prompt cache. The dojo defends against this:

- `scripts/lesson-updater.sh` (no flag) writes proposed amendments to `.dojo/pending-amendments.md`. Apply them at session boundaries.
- `scripts/lesson-updater.sh --now` applies immediately but prints a loud warning that the cache is being blown.

## Multi-Instance Profiles

Working on several projects concurrently? Each profile gets its own `skills/`, `tasks/`, `.dojo/` under `~/.dojo/profiles/<name>/`:

```bash
dojo --profile work status         # uses ~/.dojo/profiles/work
dojo --profile experiment menu     # uses ~/.dojo/profiles/experiment
```

`DOJO_ROOT` is exported automatically so every shell script and the `verify.sh` gate operate on the right root.

---

## Enter the Dojo

1. Copy [`skills/`](./skills) and [`optional-skills/`](./optional-skills) into your repo — or pick the individual tiers you need.
2. Place [`skills.md`](./skills.md) at your repo root — Copilot agents auto-discover this index.
3. Place [`.github/copilot-instructions.md`](./.github/copilot-instructions.md) in your `.github/` folder — customize for your stack.
4. Run `bash scripts/init.sh` — scaffolds `tasks/todo.md` and `tasks/lessons.md`.
5. Run `bash scripts/verify.sh spec` — confirms the skill index, personas, and scripts are wired correctly.
6. Author your own skills from [template/SKILL.md](./template/SKILL.md) — guidance lives in [optional-skills/writing-skills](./optional-skills/writing-skills/SKILL.md).

---

## Choose Your Fighting Style

`.github/copilot-instructions.md` ships with code-standard examples for multiple stacks:

- **TypeScript** 📘 — strict mode, Vitest, Tailwind, Next.js App Router
- **Python** 🐍 — pytest, ruff, type hints, FastAPI/Django
- **Java** ☕ — JUnit 5, Spring Boot, Maven/Gradle
- **Go** 🐹 — standard library, table-driven tests
- **.NET** 🛡️ — xUnit, clean architecture, nullable reference types

Pick your style. Delete the others. The disciplines are **style-agnostic**.

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
