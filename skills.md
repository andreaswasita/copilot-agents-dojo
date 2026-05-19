# Copilot Agents Dojo — Skills Index

A skills & discipline framework for GitHub Copilot agents. 26 production skills across three tiers. Mandatory workflow. Self-improving. Built from field-tested patterns — [Anthropic Claude](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering) prompt engineering, [obra/superpowers](https://github.com/obra/superpowers) orchestration, and the [hermes-agent](https://github.com/andreaswasita/hermes-agent) reference build.

> **Auto-generated.** Do not edit by hand — run `bash scripts/regen-skills-index.sh` (or `pwsh scripts/regen-skills-index.ps1` on Windows).

Skills are self-contained folders of instructions, examples, and resources that Copilot agents load to improve performance on specialized tasks. Each skill has a `SKILL.md` with YAML frontmatter and the canonical body sections defined in [`spec/copilot-skills-spec.md`](spec/copilot-skills-spec.md).

To create a new skill, start from [`template/SKILL.md`](template/SKILL.md) or read [`optional-skills/writing-skills`](optional-skills/writing-skills/SKILL.md).

---

## The Mandatory Workflow

Every non-trivial task follows this pipeline:

```
BRAINSTORM → WORKTREE → PLAN → EXECUTE → TEST → REVIEW → FINISH → LEARN
```

Each arrow is enforced by a flow skill in the *Core* or *Practical* tiers.

---

## Core Kata — 基本型

Always loaded. Behavioral skills that govern *how* the agent thinks and operates — style-agnostic, language-agnostic.

### [`skills/self-improvement`](skills/self-improvement/SKILL.md) — Self-Improvement Loop
🥋 After every correction, agents capture the lesson with tags and metrics. Patterns feed back into skills. Review `tasks/lessons.md` at session start. Promote proven patterns (3+ occurrences) to `memory/patterns/`. Record decisions in `memory/decisions/`. Write session summaries to `memory/sessions/`. Run `scripts/link-index.sh` to rebuild the knowledge graph.

- [`using-superpowers`](skills/using-superpowers/SKILL.md) — Activates the dojo framework at the start of a session.

### 🤝 Delegation

- [`durable-work`](skills/durable-work/SKILL.md) — Picks the board over sub-agents for cross-turn work.
- [`subagent-strategy`](skills/subagent-strategy/SKILL.md) — Delegates research and parallel work to sub-agents.

### 🥋 Discipline

- [`autonomous-bug-fix`](skills/autonomous-bug-fix/SKILL.md) — Reproduces, diagnoses, fixes, and verifies bugs unaided.
- [`demand-elegance`](skills/demand-elegance/SKILL.md) — Challenges hacky fixes on non-trivial changes.
- [`plan-before-code`](skills/plan-before-code/SKILL.md) — Plans multi-step work before writing code.
- [`self-improvement`](skills/self-improvement/SKILL.md) — Captures lessons and proposes skill amendments.
- [`verify-before-done`](skills/verify-before-done/SKILL.md) — Proves work with tests, diffs, and logs before sign-off.


## Practical Kumite — 実践組手

Loaded on-demand. Task-specific skills that teach the agent *how to do* particular kinds of work.

### 🤝 Delegation

- [`dispatching-parallel-agents`](skills/dispatching-parallel-agents/SKILL.md) — Runs independent subtasks concurrently via sub-agents.

### 🔄 Workflow

- [`brainstorming`](skills/brainstorming/SKILL.md) — Refines rough ideas into approved designs before code.
- [`code-review`](skills/code-review/SKILL.md) — Reviews diffs by severity to produce actionable feedback.
- [`codebase-onboarding`](skills/codebase-onboarding/SKILL.md) — Maps an unfamiliar repo before touching its code.
- [`debugging`](skills/debugging/SKILL.md) — Systematic root-cause investigation for hard bugs.
- [`executing-plans`](skills/executing-plans/SKILL.md) — Executes approved plans one task at a time, verified.
- [`finishing-a-development-branch`](skills/finishing-a-development-branch/SKILL.md) — Verifies, summarises, and closes a development branch.
- [`pr-workflow`](skills/pr-workflow/SKILL.md) — Prepares branches and PRs for clean, reviewable merges.
- [`receiving-code-review`](skills/receiving-code-review/SKILL.md) — Processes review feedback until the change is approved.
- [`refactoring`](skills/refactoring/SKILL.md) — Safe, test-backed code restructuring in small steps.
- [`requesting-code-review`](skills/requesting-code-review/SKILL.md) — Self-reviews work against the plan before sign-off.
- [`requirements-elicitation`](skills/requirements-elicitation/SKILL.md) — Turns vague intent into testable, gated requirements.
- [`test-writing`](skills/test-writing/SKILL.md) — Writes meaningful tests that actually catch bugs.
- [`using-git-worktrees`](skills/using-git-worktrees/SKILL.md) — Isolates each task in its own git worktree off main.


## Optional Dō — 拡張道

Loaded only when invoked. Heavyweight or integration-specific skills. Not part of the default skill bundle.

### 🔌 Integration

- [`building-mcp-servers`](optional-skills/building-mcp-servers/SKILL.md) — Authors an MCP server with the official SDK and gates.
- [`calling-mcp-tools-via-subprocess`](optional-skills/calling-mcp-tools-via-subprocess/SKILL.md) — Bypasses a flaky MCP broker by spawning the server directly.
- [`using-mcp`](optional-skills/using-mcp/SKILL.md) — Wires MCP servers into a Copilot client and verifies them.

### 📐 Meta

- [`writing-skills`](optional-skills/writing-skills/SKILL.md) — Authors new SKILL.md files that conform to the dojo spec.

### [`skills/requirements-elicitation`](skills/requirements-elicitation/SKILL.md) — Requirements Elicitation
Structured requirements elicitation — Socratic questioning, user stories, Given/When/Then acceptance criteria, ambiguity elimination, and Definition of Ready gate. Role-neutral technique invoked by both TPM (business elicitation) and Architect (system specification).

---

## Core Principles

### [`skills/using-superpowers`](skills/using-superpowers/SKILL.md) — Using Superpowers
The framework activator. Loads all skills, enforces the mandatory workflow, reads `memory/INDEX.md` and reviews lessons at session start. Writes session summaries at session end.

---

## See Also

- [`spec/copilot-skills-spec.md`](spec/copilot-skills-spec.md) — Authoritative SKILL.md spec
- [`AGENTS.md`](AGENTS.md) — Contributor development guide
- [`.github/known-pitfalls.md`](.github/known-pitfalls.md) — Pitfalls register
- [`scripts/verify.sh`](scripts/verify.sh) — Single verification gate
