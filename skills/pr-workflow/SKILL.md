---
name: pr-workflow
description: Prepares branches and PRs for clean, reviewable merges.
tier: practical
category: workflow
created_by: human
platforms: [windows, macos, linux]
tags: [git, pr, review]
author: Andreas Wasita (@andreaswasita)
---

# PR Workflow Skill

Takes a working branch from "the code works" to "this is ready for a human reviewer": pre-flight checks, clean commits, a real description, self-review, and disciplined handling of feedback. Does NOT create draft "WIP" PRs that sit open for days.

## When to Use

- Preparing a feature branch for review.
- Opening a pull request.
- Writing or rewriting a PR description.
- Restructuring commits before review.
- The user says "submit this" or "get this ready for review".

## Prerequisites

- `git` configured with author identity.
- `gh` CLI authenticated for PR creation (or web access to the host).
- The `powershell` tool to run `git`, the test suite, and `scripts/verify.sh`.
- A green test suite on the branch.

## How to Run

```text
1. Pre-flight: tests green, working tree clean, scope reviewed.
2. Clean up commits with interactive rebase if needed.
3. Push the branch.
4. Open the PR with a structured description.
5. Self-review the diff (use the `code-review` skill).
6. Address feedback in new commits — do not force-push during active review.
```

## Quick Reference

| Step | Command (run via `powershell`) | Notes |
|---|---|---|
| Pre-flight tests | `npm test` / `pytest` / `go test ./...` | Must exit 0 |
| Dojo gate | `bash scripts/verify.sh --check` | Must exit 0 |
| Clean tree | `git status --porcelain` | Empty |
| Review scope | `git diff main --stat` | Matches plan |
| Tidy history | `git rebase -i main` | Optional, before push |
| Push | `git push -u origin <branch>` | First push of branch |
| Open PR | `gh pr create --fill` then edit body | Or use the GitHub UI |

## Procedure

### Step 1: Pre-Flight

Run via the `powershell` tool:

```bash
bash scripts/verify.sh --check
git status --porcelain
git diff main --stat
```

If anything fails, fix it before proceeding. A PR opened on a red branch wastes reviewer time.

### Step 2: Clean Up Commits

Interactive rebase if the history is noisy:

```bash
git rebase -i main
```

Squash fixups. Reword unclear messages. Aim for a sequence that reads like a story:

```text
feat: add rate limiting middleware
test: cover rate limit burst traffic
docs: document rate limit configuration
```

Commit message format:

```text
<type>: <short description>

<body — what and why, not how>

Types: feat, fix, refactor, test, docs, chore
```

### Step 3: Write the PR Description

```markdown
## What
<Brief description.>

## Why
<Problem solved. Link the issue.>

## How
<High-level approach. Key design decisions.>

## Testing
<How was this tested? What should the reviewer verify?>

## Checklist
- [ ] Tests pass
- [ ] No regressions
- [ ] Docs updated (if applicable)
- [ ] `tasks/todo.md` reflects completion
```

### Step 4: Self-Review

Before requesting a human reviewer:

1. Open the PR on GitHub and read the diff in the web UI (different lens than local).
2. Run the `code-review` skill on your own change.
3. Check for debug artifacts: `console.log`, `print()`, `TODO`, commented-out code.
4. Confirm the file list matches the stated scope.

### Step 5: Handle Review Feedback

- Address every comment (use the `receiving-code-review` skill).
- Push fixes as new commits during active review.
- Squash fixup commits just before merge.

## Pitfalls

- **DO NOT** open mega PRs (>400 lines changed across many files). Split them.
- **DO NOT** force-push during active review — reviewers lose context.
- **DO NOT** mix refactoring and feature work in one PR — separate them.
- **DO NOT** omit the description. Reviewers should not have to reverse-engineer intent.
- **DO NOT** leave WIP PRs open. Either it is ready for review or it is a draft you actively work on.

## Verification

- [ ] `scripts/verify.sh --check` exits 0 locally before push.
- [ ] PR description has What / Why / How / Testing sections.
- [ ] Commit history is readable (no `wip`, no `fix stuff`).
- [ ] Diff scope matches the stated intent.
- [ ] Self-review was run via the `code-review` skill before requesting human review.
