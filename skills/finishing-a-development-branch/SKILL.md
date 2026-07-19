---
name: finishing-a-development-branch
description: Verifies, summarises, and closes a development branch.
tier: practical
category: workflow
created_by: human
platforms: [windows, macos, linux]
tags: [git, merge, lifecycle]
author: Andreas Wasita (@andreaswasita)
---

# Finishing a Development Branch Skill

Runs the closing ritual for a completed branch or worktree: final verification, full diff review, options presented to the user, chosen action executed, cleanup, and a logged retrospective. Does NOT merge without explicit user consent.

## When to Use

- All tasks in `tasks/todo.md` are marked complete.
- User says "merge", "we're done", "ship it", or "finish up".
- A feature branch or worktree is ready for integration.
- Ending a session that produced completed work.

## Prerequisites

- All planned tasks complete with Verification Results blocks.
- `git` configured with author identity and remote access.
- `gh` CLI authenticated (for PR option).
- The `powershell` tool to run gates and `git`.
- A clean working tree.

## How to Run

```text
1. Run the dojo gate + full test suite. All green.
2. Review the full diff against main.
3. Present options: merge / PR / keep / discard.
4. Wait for the user to choose.
5. Execute the chosen action.
6. Clean up worktree, branch, and tasks/todo.md.
7. Log the retrospective in tasks/lessons.md.
```

## Quick Reference

| Option | Commands |
|---|---|
| Merge | `git checkout main && git merge --squash <branch> && git commit && git branch -d <branch>` |
| PR | `git push -u origin <branch> && gh pr create --fill` |
| Keep | (no-op) leave the branch as-is |
| Discard | `git checkout main && git branch -D <branch>` |

| Verification check | Command |
|---|---|
| Dojo gate | `bash scripts/verify.sh --check` |
| Full tests | `npm test` / `pytest` / `go test ./...` / `dotnet test` |
| Clean tree | `git status --porcelain` |
| Full diff | `git diff main --stat` then `git diff main` |
| Commit log | `git log main..HEAD --oneline` |

## Procedure

### Step 1: Final Verification

Run via the `powershell` tool:

```bash
bash scripts/verify.sh --check
git status --porcelain
git log main..HEAD --oneline
git diff main --stat
```

All checks must pass. Anything failing → fix it, do not force-merge.

### Step 2: Review the Full Diff

Walk the cumulative diff. Ask:

- Does the total change match the original plan?
- Are there commits that should not be here?
- Is the history readable end-to-end?

### Step 3: Present Options

```markdown
## Branch Complete: feature/add-search

**Summary:** Full-text search with 3 endpoints, Elasticsearch integration, 24 new tests.
**Stats:** 8 commits, 12 files changed, +420 / -30 lines.

**Options:**
1. Merge to main (squash + delete branch)
2. Open a PR
3. Keep the branch as-is
4. Discard the branch and all changes
```

Wait for the user's explicit choice.

### Step 4: Execute the Chosen Option

Run the commands from the Quick Reference table for the chosen option. Confirm completion with the user.

### Step 5: Cleanup

- Remove worktree if used: `git worktree remove ../<workdir>`.
- Reset or archive `tasks/todo.md`.
- Confirm `git status` on `main` is clean.

### Step 6: Retrospective

Append to `tasks/lessons.md`:

```yaml
- date: 2026-05-19
  type: session-retrospective
  feature: "full-text search"
  went_well: "TDD caught 2 edge cases before they shipped"
  went_poorly: "Underestimated Elasticsearch config — took 2x planned time"
  lesson: "Account for infrastructure setup in time estimates for new services"
```

Without the retrospective, the dojo does not learn from this branch.

## Pitfalls

- **DO NOT** merge without an explicit user choice. Always present options.
- **DO NOT** force-merge past a failing gate. Fix the failure or back out.
- **DO NOT** leave orphaned worktrees behind.
- **DO NOT** skip the retrospective. Every branch teaches something — capture it.
- **DO NOT** discard a branch without confirmation. Deletion is irreversible to the user.

## Verification

- [ ] `verify.sh --check` exits 0.
- [ ] Full test suite is green.
- [ ] User explicitly chose the closing option.
- [ ] Branch action executed and confirmed.
- [ ] Worktree (if any) is removed; `tasks/todo.md` reset or archived.
- [ ] Retrospective entry exists in `tasks/lessons.md`.
