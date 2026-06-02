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
| Bug fix (non-trivial) | Skip brainstorm, start at plan |
| One-line fix | Direct fix + verify-before-done |
| Refactoring | Start at plan, emphasis on test baseline |
| Code review | Use code-review + receiving-code-review |

## Procedure

### Skill Activation Map

**Always active (Core Disciplines):**
- `plan-before-code` — Plan multi-step work before touching code
- `verify-before-done` — Prove your work with evidence
- `self-improvement` — Capture lessons, review at session start
- `demand-elegance` — Challenge hacky solutions
- `autonomous-bug-fix` — Full bug cycle, zero hand-holding
- `subagent-strategy` — Delegate research and analysis

**Workflow skills (activate in sequence):**
- `brainstorming` → `using-git-worktrees` → `executing-plans` → `requesting-code-review` → `finishing-a-development-branch`

**On-demand skills (load when needed):**
- `code-review` — Reviewing PRs or diffs
- `refactoring` — Safe restructuring
- `test-writing` — Writing meaningful tests
- `pr-workflow` — Preparing merge-ready PRs
- `debugging` — Systematic complex debugging
- `codebase-onboarding` — Understanding unfamiliar repos
- `dispatching-parallel-agents` — Concurrent sub-agent work
- `receiving-code-review` — Processing review feedback
- `skill-creator` / `writing-skills` — Creating new skills

### Session Start Ritual

Every session begins with:

1. Read `memory/INDEX.md` — What knowledge exists in the vault?
2. Query relevant context — `bash scripts/memory-query.sh --type pattern --recent 5`
3. Review `tasks/lessons.md` — Any un-promoted lessons?
4. Check `tasks/todo.md` — Is there work in progress?
5. Verify git status — Are we on the right branch? Clean state?
6. Acknowledge active skills — "Dojo framework active. Memory vault loaded. All skills live."

## Session End Ritual

Every non-trivial session ends with:

1. Write session summary — `memory/sessions/YYYY-MM-DD-summary.md`
2. Promote patterns — Any lessons at 3+ occurrences? Move to `memory/patterns/`
3. Record decisions — Any architectural choices? Log in `memory/decisions/`
4. Capture preferences — User corrections about style/approach? Log in `memory/preferences/`
5. Rebuild the graph — `bash scripts/link-index.sh`
6. Update lessons metrics — `tasks/lessons.md`

### Enforcement Rules

1. **All skills are mandatory** — No skipping steps in the workflow
2. **No code without a plan** (unless one-liner fix)
3. **No merge without verification** — `scripts/verify.sh` or equivalent
4. **No "done" without proof** — Tests, logs, diffs
5. **Every correction becomes a lesson** — `tasks/lessons.md`
6. **Every session ends with a summary** — `memory/sessions/`
7. **Patterns are promoted, not buried** — 3+ occurrences → `memory/patterns/`
8. **Main branch is read-only** — Work on feature branches/worktrees

### Examples

**Session Start:**
> Agent: "Dojo framework active. Memory vault loaded (4 decisions, 7 patterns,
> 3 preferences). Reviewed lessons.md (3 active lessons, 1 relevant to today's
> task). No work in progress. On main branch, clean state. Ready."

**Skill Triggering:**
> User: "I want to add real-time notifications"
> Agent: *brainstorming activates* → asks Socratic questions → design approved
> → *using-git-worktrees activates* → creates feature branch
> → *plan-before-code activates* → writes plan to tasks/todo.md
> → *executing-plans activates* → works through tasks
> → *requesting-code-review activates* → self-reviews
> → *finishing-a-development-branch activates* → presents merge options

## Pitfalls

- **"I'll skip brainstorming, I know what to build"** — You don't. Ask questions.
- **"I'll just commit to main this once"** — You won't "just" anything. Use a branch.
- **"Tests take too long, I'll add them later"** — Later never comes. Test now.
- **"The plan is in memory only"** — Write it in `tasks/todo.md` or it doesn't exist.
- **"I already know everything"** — Review `tasks/lessons.md`. You forgot something.

## Verification

- [ ] `memory/INDEX.md` was read and active context surfaced.
- [ ] `tasks/lessons.md` reviewed and any relevant rules acknowledged.
- [ ] `tasks/todo.md` checked for work-in-progress before starting new work.
- [ ] `git status` confirms correct branch and clean (or known-WIP) tree.
- [ ] Acknowledgement message issued ("Dojo framework active…").
- [ ] All Core Discipline skills are loaded for the session.
- [ ] Session-end ritual scheduled (summary + pattern promotion + link rebuild).
