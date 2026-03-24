# Copilot Instructions

## Code Standards

Customize this section for your stack. Examples for common fighting styles:

### TypeScript (Default Example)
- Always use TypeScript with `strict: true`
- Naming: camelCase for variables/functions, PascalCase for components/types
- Styling: Tailwind CSS + shadcn/ui components
- Testing: Write Vitest tests for every new component/logic
- Architecture: Next.js App Router, Server Actions, React Server Components when possible
- Security: Never commit secrets, use environment variables

### Python
- Type hints on all function signatures
- Formatting: Black (line length 88)
- Testing: pytest with fixtures, aim for >80% coverage
- Linting: ruff or flake8
- Architecture: FastAPI or Django conventions as applicable
- Dependency management: pyproject.toml / requirements.txt pinned

### Java
- Follow Google Java Style Guide
- Testing: JUnit 5 + Mockito for unit tests
- Build: Maven or Gradle (match existing project)
- Architecture: Spring Boot patterns, constructor injection
- Security: OWASP dependency check in CI

### Go
- Follow standard library conventions and `go fmt`
- Testing: table-driven tests with `testing` package
- Error handling: explicit, no panic in library code
- Architecture: clean package boundaries, interfaces for testability

### .NET
- Nullable reference types enabled
- Testing: xUnit + FluentAssertions
- Architecture: clean architecture, MediatR for CQRS if applicable
- Security: never log PII, use IOptions pattern for config

> **Pick your style.** Delete the others or keep them as reference.

## Superpowers Activated

At session start: load all skills from `skills/`. Follow the mandatory workflow. Never improvise.

See [skills.md](../skills.md) for the full skills index. Each skill is a self-contained folder under `skills/` with a `SKILL.md` file. Load the relevant skill when its trigger conditions are met.

### Mandatory Workflow Pipeline

Every non-trivial task follows this sequence:

```
BRAINSTORM → WORKTREE → PLAN → EXECUTE → TEST → REVIEW → FINISH → LEARN
```

1. **[Brainstorming](../skills/brainstorming/SKILL.md)** → Socratic design refinement, get approval
2. **[Using git worktrees](../skills/using-git-worktrees/SKILL.md)** → Isolated workspace on feature branch
3. **[Plan before code](../skills/plan-before-code/SKILL.md)** → Break into tasks in `tasks/todo.md`
4. **[Executing plans](../skills/executing-plans/SKILL.md)** → One task at a time, verify each
5. **[Test writing](../skills/test-writing/SKILL.md)** → RED-GREEN-REFACTOR for every change
6. **[Requesting code review](../skills/requesting-code-review/SKILL.md)** → Self-review against plan
7. **[Finishing a development branch](../skills/finishing-a-development-branch/SKILL.md)** → Verify, merge decision, cleanup
8. **[Self-improvement](../skills/self-improvement/SKILL.md)** → Log lessons, update metrics

### Core Disciplines (always active)
- **[Plan before code](../skills/plan-before-code/SKILL.md)**: Enter plan mode for any non-trivial task (3+ steps). Write plan to `tasks/todo.md`.
- **[Verify before done](../skills/verify-before-done/SKILL.md)**: Run tests, check logs, diff against main. Never mark complete without proof.
- **[Subagent strategy](../skills/subagent-strategy/SKILL.md)**: Offload research and parallel analysis to subagents. Keep context clean.
- **[Self-improvement](../skills/self-improvement/SKILL.md)**: Capture lessons in `tasks/lessons.md` after any correction. Review at session start.
- **[Demand elegance](../skills/demand-elegance/SKILL.md)**: Challenge shortcuts on non-trivial changes. Skip for simple fixes — don't over-engineer.
- **[Autonomous bug fix](../skills/autonomous-bug-fix/SKILL.md)**: Reproduce → diagnose → fix → verify. Zero hand-holding. No context switching from the user.

### Workflow Skills (activate in sequence)
- **[Brainstorming](../skills/brainstorming/SKILL.md)**: Refine ideas via Socratic questioning before code
- **[Using git worktrees](../skills/using-git-worktrees/SKILL.md)**: Isolated workspace for every session
- **[Executing plans](../skills/executing-plans/SKILL.md)**: Dispatch and execute tasks from todo.md
- **[Requesting code review](../skills/requesting-code-review/SKILL.md)**: Self-review against plan between tasks
- **[Receiving code review](../skills/receiving-code-review/SKILL.md)**: Process feedback and iterate
- **[Finishing a development branch](../skills/finishing-a-development-branch/SKILL.md)**: Final verification + merge + cleanup
- **[Dispatching parallel agents](../skills/dispatching-parallel-agents/SKILL.md)**: Concurrent sub-agent work when beneficial

### Practical Skills (load on demand)
- **[Code review](../skills/code-review/SKILL.md)**: For reviewing PRs or diffs
- **[Refactoring](../skills/refactoring/SKILL.md)**: For restructuring code safely
- **[Test writing](../skills/test-writing/SKILL.md)**: For writing meaningful tests
- **[PR workflow](../skills/pr-workflow/SKILL.md)**: For preparing merge-ready PRs
- **[Debugging](../skills/debugging/SKILL.md)**: For systematic complex debugging
- **[Codebase onboarding](../skills/codebase-onboarding/SKILL.md)**: For understanding unfamiliar repos

### Meta Skills
- **[Skill creator](../skills/skill-creator/SKILL.md)**: For creating new custom skills
- **[Writing skills](../skills/writing-skills/SKILL.md)**: SKILL.md template and spec compliance
- **[Using superpowers](../skills/using-superpowers/SKILL.md)**: Framework activator — loads everything

## Task Management

1. **Session Start**: Load superpowers. Review `tasks/lessons.md`. Check git status.
2. **Brainstorm**: For new features, refine design via Socratic questioning. Get approval.
3. **Isolate**: Create git worktree or feature branch. Verify clean test baseline.
4. **Plan**: Write plan to `tasks/todo.md` with checkable items.
5. **Execute**: One task at a time. Verify after each. Commit per task.
6. **Review**: Self-review against plan after each task/batch.
7. **Verify Before Done**: Run `scripts/verify.sh` or manually run tests/diffs.
8. **Finish**: Present merge options. Clean up worktree. Log lessons.
9. **Learn**: Update `tasks/lessons.md` after corrections. Tag with metadata.

## Helper Scripts

The `/scripts/` directory contains automation helpers. Reference them in your workflow:

- **`scripts/init.sh`** — Scaffolds `tasks/todo.md` and `tasks/lessons.md` on first clone.
- **`scripts/lesson-updater.sh`** — Scans `tasks/lessons.md` for recurring patterns (3+ occurrences) and proposes rule amendments to `skills.md`.
- **`scripts/verify.sh`** — Pre-PR verification: runs tests, checks for uncommitted changes, validates that `tasks/todo.md` has a plan.

Use these for all sessions to ensure consistency.
