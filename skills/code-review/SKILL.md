---
name: code-review
description: >-
  Guides the agent through structured code review — reading diffs, identifying issues,
  and providing actionable feedback. Use this skill when asked to review a PR, diff, or
  set of changes, when auditing code quality before merge, when checking for security
  issues or anti-patterns, or when the agent needs to evaluate its own output before
  presenting it to the user.
---

# Code Review

Review code like a senior engineer: systematic, constructive, and focused on what matters.

## When to Use

- Reviewing a pull request or diff
- Auditing changes before merge
- Checking for security vulnerabilities, anti-patterns, or style violations
- Self-reviewing agent output before presenting to the user
- When asked "does this look right?" about a piece of code

## How to Use

### Step 1: Understand Intent

Before reviewing the code, understand *what* it's trying to do:
- Read the PR description or commit message
- Understand the problem being solved
- Note the scope — is this a bug fix, feature, refactor, or config change?

### Step 2: Structural Review

Look at the big picture first:
- **Files changed** — Does the scope make sense for the stated intent?
- **Architecture** — Does this fit the existing patterns in the codebase?
- **Dependencies** — Are new dependencies justified?
- **Deletion ratio** — Good PRs often delete more than they add

### Step 3: Line-by-Line Review

Walk through the diff systematically:

| Category | What to Look For |
|----------|-----------------|
| **Correctness** | Logic errors, off-by-one, null handling, edge cases |
| **Security** | Injection, auth bypass, secrets in code, input validation |
| **Performance** | N+1 queries, unnecessary allocations, missing indexes |
| **Readability** | Naming, complexity, comments (too few or too many) |
| **Testing** | Are new paths covered? Are tests meaningful, not just present? |
| **Error handling** | Are errors handled or silently swallowed? |

### Step 4: Provide Actionable Feedback

Structure feedback by severity:

```markdown
## Review Summary

### 🔴 Must Fix (Blocking)
- [file:line] Issue description and why it matters
  **Suggestion:** Concrete fix

### 🟡 Should Fix (Non-Blocking)
- [file:line] Issue description
  **Suggestion:** Better approach

### 🟢 Nit (Optional)
- [file:line] Minor style or preference point

### ✅ What's Good
- Highlight things done well — positive reinforcement matters
```

## Examples

**Shallow Review:**
> "LGTM 👍"

**Structured Review:**
> "**Summary:** This PR adds rate limiting to the API. The approach is sound but there are two issues.
>
> 🔴 **Must Fix:** `api/middleware/rateLimit.ts:23` — The rate limit counter uses an in-memory Map which resets on server restart and doesn't work across multiple instances. Use Redis or the existing cache layer.
>
> 🟡 **Should Fix:** `api/middleware/rateLimit.ts:45` — The error response returns a 500 instead of 429 (Too Many Requests).
>
> ✅ **Good:** Clean separation of the middleware, good test coverage for the happy path."

## Guidelines

- Review the intent first, then the implementation
- Prefer concrete suggestions over vague criticism
- One review pass isn't always enough — re-read after understanding the full context
- If you're unsure about something, say so explicitly rather than guessing
- Give positive feedback too — it's not just about finding problems

## Anti-Patterns

- **LGTM without reading** — A rubber stamp review is worse than no review
- **Style wars** — Don't block a PR over formatting if there's a linter
- **Rewriting in the review** — Suggest direction, don't rewrite the whole function in a comment
- **Missing the forest for the trees** — Catching a typo but missing a SQL injection is a bad trade
- **Review without context** — Don't review code you don't understand. Read the surrounding code first.
