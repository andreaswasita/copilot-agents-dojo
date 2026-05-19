---
name: executing-plans
description: Executes approved plans one task at a time, verified.
tier: practical
category: workflow
created_by: human
platforms: [windows, macos, linux]
tags: [execution, plan, todo]
author: Andreas Wasita (@andreaswasita)
---

# Executing Plans Skill

Walks an approved `tasks/todo.md` plan step by step: pick the next task, execute it, verify it, commit it, mark it done. Does NOT freelance new scope mid-execution and does NOT skip the verification gate.

## When to Use

- A plan in `tasks/todo.md` has been approved.
- Starting or resuming a multi-step implementation.
- User says "go", "start", "execute", or "begin".
- A sub-agent batch finishes and the next batch is ready.
- NOT before the design is approved (use `brainstorming` first).

## Prerequisites

- Approved `tasks/todo.md` containing ordered steps with acceptance criteria.
- `git` configured for atomic commits.
- The `view`, `edit`, and `powershell` Copilot tools.
- A green baseline test run.
- The `verify-before-done` skill available for the verification step.

## How to Run

```text
1. Read tasks/todo.md. Identify the next unchecked task.
2. Confirm its prerequisites are satisfied.
3. Execute the task.
4. Run the verify-before-done skill.
5. Append the Verification Results block.
6. Commit. Mark the checkbox `- [x]`.
7. Repeat. Post a short progress note every 2–3 tasks.
```

## Quick Reference

| Phase | Action | Tool |
|---|---|---|
| Load | Read `tasks/todo.md` | `view` |
| Execute | Make the change | `edit`, `powershell` |
| Verify | Tests + gate + diff | `verify-before-done` skill |
| Record | Append Verification Results | `edit` |
| Commit | One commit per task | `powershell` → `git commit` |
| Mark done | Flip `- [ ]` to `- [x]` | `edit` |

## Procedure

### Step 1: Load the Plan

Open `tasks/todo.md` with `view`. Locate the next `- [ ]` step. If none exist, the plan is done — hand off to `finishing-a-development-branch`.

### Step 2: Check Prerequisites

Read the task. Confirm any "depends on" notes are satisfied. If a prerequisite is missing, STOP — do not improvise around it; re-plan first.

### Step 3: Execute Exactly One Task

Make the change. Resist the urge to bundle "while I'm here" cleanups. Scope discipline is the whole point of the plan.

### Step 4: Verify

Invoke the `verify-before-done` skill. Do not consider the task complete until it has produced a Verification Results block:

```markdown
### Verification Results
- [x] Tests: 47 passed, 0 failed
- [x] Dojo gate: `verify.sh --check` PASS
- [x] Diff matches plan
- [x] Clean tree
```

### Step 5: Commit and Mark Done

```bash
git add -A
git commit -m "<type>: <task title>"
```

Then `edit` `tasks/todo.md` to flip `- [ ]` → `- [x]`.

### Step 6: Handle Blockers Explicitly

If a task cannot complete as planned:

1. Do not improvise around it.
2. Annotate the task in `tasks/todo.md`:

   ```markdown
   - [ ] Step 3: Implement API endpoints
     > ⚠️ BLOCKED: Schema does not support required query. Need index or restructure Step 1.
   ```

3. Re-plan. Update the plan. Resume from the revised version.

### Step 7: Progress Updates

Every 2–3 completed tasks, post a short status:

```markdown
**Progress:** 3/5 tasks complete
- ✅ Schema, models, endpoints
- ⏳ Next: validation
- 🚫 No blockers
```

## Pitfalls

- **DO NOT** skip the plan order without re-planning first.
- **DO NOT** batch 5 tasks then verify once. Verify after each.
- **DO NOT** add scope mid-execution ("while I'm here…"). Log it as a follow-up; stay on plan.
- **DO NOT** mark a task done without a Verification Results block.
- **DO NOT** silently work around blockers. Annotate and re-plan.

## Verification

- [ ] Every flipped `- [x]` has a Verification Results block above it.
- [ ] One commit per completed task (or one logical unit).
- [ ] No scope was added to the plan without explicit user agreement.
- [ ] Progress updates were posted at least every 3 tasks.
- [ ] Blockers, if any, are documented in `tasks/todo.md`.
