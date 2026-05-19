---
name: requesting-code-review
description: Self-reviews work against the plan before sign-off.
tier: practical
category: workflow
created_by: human
platforms: [windows, macos, linux]
tags: [self-review, quality, gate]
author: Andreas Wasita (@andreaswasita)
---

# Requesting Code Review Skill

Self-reviews the agent's own output against the original plan before declaring done or opening a PR. Surfaces issues by severity; critical issues block progress. Does NOT replace human review — it ensures the human review starts from a defensible baseline.

## When to Use

- A task or batch of tasks is complete.
- Between major implementation phases.
- Before creating a pull request.
- Before telling the user "done" on any non-trivial change.
- After a sub-agent returns delegated work.

## Prerequisites

- An approved plan in `tasks/todo.md` (or equivalent design doc).
- The `view` and `grep` tools to read the diff and surrounding code.
- `git` for the diff inspection.
- A green test run (the `verify-before-done` skill should already have run).

## How to Run

```text
1. Compare implementation to the plan spec, criterion by criterion.
2. Walk the self-review checklist.
3. Tag each finding 🔴 / 🟡 / 🟢 / ✅.
4. Act on findings — 🔴 blocks, 🟡 fixed before PR, 🟢 logged.
5. Emit a short summary before claiming completion.
```

## Quick Reference

| Severity | Meaning | Action |
|---|---|---|
| 🔴 Critical | Wrong behavior, security risk, broken test | STOP. Fix before next task. |
| 🟡 Major | Should fix before merge | Fix before PR; OK to continue current task |
| 🟢 Minor | Style, nit, future improvement | Log to `tasks/todo.md` follow-ups |
| ✅ Passing | Criterion met | Note in summary |

| Checklist item | Look at |
|---|---|
| Matches plan spec | `tasks/todo.md` |
| Tests pass (including new) | Latest test run output |
| No debug artifacts | `grep` for `console.log`, `print`, `TODO` |
| Edge cases covered | The new test file |
| No security regressions | Auth, input validation, secrets |
| Follows project conventions | Adjacent files |
| Diff scope = task scope | `git diff main --stat` |

## Procedure

### Step 1: Compare to Plan

Open `tasks/todo.md` with `view`. For the task just completed, read its acceptance criteria. Tick each one explicitly — do not summarize.

### Step 2: Walk the Checklist

For each row in the Quick Reference checklist, mark ✅ or flag a finding. Use `grep` to hunt for debug artifacts:

```bash
grep -nE "console\.log|print\(|TODO|XXX|FIXME" <changed files>
```

(Use the `grep` Copilot tool, not bare shell `grep`.)

### Step 3: Tag by Severity

Group findings under 🔴 / 🟡 / 🟢 / ✅:

```markdown
## Self-Review

### 🔴 Critical
- `api/users.ts:42` — DELETE endpoint missing authorization check.

### 🟡 Major
- `api/users.ts:88` — Returns 500 instead of 404 for missing user.

### 🟢 Minor
- `api/users.ts:120` — Consider pagination on the list endpoint.

### ✅ Passing
- 4/4 endpoints match spec.
- 12 new tests, all green.
- Diff scope = task scope.
```

### Step 4: Act on Findings

- 🔴 → STOP. Fix immediately. Re-verify. Re-review.
- 🟡 → Fix before the PR. Safe to continue the current task.
- 🟢 → Log in `tasks/todo.md` under follow-ups.
- ✅ → Note in the summary and proceed.

### Step 5: Present the Summary

Always emit a short visible summary before "done":

```markdown
**Review: Step 3 — Implement API endpoints**
- ✅ 4/4 endpoints per spec
- ✅ Input validation on all routes
- 🟡 Missing rate limit on POST /users (logged for Step 6)
- ✅ 12 new tests, all passing
Proceeding to Step 4.
```

## Pitfalls

- **DO NOT** skip self-review and say "it works, ship it".
- **DO NOT** downgrade severity to avoid extra work. A missing auth check is 🔴, not 🟢.
- **DO NOT** review only the happy path. Walk the error and edge paths too.
- **DO NOT** proceed past a 🔴 finding. The whole point is that criticals block.
- **DO NOT** rubber-stamp ("✅ all good") without actually checking each item.

## Verification

- [ ] Each acceptance criterion in the plan is explicitly ticked or flagged.
- [ ] Self-review summary was emitted with severity buckets.
- [ ] Any 🔴 findings were fixed and re-verified before claiming done.
- [ ] 🟢 findings were logged to `tasks/todo.md` follow-ups.
- [ ] User saw the summary before any "done" claim.
