---
name: finishing-a-development-branch
description: >-
  Final verification, merge decision, and cleanup for a completed development
  branch or worktree. Use this skill when all planned tasks are complete, when
  the user says "merge this," "we're done," or "finish up," when a feature
  branch is ready for integration, or when wrapping up a worktree session. This
  is the last skill in the mandatory workflow.
---

# Finishing a Development Branch

All tasks done? Prove it. Then decide: merge, PR, keep, or discard. Clean up after yourself.

## When to Use

- All tasks in `tasks/todo.md` are marked complete
- User says "merge," "we're done," "ship it," or "finish up"
- A feature branch or worktree is ready for integration
- End of a development session that produced completed work

## How to Use

### Step 1: Final Verification

Run the complete verification suite — no shortcuts:

```bash
# Automated verification
bash scripts/verify.sh

# Manual verification if no script
git status                    # Clean working tree
git diff main --stat          # Review full scope of changes
# Run the project's full test suite
```

All checks must pass. If anything fails, fix it before proceeding.

### Step 2: Review the Full Diff

Look at everything that changed:

```bash
git log main..HEAD --oneline   # All commits
git diff main --stat           # Files changed
git diff main                  # Full diff
```

Ask:
- Does the total diff match the original plan?
- Are there any commits that shouldn't be here?
- Is the commit history clean and readable?

### Step 3: Present Options to the User

**Never merge without explicit user consent.** Present the options:

```markdown
## Branch Complete: feature/add-search

**Summary:** Added full-text search to the API with 3 new endpoints,
Elasticsearch integration, and 24 tests.

**Stats:** 8 commits, 12 files changed, +420 / -30 lines

**Options:**
1. **Merge to main** — Squash-merge and delete branch
2. **Open a PR** — Create a pull request for team review
3. **Keep the branch** — Leave it for later; don't merge yet
4. **Discard** — Delete the branch and all changes
```

Wait for the user to choose.

### Step 4: Execute the Chosen Option

**Merge:**
```bash
git checkout main
git merge --squash feature/add-search
git commit -m "feat: add full-text search with Elasticsearch"
git branch -d feature/add-search
```

**PR:**
```bash
git push origin feature/add-search
# Create PR via GitHub CLI or web
gh pr create --title "feat: add full-text search" --body "..."
```

**Keep:**
```bash
# Nothing to do — branch stays as-is
echo "Branch feature/add-search preserved for later."
```

**Discard:**
```bash
git checkout main
git branch -D feature/add-search
```

### Step 5: Clean Up

After the chosen action:

1. **Clean up the worktree** (if used):
   ```bash
   git worktree remove ../project-search
   ```
2. **Update `tasks/lessons.md`** — Log what went well and what didn't
3. **Reset `tasks/todo.md`** — Clear completed plan or archive it
4. **Verify main is clean** — `git status` on main

### Step 6: Capture Lessons

Every completed branch teaches something. Update `tasks/lessons.md`:

```yaml
- date: 2026-03-24
  type: session-retrospective
  feature: "full-text search"
  went_well: "TDD approach caught 2 edge cases before they shipped"
  went_poorly: "Elasticsearch config was underestimated — took 2x planned time"
  lesson: "Account for infrastructure setup in time estimates for new services"
```

## Examples

**Bad — Silent Merge:**
> Agent: *merges to main without telling the user, leaves worktree orphaned*

**Good — Structured Finish:**
> Agent: "All 5 tasks complete. Running final verification...
> ✅ 47 tests pass (24 new)
> ✅ Clean working tree
> ✅ Diff matches plan scope
>
> Options: merge / PR / keep / discard?"
>
> User: "Open a PR"
>
> Agent: "PR created. Cleaning up worktree. Lessons logged."

## Guidelines

- Never merge without user consent — always present options
- Full test suite must pass before any merge decision
- Clean up worktrees and branches after the decision is made
- Always log lessons — every branch teaches something
- If verification fails, go back to implementation, don't force-merge

## Anti-Patterns

- **Merging without testing** — "It worked in development" is not verification
- **Leaving orphaned worktrees** — Clean up after yourself
- **Skipping the retrospective** — The lessons log is how the dojo improves over time
- **Force-merging past failures** — If tests fail, the branch isn't done
- **Discarding without confirmation** — Deleting someone's work requires explicit consent
