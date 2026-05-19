---
name: receiving-code-review
description: Processes review feedback until the change is approved.
tier: practical
category: workflow
created_by: human
platforms: [windows, macos, linux]
tags: [review, feedback, iteration]
author: Andreas Wasita (@andreaswasita)
---

# Receiving Code Review Skill

Processes every review comment — human, agent, or CI — until the change is approved. Each comment is categorized, addressed, verified, and answered. Does NOT silently ignore comments and does NOT amend the original commit during active review.

## When to Use

- Review comments received on a pull request.
- User provides corrections or improvement suggestions.
- The `requesting-code-review` skill flagged issues.
- CI/CD checks fail with actionable feedback.
- A sub-agent's review output needs to be addressed.

## Prerequisites

- The list of comments (PR thread, CI log, or chat).
- The `view`, `edit`, `grep`, and `powershell` Copilot tools.
- `git` for new commits and `gh` for PR threads (when relevant).
- A green baseline test run.

## How to Run

```text
1. Read every comment. Categorize by action.
2. For each comment: fix, verify, respond, mark resolved.
3. Re-run the full test suite after all fixes.
4. Re-self-review with the `requesting-code-review` skill.
5. Update `tasks/todo.md` and (if pattern recurring) `tasks/lessons.md`.
6. Request re-review with a short summary.
```

## Quick Reference

| Category | Action |
|---|---|
| Agree — will fix | Fix it. No debate. |
| Agree — won't fix now | Log as follow-up with reason |
| Disagree — with evidence | Respond with reasoning and evidence |
| Need clarification | Ask one focused follow-up |
| Already addressed | Link to the commit / line |

| Phase | Tool |
|---|---|
| Read comments | `gh pr view` / PR UI |
| Apply fix | `edit` |
| Verify fix | `powershell` → test runner |
| Respond | `gh pr comment` / PR UI |
| Track resolution | Checklist in `tasks/todo.md` |

## Procedure

### Step 1: Acknowledge and Categorize

Read every comment. Categorize each using the table above. Track them in `tasks/todo.md` as a Review Feedback section:

```markdown
### Review Feedback (Round 1)
- [ ] Comment #1: missing error handling — agree, will fix
- [ ] Comment #2: rename for clarity — agree, will fix
- [ ] Comment #3: add pagination — agree, follow-up (out of scope)
```

### Step 2: Address Each Comment

For every comment:

1. Fix the issue with `edit`.
2. Run the relevant tests via the `powershell` tool.
3. Respond on the thread with what changed and why (cite commit SHA).
4. Tick the checkbox in `tasks/todo.md`.

```markdown
### Comment #1: missing error handling — @reviewer
**Action:** Added try/catch with 502 response on upstream failure (commit `abc1234`).
**Verification:** New test covers the failure path.
```

### Step 3: Re-Verify After All Fixes

Run the full test suite — not just the tests for the changed lines. Re-run the dojo gate:

```bash
bash scripts/verify.sh --check
```

Re-self-review with the `requesting-code-review` skill. Every fix is a potential new bug.

### Step 4: Record Lessons If The Pattern Repeats

If review keeps catching the same shape of issue, append to `tasks/lessons.md`:

```yaml
- date: 2026-05-19
  error_type: missing-error-handling
  trigger: "Reviewer caught missing try/catch on external API call"
  root_cause: "Did not consider failure modes for external dependencies"
  fix: "Wrapped call in retry + circuit breaker"
  rule: "Every external API call has an explicit failure path with a test"
  occurrences: 2
  status: active
```

### Step 5: Request Re-Review

```markdown
**Re-review ready**
- Addressed 2/3 comments directly
- 1 logged as follow-up (out of scope)
- All tests pass (49 total, 2 new)
- Self-review clean
```

Push fixes as new commits while review is active. Squash fixup commits just before merge — not during.

## Pitfalls

- **DO NOT** ignore a comment. Every comment gets a response, even "won't fix, here's why".
- **DO NOT** be defensive. "It works in my tests" is not a response to "this could be better".
- **DO NOT** force-push during active review. Reviewers lose context.
- **DO NOT** fix one comment in isolation and skip retesting. Re-verify after every round.
- **DO NOT** treat repeat feedback as random. If the same theme keeps coming back, log a lesson.

## Verification

- [ ] Every comment is checked off in `tasks/todo.md`.
- [ ] Every comment has an explicit thread response (action + commit reference).
- [ ] Full test suite re-run after all fixes; exit 0.
- [ ] `requesting-code-review` re-run after fixes; no new 🔴 findings.
- [ ] If a pattern repeated, `tasks/lessons.md` was updated.
