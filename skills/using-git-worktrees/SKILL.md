---
name: using-git-worktrees
description: Isolates each task in its own git worktree off main.
tier: practical
category: workflow
created_by: human
platforms: [windows, macos, linux]
tags: [git, worktree, isolation]
author: Andreas Wasita (@andreaswasita)
---

# Using Git Worktrees Skill

Creates an isolated git worktree on a dedicated feature branch for every development task, so `main` is never touched until `finishing-a-development-branch` says so. Does NOT replace feature branches when worktrees are impractical (CI, single-file fix) — the isolation principle is what matters.

## When to Use

- Starting any non-trivial development task (default behavior).
- Before the agent would otherwise modify code on `main`.
- When parallel development tracks are needed (multiple worktrees in flight).
- After `brainstorming` produces an approved design.
- NOT for a one-line typo fix where a branch is sufficient.

## Prerequisites

- `git` ≥ 2.5 with worktree support.
- The repository is already cloned (a worktree extends an existing clone).
- The `powershell` Copilot tool to run `git`.
- A naming convention agreed for the branch: `feature/*`, `fix/*`, `experiment/*`.
- The project's dependency install command (`npm install`, `pip install -r requirements.txt`, etc.).

## How to Run

```text
1. From the main repo root, create the worktree with a new branch.
2. Change into the worktree directory.
3. Install dependencies inside it.
4. Confirm a green test baseline.
5. Work only inside the worktree — never touch the main worktree.
```

## Quick Reference

| Operation | Command |
|---|---|
| Create | `git worktree add ../<dirname> -b <branch>` |
| List | `git worktree list` |
| Remove | `git worktree remove ../<dirname>` |
| Prune stale | `git worktree prune` |

| Branch prefix | Use |
|---|---|
| `feature/<slug>` | New features |
| `fix/<slug>` | Bug fixes |
| `experiment/<slug>` | Spikes / throwaway |

| Dependency bootstrap | Detect signal |
|---|---|
| `npm install` | `package.json` |
| `pip install -r requirements.txt` | `requirements.txt` |
| `go mod download` | `go.mod` |
| `mvn dependency:resolve` | `pom.xml` |
| `dotnet restore` | `*.csproj` |

## Procedure

### Step 1: Create the Worktree

From the main repo root, run via the `powershell` tool:

```bash
git worktree add ../project-feature-name -b feature/feature-name
cd ../project-feature-name
```

Use a directory name that is obviously not the main repo so you cannot edit the wrong one by accident.

### Step 2: Install Dependencies

Detect the stack from the table above and run the matching install command. A worktree shares `.git`, not `node_modules` / `.venv` / build artifacts.

### Step 3: Establish a Green Baseline

Run the project's test command via the `powershell` tool. Capture pass/fail counts before changing any code. If the baseline is red, fix it first or explicitly acknowledge the broken tests in `tasks/todo.md`.

```bash
git status --porcelain         # must be empty
git branch --show-current      # must be the new feature branch
<project test command>         # must exit 0 for a clean baseline
```

### Step 4: Work Inside the Worktree

All commits go to the feature branch. The main repo's working tree is read-only for the duration. Open files and run commands only from inside the worktree directory.

### Step 5: When Worktrees Are Impractical

For CI environments, single-file fixes, or systems without worktree support:

```bash
git checkout -b feature/<slug>
```

The isolation principle still applies: never commit to `main`.

### Step 6: Cleanup (handled later)

Worktree teardown is owned by `finishing-a-development-branch`. Do not remove the worktree mid-task.

## Pitfalls

- **DO NOT** commit to `main`. Not even once. That is how production breaks.
- **DO NOT** reuse a stale worktree from a prior task. Create a fresh one.
- **DO NOT** skip the baseline test run. Unknown baseline = unverifiable changes.
- **DO NOT** leave orphaned worktrees behind. `git worktree list` to audit; cleanup belongs to the finishing skill.
- **DO NOT** edit files across multiple worktrees in one task. One worktree, one task.

## Verification

- [ ] `git worktree list` shows the new worktree.
- [ ] Current directory matches the worktree path; current branch is the new feature branch.
- [ ] Dependencies installed inside the worktree.
- [ ] Test baseline captured (counts recorded in `tasks/todo.md`).
- [ ] `git status --porcelain` was empty before the first code change.
