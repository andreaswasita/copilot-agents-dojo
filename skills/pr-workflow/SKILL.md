---
name: pr-workflow
description: >-
  Guides the agent through a complete pull request workflow — from branch creation to
  merge-ready state. Use this skill when creating a PR, preparing changes for review,
  writing PR descriptions, or structuring commits for clean git history. Also use when
  the user asks to "submit this" or "get this ready for review."
---

# PR Workflow

A disciplined pull request workflow turns messy changes into reviewable, mergeable work.

## When to Use

- Preparing changes for review
- Creating a pull request
- Writing PR descriptions
- Structuring commits for clean git history
- User says "submit this" or "get this ready for review"

## How to Use

### Step 1: Pre-Flight Checks

Before creating a PR, run through the verify-before-done checklist:

```bash
# Run automated verification if available
bash scripts/verify.sh

# Manual checks
git status                    # Clean working tree
git diff main --stat          # Review scope of changes
npm test                      # (or equivalent) All tests pass
```

### Step 2: Clean Up Commits

Good PRs tell a story through their commits:

```bash
# Interactive rebase to clean up history
git rebase -i main

# Commit message format
<type>: <short description>

<body — what and why, not how>

# Types: feat, fix, refactor, test, docs, chore
```

**Good commit history:**
```
feat: add rate limiting middleware
test: add rate limit tests for burst traffic
docs: document rate limit configuration
```

**Bad commit history:**
```
wip
fix stuff
more fixes
actually fix it this time
```

### Step 3: Write the PR Description

Every PR needs context for reviewers:

```markdown
## What

Brief description of the change.

## Why

What problem does this solve? Link to issue if applicable.

## How

High-level approach. What are the key design decisions?

## Testing

How was this tested? What should reviewers verify?

## Checklist

- [ ] Tests pass
- [ ] No regressions
- [ ] Documentation updated (if applicable)
- [ ] `tasks/todo.md` reflects completion
```

### Step 4: Self-Review

Before requesting review:
1. Read the full diff on GitHub/in your tool
2. Use the code-review skill on your own changes
3. Check for debug artifacts (console.log, TODO comments, commented-out code)
4. Verify file changes match the stated scope

### Step 5: Address Review Feedback

When feedback comes in:
- Address each comment explicitly
- Push fixes as new commits (don't force-push during review)
- Squash fixup commits before merge

## Examples

**Minimal PR Description:**
> "Fixed the thing"

**Complete PR Description:**
> ## What
> Add JWT token refresh for long-lived sessions.
>
> ## Why
> Users on the mobile app lose their session after 15 minutes (#234).
> The current JWT expiry is fixed at 15min with no refresh mechanism.
>
> ## How
> - Added `/auth/refresh` endpoint that accepts a valid refresh token
> - Refresh tokens have 7-day expiry, stored in HttpOnly cookies
> - Access tokens now have 1-hour expiry (up from 15min)
>
> ## Testing
> - 12 new tests covering refresh flow, expiry, and token reuse prevention
> - Manual testing with mobile app confirmed session persists
>
> ## Checklist
> - [x] Tests pass (47 total, 12 new)
> - [x] No regressions
> - [x] API docs updated

## Guidelines

- One concern per PR — don't bundle unrelated changes
- Keep PRs small (<400 lines changed) when possible
- The PR description is for the reviewer's context, not yours — write for someone who doesn't know what you know
- Link to issues, design docs, or conversations that provide context

## Anti-Patterns

- **Mega PRs** — 2000 lines changed across 40 files. Nobody can review this effectively.
- **"WIP" PRs that stay WIP** — If it's not ready, don't request review
- **Mixing refactoring and features** — Separate PRs. Always.
- **Force-pushing during review** — Reviewers lose context when history is rewritten
- **No description** — Forcing reviewers to reverse-engineer intent from code
