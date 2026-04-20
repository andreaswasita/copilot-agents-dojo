# Copilot Agents Dojo 🥋

<h1 align="center">🏯</h1>

**Your AI agents are untrained. Time to put them through the dojo.**

A skills & discipline framework for GitHub Copilot agents. Drop structured skills into any repo, enforce a mandatory workflow, and let agents self-improve — with auto-discovery via repo root, no marketplace needed, and `scripts/` for automated gates. Built from battle-tested patterns from the field.

Drop `skills/` + `.github/copilot-instructions.md` into any repo root → Copilot agents auto-discover and enforce the full workflow.

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

- **[`skills/`](skills/)** — Individual skill folders (kata + waza + kumite + dō)
- **[`agents/`](agents/)** — Specialized agent personas for different roles
- **[`skills.md`](skills.md)** — The master index — auto-discovered by Copilot agents
- **[`spec/`](spec/)** — The Copilot Skills specification
- **[`template/`](template/)** — Starter template for creating new skills

## Core Kata — 基本型

Behavioral skills that govern *how* agents think. Style-agnostic — works with any language or framework.

| Skill | Discipline |
|-------|-----------|
| [`plan-before-code`](skills/plan-before-code/SKILL.md) | 🥋 Plan multi-step work before touching code |
| [`subagent-strategy`](skills/subagent-strategy/SKILL.md) | 🥋 Delegate research, analysis, and testing to subagents |
| [`self-improvement`](skills/self-improvement/SKILL.md) | 🥋 Capture lessons, track patterns, evolve skills |
| [`verify-before-done`](skills/verify-before-done/SKILL.md) | 🥋 Prove your work with tests, logs, and diffs |
| [`demand-elegance`](skills/demand-elegance/SKILL.md) | 🥋 Challenge hacky solutions (but don't over-engineer) |
| [`autonomous-bug-fix`](skills/autonomous-bug-fix/SKILL.md) | 🥋 Reproduce → diagnose → fix → verify. Zero hand-holding. |

## Practical Kumite — 実践組手

Task-specific skills for common engineering workflows.

| Skill | Purpose |
|-------|---------|
| [`code-review`](skills/code-review/SKILL.md) | Structured review with severity-based feedback |
| [`refactoring`](skills/refactoring/SKILL.md) | Safe refactoring — behavior preservation, small steps |
| [`test-writing`](skills/test-writing/SKILL.md) | Meaningful tests that catch bugs, not just exist |
| [`pr-workflow`](skills/pr-workflow/SKILL.md) | Clean commits, good descriptions, merge-ready PRs |
| [`debugging`](skills/debugging/SKILL.md) | Systematic debugging — evidence, hypotheses, divide-and-conquer |
| [`codebase-onboarding`](skills/codebase-onboarding/SKILL.md) | Rapidly understand unfamiliar codebases |
| [`requirements-elicitation`](skills/requirements-elicitation/SKILL.md) | Structured elicitation, user stories, acceptance criteria, Definition of Ready gate |

## Flow Waza — 流れ技

Skills that orchestrate the mandatory pipeline — brainstorm to finish.

| Skill | Purpose |
|-------|---------|
| [`brainstorming`](skills/brainstorming/SKILL.md) | Socratic design refinement before any code |
| [`using-git-worktrees`](skills/using-git-worktrees/SKILL.md) | Isolated workspace for every session |
| [`executing-plans`](skills/executing-plans/SKILL.md) | Dispatch and execute tasks from `tasks/todo.md` |
| [`requesting-code-review`](skills/requesting-code-review/SKILL.md) | Self-review against plan between tasks |
| [`receiving-code-review`](skills/receiving-code-review/SKILL.md) | Process feedback and iterate |
| [`finishing-a-development-branch`](skills/finishing-a-development-branch/SKILL.md) | Final verification + merge decision + cleanup |
| [`dispatching-parallel-agents`](skills/dispatching-parallel-agents/SKILL.md) | Concurrent sub-agent work when beneficial |

## Meta Dō — 道

| Skill | Purpose |
|-------|---------|
| [`skill-creator`](skills/skill-creator/SKILL.md) | Meta-skill for creating new dojo skills |
| [`writing-skills`](skills/writing-skills/SKILL.md) | SKILL.md template and spec compliance |
| [`using-superpowers`](skills/using-superpowers/SKILL.md) | Framework activator — loads everything |

## Creating a Skill

Skills are simple — a folder with a `SKILL.md` containing YAML frontmatter and instructions:

```yaml
---
name: my-skill-name
description: >-
  Clear description of what this skill does and when the agent should
  use it. Be specific about trigger phrases and contexts.
---

# My Skill Name

Instructions the agent follows when this skill activates.

## When to Use
- Trigger condition 1

## How to Use
Step-by-step workflow.

## Examples
Concrete demonstrations.

## Anti-Patterns
What NOT to do.
```

See the full spec at [`spec/copilot-skills-spec.md`](spec/copilot-skills-spec.md) or use [`template/SKILL.md`](template/SKILL.md) as a starting point.

## Skill Anatomy

Each skill is a self-contained folder:

```
skills/my-skill/
├── SKILL.md          # Required — frontmatter + instructions
├── examples/         # Optional — worked examples
├── references/       # Optional — docs loaded on demand
└── scripts/          # Optional — executable helpers
```

Skills use progressive disclosure to manage context window budget:
1. **Metadata** (name + description) — Always in context
2. **SKILL.md body** — Loaded when skill activates
3. **Bundled resources** — Loaded on demand

### [`.github/copilot-instructions.md`](/.github/copilot-instructions.md) — The Dojo Rules
The house rules that every agent follows when they enter your repo:

- Code standards — multi-stack examples (TypeScript, Python, Java, Go, .NET)
- Behavioral governance summary linking back to the skills
- Session-start lesson review workflow
- Helper script references for automation

## Specialized Agents

Agents are specialized personas bundled in the [`agents/`](agents/) directory. Each agent combines relevant skills to excel at specific roles:

| Agent | Focus Area |
|-------|-----------|
| [`architect.md`](agents/architect.md) | System design, technical strategy, and the engineering half of requirements — impact analysis, specification, traceability |
| [`security-engineer.md`](agents/security-engineer.md) | Security compliance, vulnerability identification, and secure practices |
| [`software-engineer.md`](agents/software-engineer.md) | Feature development, bug fixes, and production-quality code |
| [`technical-program-manager.md`](agents/technical-program-manager.md) | Project planning, timeline coordination, and the business half of requirements — elicitation, user stories, Definition of Ready gate |
| [`test-engineer.md`](agents/test-engineer.md) | Test strategy, test implementation, and quality assurance |

Agents activate based on context and task type, dynamically loading the appropriate skills for the job.

## Helper Scripts

Reusable scripts in `/scripts/` to reduce token burn and enforce consistency:

| Script | Purpose |
|--------|---------|
| [`scripts/init.sh`](scripts/init.sh) | Scaffolds `tasks/todo.md` and `tasks/lessons.md` on first clone |
| [`scripts/lesson-updater.sh`](scripts/lesson-updater.sh) | Scans lessons for recurring patterns (3+), proposes skill amendments |
| [`scripts/verify.sh`](scripts/verify.sh) | Pre-PR verification: tests, clean tree, plan check |
| [`scripts/link-index.sh`](scripts/link-index.sh) | Builds memory vault link graph, backlinks, and INDEX.md stats |
| [`scripts/memory-query.sh`](scripts/memory-query.sh) | Query memory by tag, type, date, status, or backlinks |
| [`scripts/obsidian-sync.sh`](scripts/obsidian-sync.sh) | Promotes 3+ occurrence lessons to `memory/patterns/` |

```bash
# Initialize the dojo in your repo
bash scripts/init.sh

# Check for patterns that should become skills
bash scripts/lesson-updater.sh

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

## Automated Enforcement

The `.github/workflows/dojo-enforce.yml` GitHub Action runs on every PR to `main`:
- Checks that `tasks/todo.md` has a real plan (not the default template)
- Verifies `tasks/lessons.md` exists
- Validates helper scripts are present

## Self-Improvement Loop

Inspired by [cognee](https://github.com/topoteretes/cognee)-style automation:

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

The Copilot Agents Dojo was born from battle-tested patterns learned the hard way — shipping production code with AI agents, watching them fail, and figuring out what actually makes them reliable.

The skills distill lessons from multiple sources:

- **Field experience** — Real-world agent sessions that exposed the failure modes: rushing without plans, skipping verification, repeating the same mistakes, flooding the context window. Every core kata exists because an agent failed without it.
- **[Anthropic Claude](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering)** — Structured prompting, progressive disclosure, explicit verification gates, and the principle that agents perform best when given clear constraints rather than open-ended freedom.
- **[obra/superpowers](https://github.com/obra/superpowers)** — The mandatory orchestration pipeline (BRAINSTORM → WORKTREE → PLAN → EXECUTE → TEST → REVIEW → FINISH → LEARN) that proved disciplined agents outperform freestyle ones.

The dojo wraps all of this into GitHub Copilot’s native auto-discovery (`skills/` + `.github/copilot-instructions.md` at repo root), adds `scripts/` for automated gates, and packages it in a martial-arts skill progression system where agents earn their belts.

Agents will behave identically: disciplined, testable, self-improving, no hand-holding.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

[MIT](LICENSE)

---

**⭐ Star this dojo** if you're done babysitting your AI agents. Fork it, train your agents, earn your belt.
