---
name: code-review
description: Reviews diffs by severity to produce actionable feedback.
tier: practical
category: workflow
created_by: human
platforms: [windows, macos, linux]
tags: [review, quality, pr]
author: Andreas Wasita (@andreaswasita)
---

# Code Review Skill

Reviews diffs and PRs the way a senior engineer would: intent first, structure second, line-by-line third. Produces feedback grouped by severity (🔴 must / 🟡 should / 🟢 nit) with concrete suggestions. Does NOT rewrite the author's code — it directs, it does not replace.

## When to Use

- Reviewing a pull request, branch diff, or staged changes.
- Auditing changes before merge.
- Self-reviewing the agent's own output before presenting it.
- Hunting for security, correctness, or performance regressions.
- The user asks "does this look right?" about a code change.

## Prerequisites

- The `view`, `grep`, and `glob` Copilot tools to read code.
- `git` available so diffs can be inspected (`git diff main`, `git log`).
- Read access to the repository being reviewed.
- For PR-scoped review: `gh` CLI authenticated to fetch PR metadata.

## How to Run

```text
1. Read the PR title, description, and linked issue.
2. List changed files (`git diff main --stat`) and assess scope.
3. Walk the diff with the `view` tool, file by file.
4. Apply the severity rubric below.
5. Emit a structured review block with concrete fixes.
```

## Quick Reference

| Phase | Tool | What to check |
|---|---|---|
| Intent | PR description, linked issue | Why does this change exist? |
| Scope | `git diff main --stat` | Files changed match stated intent |
| Correctness | `view` on hot paths | Logic, null/edge handling, off-by-one |
| Security | `grep` for secrets, raw SQL, eval | Injection, auth bypass, leaked secrets |
| Performance | `view` on loops, queries | N+1, unbounded allocations, missing indexes |
| Tests | `view` on test files | New paths actually covered |

## Procedure

### Step 1: Understand Intent

Read the PR description, commit messages, and any linked issue. If intent is unclear, stop and ask the author — reviewing code whose purpose you don't understand wastes everyone's time.

### Step 2: Structural Pass

Use `git diff main --stat` to size the change. Check:

- Does the file list match the stated scope?
- Are new dependencies justified?
- Does the change fit existing patterns in the repo?
- Is the deletion ratio healthy? (Good PRs often delete as much as they add.)

### Step 3: Line-by-Line Pass

Walk each changed file with `view`. Apply the rubric:

| Category | Look for |
|---|---|
| Correctness | Logic errors, off-by-one, null handling, missing edge cases |
| Security | Injection, auth bypass, secrets in code, weak input validation |
| Performance | N+1 queries, unbounded allocations, missing indexes |
| Readability | Naming, complexity, comments (too few or too many) |
| Testing | New paths actually covered, tests meaningful (not assert-true) |
| Error handling | Errors handled or silently swallowed |

### Step 4: Emit Structured Feedback

```markdown
## Review Summary

### 🔴 Must Fix (Blocking)
- `path/to/file.ts:42` — <issue> + **Suggestion:** <concrete fix>

### 🟡 Should Fix (Non-Blocking)
- `path/to/file.ts:88` — <issue> + **Suggestion:** <better approach>

### 🟢 Nit (Optional)
- `path/to/file.ts:120` — <style or preference point>

### ✅ What's Good
- <Highlight something done well — positive reinforcement matters.>
```

## Pitfalls

- **DO NOT** rubber-stamp ("LGTM 👍") without reading the diff — worse than no review.
- **DO NOT** block a PR over formatting if a linter exists — that is the linter's job.
- **DO NOT** rewrite the author's code in the review thread. Suggest direction; do not freelance.
- **DO NOT** miss the forest for the trees. Catching a typo while missing a SQL injection is a bad trade.
- **DO NOT** review code you do not understand. Read the surrounding code first.

## Verification

- [ ] Every changed file was opened with `view` at least once.
- [ ] Each issue cites a file and line number.
- [ ] Severity buckets used (🔴 / 🟡 / 🟢 / ✅).
- [ ] At least one positive observation included.
- [ ] If 🔴 issues exist, the PR is explicitly marked NOT ready to merge.
