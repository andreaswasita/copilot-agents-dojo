# Copilot Agents Dojo — Skills Index

A skills & discipline framework for GitHub Copilot agents. 22 production skills. Mandatory workflow. Self-improving. Orchestration pipeline inspired by [obra/superpowers](https://github.com/obra/superpowers).

Skills are self-contained folders of instructions, examples, and resources that Copilot agents load to improve performance on specialized tasks. Each skill has a `SKILL.md` with YAML frontmatter and markdown instructions.

For the full specification, see [`spec/copilot-skills-spec.md`](spec/copilot-skills-spec.md). To create new skills, see [`skills/skill-creator`](skills/skill-creator/SKILL.md) or start from [`template/SKILL.md`](template/SKILL.md).

---

## The Mandatory Workflow

Every non-trivial task follows this pipeline:

```
BRAINSTORM → WORKTREE → PLAN → EXECUTE → TEST → REVIEW → FINISH → LEARN
```

---

## Core Kata — 基本型

Behavioral skills that govern *how* the agent thinks and operates. Style-agnostic — they work regardless of language or framework.

### [`skills/plan-before-code`](skills/plan-before-code/SKILL.md) — Plan Before Code
🥋 No wild swings. Agents plan multi-step work before touching code. Write the plan to `tasks/todo.md` with checkable items before writing any code.

### [`skills/subagent-strategy`](skills/subagent-strategy/SKILL.md) — Subagent Strategy
🥋 A master delegates. Subagents handle research, analysis, testing, and review. One task per subagent, keep the main context clean.

### [`skills/self-improvement`](skills/self-improvement/SKILL.md) — Self-Improvement Loop
🥋 After every correction, agents capture the lesson with tags and metrics. Patterns feed back into skills. Review `tasks/lessons.md` at session start.

### [`skills/verify-before-done`](skills/verify-before-done/SKILL.md) — Verify Before Done
🥋 No kata is complete without demonstration. Tests, logs, diffs — show your work or it didn't happen. Use `scripts/verify.sh` for automation.

### [`skills/demand-elegance`](skills/demand-elegance/SKILL.md) — Demand Elegance
🥋 Brute force is for beginners. Challenge hacky solutions. But skip the kata for simple fixes — don't over-engineer.

### [`skills/autonomous-bug-fix`](skills/autonomous-bug-fix/SKILL.md) — Autonomous Bug Fixing
🥋 Reproduce, diagnose, fix, verify. Full cycle, zero questions. Zero hand-holding. Zero context switching from the user.

---

## Flow Waza — 流れ技

Skills that orchestrate the mandatory development pipeline. Adapted from [superpowers](https://github.com/obra/superpowers) for GitHub Copilot agents.

### [`skills/brainstorming`](skills/brainstorming/SKILL.md) — Brainstorming
🔄 Activates before writing code. Refines rough ideas through Socratic questioning, explores alternatives, presents design in chunks for validation. Saves approved design document.

### [`skills/using-git-worktrees`](skills/using-git-worktrees/SKILL.md) — Using Git Worktrees
🔄 Activates after design approval. Creates isolated workspace on a dedicated feature branch, runs project setup, verifies clean test baseline.

### [`skills/executing-plans`](skills/executing-plans/SKILL.md) — Executing Plans
🔄 Activates with an approved plan. Takes one task from `tasks/todo.md`, executes it, verifies completion, moves to the next. Never skips. Never freelances.

### [`skills/requesting-code-review`](skills/requesting-code-review/SKILL.md) — Requesting Code Review
🔄 Activates between tasks. Reviews the agent's own work against the original plan. Flags issues by severity — critical issues block progress.

### [`skills/receiving-code-review`](skills/receiving-code-review/SKILL.md) — Receiving Code Review
🔄 Activates when feedback arrives. Processes every comment, fixes issues, re-verifies, and requests re-review. Nothing gets ignored.

### [`skills/finishing-a-development-branch`](skills/finishing-a-development-branch/SKILL.md) — Finishing a Development Branch
🔄 Activates when all tasks are complete. Runs full verification, presents merge options (merge/PR/keep/discard), cleans up worktree, logs lessons.

### [`skills/dispatching-parallel-agents`](skills/dispatching-parallel-agents/SKILL.md) — Dispatching Parallel Agents
🔄 Activates when independent subtasks can run concurrently. One sub-agent per task with clear specs, non-overlapping boundaries, integration verification after.

---

## Practical Kumite — 実践組手

Task-specific skills that teach the agent *how to do* particular kinds of work.

### [`skills/code-review`](skills/code-review/SKILL.md) — Code Review
Structured code review — reading diffs, identifying issues, and providing actionable feedback organized by severity.

### [`skills/refactoring`](skills/refactoring/SKILL.md) — Refactoring
Safe, systematic refactoring — improving structure without changing behavior. Small steps, tests first, one transformation per commit.

### [`skills/test-writing`](skills/test-writing/SKILL.md) — Test Writing
Writing effective, meaningful tests that catch bugs — not just tests that exist. Covers the testing pyramid, naming, and framework-specific guidance.

### [`skills/pr-workflow`](skills/pr-workflow/SKILL.md) — PR Workflow
Complete pull request workflow — from clean commits to merge-ready state. Descriptions, self-review, and feedback handling.

### [`skills/debugging`](skills/debugging/SKILL.md) — Debugging
Systematic debugging for complex issues — evidence gathering, hypothesis testing, divide-and-conquer, and specialized techniques for race conditions, memory leaks, and intermittent failures.

### [`skills/codebase-onboarding`](skills/codebase-onboarding/SKILL.md) — Codebase Onboarding
Rapidly understanding an unfamiliar codebase — structure, conventions, dependencies, and key patterns. Read before you write.

---

## Meta Dō — 道

### [`skills/skill-creator`](skills/skill-creator/SKILL.md) — Skill Creator
A meta-skill for creating new dojo skills. Captures intent, writes SKILL.md files, and tests skill effectiveness.

### [`skills/writing-skills`](skills/writing-skills/SKILL.md) — Writing Skills
SKILL.md template and spec compliance. Use exact YAML frontmatter + triggers + steps + enforcement. Test in a branch before committing.

### [`skills/using-superpowers`](skills/using-superpowers/SKILL.md) — Using Superpowers
The framework activator. Loads all skills, enforces the mandatory workflow, reviews lessons at session start.

---

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code. Fewer lines > more lines.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards. Every shortcut is technical debt.
- **Zero Hand-Holding**: The user provides intent; the agent handles execution. No asking "which file?", "what command?", or "how do I run tests?" — figure it out.
- **Continuous Evolution**: The dojo is not static. Lessons feed back into skills. Skills get sharper over time. Measure improvement or it didn't happen.
- **Mandatory Workflow**: The pipeline is not optional. Brainstorm → Plan → Execute → Review → Finish. Every time.
