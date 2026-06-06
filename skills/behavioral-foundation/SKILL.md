---
name: behavioral-foundation
description: Surfaces the dojo's non-negotiable prime directives.
tier: core
category: discipline
created_by: human
platforms: [windows, macos, linux]
tags: [discipline, governance, foundation]
author: Andreas Wasita (@andreaswasita)
---

# Behavioral Foundation Skill

Makes the dojo's behavioral charter — the five non-negotiable prime directives and the mandatory workflow pipeline — a discoverable, installed skill instead of rules buried in `AGENTS.md` or the runtime prompt. Does NOT re-teach each discipline (those are their own skills); it states the *why* and *what* the other skills enforce, so the foundation travels with the repo and survives context compaction.

## When to Use

- At session start, alongside `using-superpowers`, to load the non-negotiables.
- Whenever you are tempted to skip a step ("I'll just commit to main this once").
- After context compaction or a handoff, to re-anchor on the prime directives.
- When a user or another agent asks "what rules does this agent follow?".
- Before claiming any task is "done" — Directive 1 is the gate.
- NOT as a substitute for the specific discipline skills it summarizes.

## Prerequisites

- The dojo is installed (`skills/`, `tasks/`, `spec/`).
- The `view`, `edit`, and `powershell` Copilot tools for inspecting state.
- `git` available to confirm branch and working-tree state.

## How to Run

```text
1. Read the five Prime Directives below — they are non-negotiable.
2. Confirm the mandatory pipeline applies to the task at hand.
3. Hand off to the specific discipline skill for the current phase.
4. Use the Verification checklist before any "done" claim.
```

## Quick Reference

| # | Prime Directive | Enforced by |
|---|---|---|
| 1 | Never claim "done" without proof | `verify-before-done` |
| 2 | Plan before non-trivial code | `plan-before-code` |
| 3 | Isolate work on a branch/worktree | `using-git-worktrees` |
| 4 | Make surgical, complete changes | `demand-elegance` |
| 5 | Don't improvise around safety | `safety-guardrails` |

Mandatory pipeline (each arrow is a skill):

```text
BRAINSTORM → WORKTREE → PLAN → EXECUTE → TEST → REVIEW → FINISH → LEARN
```

## Procedure

### Step 1: The Five Prime Directives

1. **Never claim "done" without proof.** Evidence = the repo's own tests/build pass, the diff was reviewed, and the working tree is clean. No proof, not done.
2. **Plan before non-trivial code.** Any task of ~3+ steps gets a written plan in `tasks/todo.md` first, confirmed before executing.
3. **Isolate the work.** Use a feature branch or worktree; never commit straight to `main`. Confirm a clean test baseline before changing anything.
4. **Make surgical changes.** Fix the request, not unrelated code. A complete, correct solution beats a minimal one; neither over-engineers.
5. **Don't improvise around safety.** No secrets in code, no unpinned supply-chain sources, no destructive `git`/file operations without explicit confirmation.

### Step 2: Apply the Mandatory Pipeline

For any non-trivial task, walk the pipeline and activate the owning skill at each phase. Skip a phase only for genuinely trivial work, and say so:

- **Brainstorm** → `brainstorming` (refine the design via a few sharp questions).
- **Worktree** → `using-git-worktrees` (isolate; confirm a green baseline).
- **Plan** → `plan-before-code` (checkable tasks in `tasks/todo.md`).
- **Execute** → `executing-plans` (one task at a time; commit per logical unit).
- **Test** → `test-writing` (RED → GREEN → REFACTOR for each behavioural change).
- **Review** → `requesting-code-review` (self-review the diff before anyone else).
- **Finish** → `finishing-a-development-branch` (present merge options; clean up).
- **Learn** → `self-improvement` (capture any correction so it isn't repeated).

### Step 3: Verify Against the Repo-Native Standard

There is no universal verifier. Discover the host repo's commands in order:

1. Documented commands (`README`, `CONTRIBUTING`, `Makefile`, package manifests, CI workflow).
2. Detected-stack defaults (the repo's test/build/lint runner).
3. At minimum: build succeeds, tests pass, linter clean, `git status` clean, diff reviewed.

Run the checks with the `powershell` tool and record the evidence.

## Pitfalls

- **DO NOT** treat any directive as optional "just this once" — the exception is the failure.
- **DO NOT** duplicate the discipline skills here. This skill is the charter; the depth lives in each owning skill.
- **DO NOT** claim done from intent. A passing-looking change is not a verified one — show the evidence (Directive 1).
- **DO NOT** invent new tooling to satisfy the verification standard. Use what the host repo already ships.
- **DO NOT** improvise around a safety stop. Destructive operations require explicit human confirmation (Directive 5).

## Verification

- [ ] All five Prime Directives were acknowledged for the session.
- [ ] The mandatory pipeline phase for the current work was identified and its owning skill activated.
- [ ] The repo-native verification commands were discovered and run (not invented).
- [ ] No "done" claim was made without recorded evidence (tests, diff, clean tree).
