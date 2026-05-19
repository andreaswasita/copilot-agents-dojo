---
name: plan-before-code
description: Plans multi-step work before writing code.
tier: core
category: discipline
created_by: human
platforms: [windows, macos, linux]
tags: [planning, workflow, discipline]
author: Andreas Wasita (@andreaswasita)
---

# Plan Before Code Skill

Forces an explicit written plan in `tasks/todo.md` before the agent edits any file for non-trivial work. Does NOT apply to one-line fixes, typo corrections, or any task the agent can finish in a single edit — over-planning trivial work is its own failure mode.

## When to Use

- Any task that will touch 3+ files or require 3+ steps.
- Before implementing unfamiliar features or architectural changes.
- After a previous approach failed and a re-plan is needed.
- When scope or requirements are ambiguous.
- Before refactoring that crosses module boundaries.
- NOT for: typos, comment-only edits, single-line bug fixes, formatting.

## Prerequisites

- A writable `tasks/todo.md` (created by `scripts/init.sh` if missing).
- An approved problem statement from the user or `brainstorming` skill.
- The repo cloned and the working tree clean enough to start (use `powershell` with `git status`).

## How to Run

```text
1. Assess complexity (the 4 questions in Procedure §1).
2. If non-trivial → write plan to tasks/todo.md using the canonical block.
3. Validate the plan against the gap checklist.
4. Execute one step at a time, checking items off as you go.
```

## Quick Reference

| Situation | Action | Tool |
|---|---|---|
| Touch ≥3 files | Enter plan mode | `view tasks/todo.md` then `edit` |
| Re-plan after wall hit | Append a `## Revision N` block | `edit tasks/todo.md` |
| Check existing plan | Read current state | `view tasks/todo.md` |
| Mark step done | Flip `- [ ]` to `- [x]` | `edit tasks/todo.md` |
| Resume across sessions | Re-read the plan first | `view tasks/todo.md` |

## Procedure

### Step 1: Assess Complexity

Answer these four questions in order:

1. How many files will this touch?
2. Are there architectural decisions to make?
3. Could this break existing functionality?
4. Is the requirement ambiguous?

If any answer is "yes" or "maybe," enter plan mode. Otherwise, proceed without a plan (don't pretend a typo fix needs one).

### Step 2: Write the Plan

Append to `tasks/todo.md` using the `edit` tool with this canonical block:

```markdown
## Task: <brief description>

### Context
- What: <what we're building or fixing>
- Why: <the motivation>
- Risk: <what could go wrong>

### Steps
- [ ] Step 1: <specific action>
- [ ] Step 2: <specific action>
- [ ] Step 3: <specific action>

### Verification
- [ ] Tests pass (`scripts/verify.sh tests`)
- [ ] No regressions
- [ ] Diff reviewed
```

### Step 3: Validate the Plan

Before executing, walk the plan once and ask:

- Are step dependencies explicit?
- Is the verification block concrete (specific commands, not vibes)?
- Is any step large enough that it should be split?

### Step 4: Execute with Checkpoints

Follow the plan one step at a time. Mark items complete only after the work for that step is done and locally verified. If something goes sideways:

1. **STOP** immediately — don't keep editing on a broken plan.
2. Log what went wrong in `tasks/lessons.md`.
3. Append a `### Revision N` block to the task in `tasks/todo.md`.
4. Resume from the revised plan.

## Pitfalls

- **DO NOT** keep the plan only in memory. If it is not in `tasks/todo.md`, it does not exist.
- **DO NOT** over-plan trivial work. A one-line fix doesn't need a 20-step plan.
- **DO NOT** refuse to re-plan. The first plan is almost never perfect; revise when new information arrives.
- **DO NOT** start editing files before the plan block is committed to `tasks/todo.md`.
- **DO NOT** mark a step `- [x]` until its verification in §2 is satisfied.

## Verification

- [ ] `tasks/todo.md` contains a `## Task:` block for the current work.
- [ ] Every step is concrete (a different agent could execute it).
- [ ] Verification block lists specific commands, not just "tests pass".
- [ ] `scripts/verify.sh plan` passes.
