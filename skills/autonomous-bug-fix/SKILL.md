---
name: autonomous-bug-fix
description: Reproduces, diagnoses, fixes, and verifies bugs unaided.
tier: core
category: discipline
created_by: human
platforms: [windows, macos, linux]
tags: [debugging, autonomy, root-cause]
author: Andreas Wasita (@andreaswasita)
---

# Autonomous Bug Fix Skill

Walks the agent through the full reproduce → diagnose → fix → verify cycle on its own, without asking the user for navigation help, log-reading instructions, or test commands. Does NOT cover net-new feature work — for that use `plan-before-code` and `executing-plans`.

## When to Use

- User reports a bug, regression, or unexpected behavior.
- CI is red on a branch you own.
- An error or warning appears in logs.
- A previously working feature stopped working.
- The user says "this is broken," "it doesn't work," or similar.

## Prerequisites

- Read access to the failing component (use `glob` / `grep` to locate it).
- The `powershell` tool to run tests, `git`, and reproduction commands.
- A clean working tree on a feature branch (use `using-git-worktrees` if needed).
- `verify-before-done` skill loaded — you'll invoke it at the end.

## How to Run

```text
1. Reproduce  → locate the code, run the failing path, confirm with evidence.
2. Diagnose   → trace from symptom to root cause; check recent changes.
3. Fix        → minimal change at the root cause + a regression test.
4. Verify     → re-run reproduction + full suite via `verify-before-done`.
```

## Quick Reference

| Phase | Action | Tool |
|---|---|---|
| Find code | Search by symbol or file pattern | `grep`, `glob` |
| Read code | Inspect the failing path | `view` |
| Reproduce | Run failing command/test | `powershell` |
| Diagnose | Recent changes / blame | `powershell` → `git log -20 --oneline`, `git blame <path>` |
| Edit | Minimal, root-cause fix | `edit` |
| Add test | Regression test | `create` or `edit` under `tests/` |
| Verify | Re-run reproduction + full suite | `powershell`, then `verify-before-done` |

## Procedure

### Step 1: Reproduce

Find the relevant code yourself — `grep` for the symbol, `glob` for the path. Do not ask the user "which file is this in?"

Run the failing path via the `powershell` tool. If no failing test exists, write a minimal one that captures the bug. Confirm reproduction with concrete evidence (stack trace, exit code, log line).

If you can't reproduce:

- Check for environment-specific behavior (OS, Node/Python version).
- Look for race conditions or state-dependent paths.
- Ask the user for clarification only as a last resort, and only with specific questions.

### Step 2: Diagnose Root Cause

Read the error message and stack trace before doing anything else — they exist for a reason. Trace from the user-visible symptom back to the root cause:

```bash
# via the `powershell` tool
git log -20 --oneline
git blame path/to/suspect.ts
git diff HEAD~5 -- path/to/suspect.ts
```

Stop at the root cause, not the first thing that looks suspicious. "Why did this break?" — not "what broke?"

### Step 3: Fix at the Root

Edit with precision via the `edit` tool:

- Change only what needs to change. Bigger diffs hide bigger bugs.
- Fix the root cause, never the symptom. Swallowing an exception is not a fix.
- Add a regression test that fails without the fix and passes with it.
- Check whether the same root cause exists elsewhere (`grep` for the pattern). If yes, fix those too or log them in `tasks/lessons.md` for follow-up.

### Step 4: Verify

Hand off to the `verify-before-done` skill:

- Re-run the reproduction. The error must be gone.
- Run the full test suite. No regressions.
- Record evidence in `tasks/todo.md` under the task.

### Step 5: Rollback If Verification Fails

If verification fails after your fix:

1. Reset the working tree (`git checkout -- .` or `git stash` via `powershell`).
2. Log the failed attempt in `tasks/lessons.md` with the root-cause analysis you had.
3. Re-plan with a different approach via `plan-before-code`.
4. **Never** push broken code hoping someone catches it later.

## Pitfalls

- **DO NOT** ask the user "which file is it in?" or "how do I run the tests?" Use `grep`/`glob`/`view`/`powershell` to discover it.
- **DO NOT** apply a band-aid (catch-and-swallow, ignore the warning). Fix the root cause.
- **DO NOT** fix the symptom. A login button that fails because of a missing provider is a provider bug, not a button bug.
- **DO NOT** skip the regression test. Without one, the bug comes back in 3 months.
- **DO NOT** push without verification. An unverified fix is often worse than no fix.
- **DO NOT** abandon failed attempts silently. Log them in `tasks/lessons.md`.

## Verification

- [ ] Reproduction was confirmed with concrete evidence before any fix.
- [ ] Root cause is identified in writing (in commit message or `tasks/todo.md`).
- [ ] Regression test added that fails on `main` and passes on the branch.
- [ ] `verify-before-done` checklist passed.
- [ ] If similar patterns exist elsewhere, they are fixed or logged.
