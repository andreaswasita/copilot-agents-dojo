---
name: requesting-code-review
description: >-
  Reviews the agent's own work against the original plan and design before
  presenting it to the user or submitting a PR. Use this skill when a task or
  batch of tasks is complete, between implementation phases, before creating
  a pull request, or when the agent is about to declare "done." Critical issues
  block progress — no exceptions.
---

# Requesting Code Review

Review your own work against the plan. Flag issues by severity. Critical issues block progress.

## When to Use

- A task or batch of tasks is complete
- Between major implementation phases
- Before creating a pull request
- Before telling the user "done" on any non-trivial change
- After a subagent completes delegated work

## How to Use

### Step 1: Compare Output to Plan

Pull up the original plan from `tasks/todo.md` and the design (if one exists):

1. **Does the implementation match the spec?** — Compare actual behavior to planned behavior
2. **Are all acceptance criteria met?** — Check each criterion explicitly
3. **Were any shortcuts taken?** — Note where the implementation deviated from the plan

### Step 2: Self-Review Checklist

Run through this checklist for every completed task:

| Check | Status |
|-------|--------|
| Implementation matches the plan spec | ✅/❌ |
| All tests pass (including new ones) | ✅/❌ |
| No debug artifacts left (console.log, TODO hacks) | ✅/❌ |
| Error handling covers edge cases | ✅/❌ |
| No security issues introduced | ✅/❌ |
| Code follows project conventions | ✅/❌ |
| Diff scope matches task scope (no extra changes) | ✅/❌ |

### Step 3: Flag Issues by Severity

```markdown
## Self-Review Summary

### 🔴 Critical (Blocks Progress)
- [issue] — Must fix before moving forward
  **Action:** [what needs to change]

### 🟡 Major (Should Fix)
- [issue] — Important but doesn't block the current task
  **Action:** [what needs to change]

### 🟢 Minor (Note for Later)
- [issue] — Nice to have, not urgent
  **Action:** [log for future]

### ✅ Passing
- Implementation matches spec
- Tests cover the new behavior
- Code follows existing patterns
```

### Step 4: Act on Findings

- **🔴 Critical** → STOP. Fix immediately. Do not proceed to the next task.
- **🟡 Major** → Fix before the PR, but can continue to the next task
- **🟢 Minor** → Log in `tasks/todo.md` as a follow-up item
- **✅ All clear** → Proceed to the next task or submit

### Step 5: Present Summary

Always show the user a brief review summary before declaring completion:

```markdown
**Review: Step 3 — Implement API endpoints**
- ✅ 4/4 endpoints implemented per spec
- ✅ Input validation on all routes
- 🟡 Missing rate limit on POST /users (logged for Step 6)
- ✅ 12 new tests, all passing
- Proceeding to Step 4.
```

## Examples

**Bad — No Self-Review:**
> Agent: "Done! I implemented all the endpoints."
> User: *finds missing error handling, wrong response codes, and a SQL injection*

**Good — Self-Review Catches Issues:**
> Agent: "Implementation complete. Self-review:
> - 🔴 The DELETE endpoint doesn't check authorization — fixing now.
> - ✅ All other endpoints match spec, 12 tests passing.
> - 🟢 Could add pagination to GET /users, logging for future.
>
> Fixing the auth check before proceeding..."

## Guidelines

- Self-review is mandatory between tasks, not optional
- Critical issues are non-negotiable blockers — fix before moving forward
- The review checks the plan, not just the code — did we build what we said we'd build?
- Be honest in self-review — hiding issues from yourself helps nobody
- Use the `code-review` skill format for detailed line-by-line review when needed

## Anti-Patterns

- **Skipping self-review** — "It works, ship it" is not a review
- **Downgrading severity** — A missing auth check is critical, not minor
- **Reviewing only happy paths** — Check edge cases and error paths too
- **Proceeding past critical issues** — The whole point is that criticals block
- **Rubber-stamp reviews** — "✅ All good" without actually checking is worse than no review
