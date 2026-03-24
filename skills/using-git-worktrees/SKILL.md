---
name: using-git-worktrees
description: >-
  Ensures every development session starts in an isolated git worktree on a
  dedicated feature branch. Use this skill at the start of any development task,
  when the agent is about to modify code on main, when parallel development
  tracks are needed, or when the user says "start working on" a feature.
  The main branch remains untouched until finishing-a-development-branch.
---

# Using Git Worktrees

Isolated workspace for every session. Main stays clean. Always.

## When to Use

- Starting any development task (mandatory)
- When the agent is about to commit directly to main
- When parallel development tracks are needed
- User says "start working on..." or "implement..."
- After brainstorming produces an approved design

## How to Use

### Step 1: Create a Worktree

Every task gets its own isolated workspace:

```bash
# From the main repo root
git worktree add ../project-feature-name -b feature/feature-name

# Navigate to the worktree
cd ../project-feature-name
```

Branch naming convention:
- Features: `feature/short-description`
- Fixes: `fix/short-description`
- Experiments: `experiment/short-description`

### Step 2: Set Up the Worktree

Run project setup in the new worktree:

```bash
# Install dependencies (auto-detect)
[ -f package.json ] && npm install
[ -f requirements.txt ] && pip install -r requirements.txt
[ -f go.mod ] && go mod download
[ -f pom.xml ] && mvn dependency:resolve

# Verify clean test baseline
# Run whatever test command the project uses
```

### Step 3: Verify Clean Baseline

Before writing any code, confirm:
1. **All tests pass** — If tests fail before you start, fix that first or note it
2. **No uncommitted changes** — Start from a clean state
3. **You're on the feature branch** — `git branch --show-current`

```bash
git status        # Should be clean
git branch        # Should show your feature branch
# Run tests to establish baseline
```

### Step 4: Work Inside the Worktree

All development happens inside this worktree:
- Commits go to the feature branch
- Main branch is never touched directly
- Other worktrees for other tasks can run in parallel

### When Worktrees Aren't Available

If git worktrees aren't practical (e.g., CI environment, simple single-file fix):
- Create a regular feature branch: `git checkout -b feature/name`
- The principle still applies: never work directly on main

## Examples

**Bad — Working on Main:**
> User: "Add search to the API"
> Agent: *starts editing files on the main branch, commits directly to main*

**Good — Worktree Isolation:**
> User: "Add search to the API"
> Agent: "Creating an isolated worktree for this feature:
> ```
> git worktree add ../project-search -b feature/add-search
> cd ../project-search
> npm install
> npm test  # baseline: 47 tests pass
> ```
> Clean baseline established. Ready to implement."

## Guidelines

- One worktree per task — don't reuse worktrees for unrelated work
- Always verify tests pass before writing code (clean baseline)
- Main branch is read-only until `finishing-a-development-branch` approves a merge
- Clean up worktrees when the branch is done (the finishing skill handles this)
- If you can't use worktrees, use feature branches — the isolation principle is what matters

## Enforcement

Main branch remains untouched until `finishing-a-development-branch` skill approves. Any attempt to commit directly to main should be flagged and redirected.

## Anti-Patterns

- **Committing to main** — Never. Not even "just this once." That's how production breaks.
- **Reusing a stale worktree** — Old worktrees may be out of date. Create fresh ones.
- **Skipping the baseline** — If you don't know the test baseline, you can't verify your changes
- **Leaving orphaned worktrees** — Clean up after finishing. `git worktree list` to audit.
- **Working across worktrees** — Each worktree is one task. Don't cross the streams.
