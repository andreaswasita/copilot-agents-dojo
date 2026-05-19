---
name: using-superpowers
description: Activates the dojo framework at the start of a session.
tier: core
category: activation
created_by: human
platforms: [windows, macos, linux]
tags: [activation, framework, session]
author: Andreas Wasita (@andreaswasita)
---

# Using Superpowers Skill

Loads the dojo framework at session start: confirms the core disciplines are active, surfaces relevant lessons, and verifies clean state before any work begins. Does NOT replace the underlying skills — it sequences their loading and the session opening ritual.

## When to Use

- At the start of every new session in a dojo-enabled repo.
- When the user says "use superpowers", "activate the dojo", or "start the framework".
- When another skill references the mandatory workflow.
- After resuming from a checkpoint or context handoff.
- NOT mid-session for already-active skills — re-loading wastes turns.

## Prerequisites

- The dojo is installed in the repo (`skills/`, `optional-skills/`, `tasks/`, `spec/`).
- The `view`, `edit`, `grep`, and `powershell` Copilot tools.
- `git` available to inspect branch + working tree.
- `tasks/lessons.md` exists (created empty if first session).
- `scripts/verify.sh` (or `scripts/run-checks.ps1`) available for the session-start gate.

## How to Run

```text
1. Review `tasks/lessons.md` for relevant active lessons.
2. Open `tasks/todo.md` — is there work in progress?
3. Confirm `git status`: right branch, clean tree (or known WIP).
4. Acknowledge: "Dojo framework active. Core disciplines loaded."
5. Hand off to the trigger skill for the user's actual request.
```

## Quick Reference

| Always-on (core) | Why it loads at every session |
|---|---|
| `plan-before-code` | Forces planning before any multi-step work |
| `verify-before-done` | Evidence required for any "done" claim |
| `self-improvement` | Lessons captured every correction |
| `demand-elegance` | Hacky solutions get challenged |
| `autonomous-bug-fix` | Full bug cycle without hand-holding |
| `subagent-strategy` | Delegation is a first-class option |

| Workflow chain (practical) | Triggered when |
|---|---|
| `brainstorming` → `plan-before-code` → `executing-plans` → `requesting-code-review` → `finishing-a-development-branch` | A non-trivial change begins |

| Workflow scenario | Workflow shape |
|---|---|
| New feature | Full pipeline: brainstorm → finish |
| Non-trivial bug fix | Skip brainstorm; start at plan |
| One-line fix | Direct fix + `verify-before-done` |
| Refactoring | Plan-first; emphasis on test baseline |
| PR review | `code-review` + `receiving-code-review` |

## Procedure

### Step 1: Lessons Review

Use `view` on `tasks/lessons.md`. Surface any entries whose `error_type` or `trigger` plausibly applies to the user's current request. Do not load every lesson — only the relevant ones.

### Step 2: In-Flight Work Check

Use `view` on `tasks/todo.md`. If there are unchecked items from a prior session, surface them — the user may want to resume rather than start fresh.

### Step 3: Git State Check

Run via the `powershell` tool:

```bash
git status --porcelain
git branch --show-current
```

Confirm: on a feature branch (not main), tree is clean (or any dirt is intentional and acknowledged).

### Step 4: Activate Acknowledgement

Post a short visible message:

```text
Dojo framework active.
- Core disciplines loaded (6).
- 2 relevant lessons surfaced from tasks/lessons.md.
- No work in progress.
- Branch: feature/<name>, clean tree.
```

### Step 5: Hand Off

The actual user request triggers the appropriate skill chain (`brainstorming`, `executing-plans`, `code-review`, etc.). This skill does not do the work — it ensures the context is correct before work begins.

## Enforcement Rules (set by activation)

1. All core skills are mandatory.
2. No code without a plan (one-liners exempted).
3. No merge without `scripts/verify.sh --check` passing.
4. No "done" without a Verification Results block.
5. Every correction becomes a lesson in `tasks/lessons.md`.
6. Main branch is read-only until `finishing-a-development-branch`.

## Pitfalls

- **DO NOT** re-activate mid-session if already loaded. Burns turns.
- **DO NOT** load every lesson regardless of relevance — context budget matters.
- **DO NOT** skip the git state check. Starting on a dirty tree corrupts the diff later.
- **DO NOT** silently start work on main. Activation must catch that.
- **DO NOT** pretend the framework is active without actually surfacing lessons and state.

## Verification

- [ ] `tasks/lessons.md` was opened with `view`.
- [ ] `tasks/todo.md` was opened with `view` and in-progress work surfaced.
- [ ] `git status` and `git branch --show-current` ran via `powershell`.
- [ ] The activation acknowledgement message was posted.
- [ ] If on `main`, the user was prompted to create a feature branch before any code change.
