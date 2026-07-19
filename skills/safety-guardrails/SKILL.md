---
name: safety-guardrails
description: Flags risky shell commands and unsafe tree ops.
tier: core
category: discipline
created_by: human
platforms: [windows, macos, linux]
tags: [safety, guardrails, governance]
author: Andreas Wasita (@andreaswasita)
---

# Safety Guardrails Skill

Gives the agent two invokable preflight checks before a dangerous action: a command guard that flags obviously-destructive commands (`rm -rf /`, force-push, `reset --hard`, `dd`, `mkfs`), and a tree guard that flags an unsafe working-tree state (mass deletions, or a dirty tree when a clean one is required). This is a **heuristic speed bump, not a sandbox** — it cannot parse shell grammar or stop execution, so it complements, never replaces, human confirmation.

## When to Use

- Before running any command that deletes, overwrites, or rewrites history.
- Before a risky `git` operation (force-push, hard reset, history rewrite).
- Before a bulk file operation, to confirm the working tree is in a safe state.
- When a user-supplied or generated command "looks" destructive — check it first.
- As a standing habit in autonomous loops where no human reviews each command.
- NOT as a security boundary — it is trivially bypassed (see Pitfalls).

## Prerequisites

- The `powershell` Copilot tool to run the guard scripts.
- Python 3 on `PATH` (the guards share one stdlib core; the `.sh`/`.ps1` are thin wrappers).
- `git` available for the tree guard (it degrades to a skip outside a repo).

## How to Run

Use the `powershell` tool to invoke the guard before the risky action:

```bash
# Command guard — exit 1 means STOP and confirm
bash skills/safety-guardrails/scripts/safety-guard.sh command "rm -rf /"

# Tree guard — flag mass deletions or (optionally) any dirty tree
bash skills/safety-guardrails/scripts/safety-guard.sh tree --require-clean
```

On Windows, call the parity wrapper `safety-guard.ps1` with the same verbs. Exit codes: `0` no concern, `1` flagged (stop and confirm), `2` usage error.

## Quick Reference

| Guard | Flags | Example trigger |
|---|---|---|
| `command` | recursive force-delete of a root/home/system path | `rm -rf /`, `rm -rf ~` |
| `command` | force-push / history rewrite | `git push --force`, `git filter-branch` |
| `command` | irreversible reset / clean | `git reset --hard`, `git clean -fdx` |
| `command` | disk/device destruction | `dd of=/dev/sda`, `mkfs`, `> /dev/sdb` |
| `command` | over-permissive mode | `chmod -R 777 .` |
| `tree` | mass staged/pending deletions (≥ threshold) | a refactor that removed many files |
| `tree` | dirty tree when `--require-clean` | uncommitted edits before a hard reset |

## Procedure

### Step 1: Guard the Command

Pass the exact command string to the command guard with the `powershell` tool. If it exits `1`, treat the listed reasons as a hard stop: confirm intent with the user and prefer a reversible alternative (a feature branch over a force-push, `git revert` over `git reset --hard`, a preview flag over a destructive one).

### Step 2: Guard the Working Tree

Before a bulk or destructive operation, run the tree guard. It reads `git status` and flags when the number of pending deletions meets the threshold (default 3, tune with `--max-deletions`). Add `--require-clean` when the next step assumes a pristine tree (for example, before a hard reset or a checkout that discards changes).

### Step 3: Confirm or Abort

A flag is a checkpoint, not a veto. If the destructive action is genuinely intended and understood, state that explicitly and proceed; otherwise abort and choose the reversible path. Record the decision in `tasks/todo.md` when it affects the plan.

### Step 4: Extend the Rules

The detection rules live in `skills/safety-guardrails/scripts/safety_guard.py` as a single shared core. Add a new rule there (with a test in `tests/test_safety_guard.py`) so the `.sh` and `.ps1` wrappers stay in parity automatically.

## Pitfalls

- **DO NOT** treat a clean result as "safe to run". The guard misses quoting, command substitution, variable expansion, aliases, and alternate binaries like `/bin/rm`. A pass is the absence of an obvious flag, not a proof of safety.
- **DO NOT** use this as a sandbox or permission system. It does not block execution — it informs a decision.
- **DO NOT** suppress a flag silently. If you override it, say why.
- **DO NOT** widen the danger rules so far that every `rm` trips them — false positives train the agent to ignore the guard.
- **DO NOT** edit only one wrapper. The logic lives in the Python core; the `.sh`/`.ps1` are thin and must stay that way.

## Verification

- [ ] The command guard was run on the destructive command and its exit code observed.
- [ ] Any `1` (flagged) result was either resolved with a reversible alternative or explicitly confirmed.
- [ ] The tree guard was run before bulk/destructive file operations.
- [ ] New or changed detection rules have matching cases in `tests/test_safety_guard.py`.
