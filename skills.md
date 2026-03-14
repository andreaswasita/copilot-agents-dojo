# Copilot Agents Dojo — Skills Index

Skills are self-contained folders of instructions, examples, and resources that Copilot agents load to improve performance on specialized tasks. Each skill has a `SKILL.md` with YAML frontmatter and markdown instructions.

For the full specification, see [`spec/copilot-skills-spec.md`](spec/copilot-skills-spec.md). To create new skills, see [`skills/skill-creator`](skills/skill-creator/SKILL.md) or start from [`template/SKILL.md`](template/SKILL.md).

---

## Core Disciplines — The Six Kata

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

## Practical Skills

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

### [`skills/skill-creator`](skills/skill-creator/SKILL.md) — Skill Creator
A meta-skill for creating new dojo skills. Captures intent, writes SKILL.md files, and tests skill effectiveness.

---

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code. Fewer lines > more lines.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards. Every shortcut is technical debt.
- **Zero Hand-Holding**: The user provides intent; the agent handles execution. No asking "which file?", "what command?", or "how do I run tests?" — figure it out.
- **Continuous Evolution**: The dojo is not static. Lessons feed back into skills. Skills get sharper over time. Measure improvement or it didn't happen.
