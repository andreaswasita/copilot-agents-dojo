---
name: dispatching-parallel-agents
description: Runs independent subtasks concurrently via sub-agents.
tier: practical
category: delegation
created_by: human
platforms: [windows, macos, linux]
tags: [delegation, parallel, sub-agents]
author: Andreas Wasita (@andreaswasita)
---

# Dispatching Parallel Agents Skill

Runs multiple sub-agents concurrently when a plan contains independent subtasks with non-overlapping file boundaries. Each sub-agent receives a self-contained spec. Does NOT parallelize work with dependencies or shared mutable state — that path silently corrupts results.

## When to Use

- The plan contains 2+ tasks with no dependency edges between them.
- Multiple research investigations or codebase explorations can run side-by-side.
- Multiple verification runs (lint, test, type-check) can run in parallel.
- User explicitly asks for parallel execution or to "speed this up".
- NOT for debugging (parallel agents mask timing bugs).
- NOT when tasks edit overlapping files or share mutable state.

## Prerequisites

- An approved plan in `tasks/todo.md` with task IDs and explicit dependencies.
- The `task` Copilot tool available (or equivalent sub-agent mechanism).
- Each candidate task has a precise file-boundary scope ("owns" a directory or file set).
- Integration test or verification step that exercises the combined result.
- The `view`, `edit`, `grep`, and `powershell` Copilot tools.

## How to Run

```text
1. From `tasks/todo.md`, pick tasks with no dependency edges between them.
2. Confirm each has a non-overlapping file scope.
3. Write a self-contained spec per agent (goal, files, DO NOT touch, verification).
4. Dispatch all sub-agents in one tool-call batch.
5. Collect each result; integrate.
6. Run an integration verification on the merged result.
7. Log failures and reasons in `tasks/lessons.md`.
```

## Quick Reference

| Parallel-safe | Sequential-only |
|---|---|
| Independent API modules in different folders | Task B reads Task A's output |
| Separate research questions | Shared config edits |
| Per-package builds in a monorepo | Same-file mutations |
| Per-file lint or type-check passes | Migration scripts that order-depend |

| Spec field | Required |
|---|---|
| Goal | One sentence |
| Files owned | Directory or explicit list |
| Files forbidden | "DO NOT touch" list |
| Verification | Tests this agent must pass before returning |
| Return format | What the agent reports back |

## Procedure

### Step 1: Identify Independents

Use `view` on `tasks/todo.md`. List tasks with empty or already-satisfied dependency sets. Cross-check file scopes: any overlap → sequential, not parallel.

```markdown
## Parallelizable
- [ ] Task A: User API endpoints (`src/api/users/`)
- [ ] Task B: Product API endpoints (`src/api/products/`)
- [ ] Task C: Migration scripts (`src/db/migrations/`)

## Sequential (depends on A+B+C)
- [ ] Task D: Integration tests for all endpoints
```

### Step 2: Write Per-Agent Specs

Each spec is self-contained — no agent should need to ask "what do I do?":

```markdown
### Agent 1 Spec: User API Endpoints
Goal: Implement CRUD endpoints for users.
Files owned: src/api/users/ (create new); src/routes/index.ts (add one route line).
DO NOT touch: src/api/products/, src/db/.
Verification: All new tests in src/api/users/__tests__/ pass; existing tests unaffected.
Return: list of files created + test result summary.
```

### Step 3: Dispatch in One Batch

Issue the sub-agent calls in a single tool-calling batch so they execute in parallel, not sequentially. Use the `task` tool with `mode: background` for any agent expected to take more than a few seconds.

### Step 4: Collect and Integrate

For each returned agent:

- Confirm it reports verification PASS.
- Inspect the diff with `view` and `git diff --stat`.
- Merge changes into the current worktree if the agents wrote to separate worktrees.

### Step 5: Integration Verification

After all agents complete, run the full test suite and `bash scripts/verify.sh --check` on the combined result. Per-agent green does not imply combined green.

### Step 6: Handle Partial Failure

If one agent fails:

1. Do not block the others — let successes complete.
2. Diagnose: was the spec ambiguous? Hidden dependency missed?
3. Re-dispatch the failed task with a revised spec, or finish it sequentially.
4. Append to `tasks/lessons.md`:

   ```yaml
   - date: 2026-05-19
     error_type: parallel-dispatch-failure
     trigger: "Agent 2 needed Agent 1's output; was dispatched in parallel"
     root_cause: "Implicit dependency not surfaced in tasks/todo.md"
     fix: "Re-ran Agent 2 after Agent 1 completed"
     rule: "Every parallel-eligible task must declare its dependencies explicitly"
   ```

## Pitfalls

- **DO NOT** parallelize tasks with dependencies. They will race and one will silently produce wrong output.
- **DO NOT** dispatch 20 agents at once. 3–5 is manageable; more is chaos and tool-budget exhaustion.
- **DO NOT** skip integration verification. Per-agent green ≠ combined green.
- **DO NOT** write vague specs ("handle the user stuff"). They produce vague output.
- **DO NOT** ignore partial failures. One failure can invalidate downstream work that already merged.

## Verification

- [ ] Dependency check ran on `tasks/todo.md` — only zero-dep tasks dispatched in parallel.
- [ ] File scopes verified non-overlapping before dispatch.
- [ ] Each agent received a self-contained spec including DO NOT list.
- [ ] All agents reported back; failures logged.
- [ ] Integration test suite + `scripts/verify.sh --check` passed on the combined result.
- [ ] If a failure occurred, `tasks/lessons.md` was updated with the root cause.
