# Copilot Agents Dojo 🥋

<h1 align="center">🏯</h1>

**Your AI agents are untrained. Time to put them through the dojo.**

Most teams using GitHub Copilot agents let them run wild — no discipline, no form, no kata. Drop a prompt, hope for the best, clean up the wreckage. That's not engineering. That's sparring with a blindfold on.

This dojo contains **modular skills**, helper scripts, and automation that turn reckless agents into disciplined black belts. Each skill is a self-contained folder with a `SKILL.md` file — portable, composable, and easy to extend.

## Skill Sets

- **[`skills/`](skills/)** — Individual skill folders (core disciplines + practical skills)
- **[`skills.md`](skills.md)** — The master index — auto-discovered by Copilot agents
- **[`spec/`](spec/)** — The Copilot Skills specification
- **[`template/`](template/)** — Starter template for creating new skills

## The Six Disciplines (Core Kata)

Behavioral skills that govern *how* agents think. Style-agnostic — works with any language or framework.

| Skill | Discipline |
|-------|-----------|
| [`plan-before-code`](skills/plan-before-code/SKILL.md) | 🥋 Plan multi-step work before touching code |
| [`subagent-strategy`](skills/subagent-strategy/SKILL.md) | 🥋 Delegate research, analysis, and testing to subagents |
| [`self-improvement`](skills/self-improvement/SKILL.md) | 🥋 Capture lessons, track patterns, evolve skills |
| [`verify-before-done`](skills/verify-before-done/SKILL.md) | 🥋 Prove your work with tests, logs, and diffs |
| [`demand-elegance`](skills/demand-elegance/SKILL.md) | 🥋 Challenge hacky solutions (but don't over-engineer) |
| [`autonomous-bug-fix`](skills/autonomous-bug-fix/SKILL.md) | 🥋 Reproduce → diagnose → fix → verify. Zero hand-holding. |

## Practical Skills

Task-specific skills for common engineering workflows.

| Skill | Purpose |
|-------|---------|
| [`code-review`](skills/code-review/SKILL.md) | Structured review with severity-based feedback |
| [`refactoring`](skills/refactoring/SKILL.md) | Safe refactoring — behavior preservation, small steps |
| [`test-writing`](skills/test-writing/SKILL.md) | Meaningful tests that catch bugs, not just exist |
| [`pr-workflow`](skills/pr-workflow/SKILL.md) | Clean commits, good descriptions, merge-ready PRs |
| [`debugging`](skills/debugging/SKILL.md) | Systematic debugging — evidence, hypotheses, divide-and-conquer |
| [`codebase-onboarding`](skills/codebase-onboarding/SKILL.md) | Rapidly understand unfamiliar codebases |
| [`skill-creator`](skills/skill-creator/SKILL.md) | Meta-skill for creating new dojo skills |

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

## Helper Scripts

Reusable scripts in `/scripts/` to reduce token burn and enforce consistency:

| Script | Purpose |
|--------|---------|
| [`scripts/init.sh`](scripts/init.sh) | Scaffolds `tasks/todo.md` and `tasks/lessons.md` on first clone |
| [`scripts/lesson-updater.sh`](scripts/lesson-updater.sh) | Scans lessons for recurring patterns (3+), proposes skill amendments |
| [`scripts/verify.sh`](scripts/verify.sh) | Pre-PR verification: tests, clean tree, plan check |

```bash
# Initialize the dojo in your repo
bash scripts/init.sh

# Check for patterns that should become skills
bash scripts/lesson-updater.sh

# Verify before submitting a PR
bash scripts/verify.sh
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
3. **Amend**: When a pattern hits 3+ occurrences, `scripts/lesson-updater.sh` proposes a rule update to `skills.md`.
4. **Evaluate**: Track pre/post-fix metrics in `tasks/lessons.md`. If a rule isn't working, revise it.
5. **Rollback**: Failed fixes get rolled back immediately. Failed rules get revised or removed.

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
2. **Place `skills.md` at your repo root** — Copilot agents auto-discover this index and activate skills
3. **Place `.github/copilot-instructions.md`** in your `.github/` folder — customize for your stack
4. **Run `bash scripts/init.sh`** — scaffolds `tasks/todo.md` and `tasks/lessons.md`
5. **Create custom skills** — Use `template/SKILL.md` or the `skill-creator` skill for your team's workflows

## The Dojo Layout

```
your-repo/
├── skills.md                          # Skills index (auto-discovered)
├── skills/
│   ├── plan-before-code/
│   │   └── SKILL.md                   # 🥋 Core Discipline
│   ├── subagent-strategy/
│   │   └── SKILL.md                   # 🥋 Core Discipline
│   ├── self-improvement/
│   │   ├── SKILL.md                   # 🥋 Core Discipline
│   │   └── examples/
│   │       └── lesson-entry.md        # Worked example
│   ├── verify-before-done/
│   │   └── SKILL.md                   # 🥋 Core Discipline
│   ├── demand-elegance/
│   │   └── SKILL.md                   # 🥋 Core Discipline
│   ├── autonomous-bug-fix/
│   │   └── SKILL.md                   # 🥋 Core Discipline
│   ├── code-review/
│   │   └── SKILL.md                   # Practical Skill
│   ├── refactoring/
│   │   └── SKILL.md                   # Practical Skill
│   ├── test-writing/
│   │   └── SKILL.md                   # Practical Skill
│   ├── pr-workflow/
│   │   └── SKILL.md                   # Practical Skill
│   ├── debugging/
│   │   └── SKILL.md                   # Practical Skill
│   ├── codebase-onboarding/
│   │   └── SKILL.md                   # Practical Skill
│   └── skill-creator/
│       └── SKILL.md                   # Meta Skill
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
│   └── verify.sh                      # Pre-PR verification
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

Forged in real-world AI delivery. These disciplines emerged from running agents across production projects and learning what separates chaotic AI-assisted development from disciplined, battle-tested delivery.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

[MIT](LICENSE)

---

**⭐ Star this dojo** if you're done babysitting your AI agents. Fork it, train your agents, earn your belt.
