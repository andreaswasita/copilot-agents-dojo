---
name: verify-before-done
description: Proves work with tests, diffs, and logs before sign-off.
tier: core
category: discipline
created_by: human
platforms: [windows, macos, linux]
tags: [verification, testing, quality]
author: Andreas Wasita (@andreaswasita)
---

# Verify Before Done Skill

Refuses to mark a task complete without concrete evidence: green tests, reviewed diff, clean tree, and a recorded result block in `tasks/todo.md`. Does NOT replace `scripts/verify.sh` — it tells the agent *when* to run it and what to do with the output.

## When to Use

- Before flipping any step in `tasks/todo.md` from `- [ ]` to `- [x]`.
- Before opening a pull request.
- After any fix or feature implementation.
- Any time the agent is about to say "done" or "ready" without evidence.

## Prerequisites

- A test runner installed for the stack (pytest, vitest, go test, etc.).
- `scripts/verify.sh` (or `scripts/run-checks.ps1` on Windows) executable.
- The `powershell` tool to invoke runners and `git`.
- `git` available so diffs can be inspected.

## How to Run

```text
1. Run the project's test command via the `powershell` tool.
2. Run `bash scripts/verify.sh` (or `pwsh scripts/run-checks.ps1`) for the dojo gate.
3. Inspect the diff with `git diff main --stat` and `git diff main`.
4. Confirm the working tree is clean (`git status --porcelain`).
5. Append a Verification Results block to `tasks/todo.md`.
6. Only then mark the step `- [x]`.
```

## Quick Reference

| Check | Command (run via `powershell`) | Pass criterion |
|---|---|---|
| Tests pass | `pytest` / `npm test` / `go test ./...` / `dotnet test` / `mvn test` | exit 0, no failures reported |
| Dojo gate | `bash scripts/verify.sh --check` | exit 0 |
| Diff summary | `git diff main --stat` | matches plan in `tasks/todo.md` |
| No regressions | `git diff main -- <touched paths>` | only intended changes |
| Clean tree | `git status --porcelain` | empty output (or expected untracked) |
| Evidence captured | `edit tasks/todo.md` | Verification Results block added |

## Procedure

### Step 1: Run the Full Test Suite

Run via the `powershell` tool — not "it compiles", not "the unit test I wrote". The full suite catches regressions in adjacent code.

If the area you changed has no tests, write one as part of the task. An untested change is unverified by definition.

### Step 2: Run the Dojo Gate

```bash
bash scripts/verify.sh --check
```

This wraps the spec/plan/actions/tests checks in CI parity mode. If it fails locally, it will fail in CI.

### Step 3: Diff Against Main

```bash
git diff main --stat
git diff main
```

The change set must match the plan in `tasks/todo.md`. Unexpected files in the diff are a red flag — either the plan is stale or you've leaked scope.

### Step 4: Clean Tree Check

```bash
git status --porcelain
```

Output must be empty (or contain only deliberately-untracked files). Debug prints, leftover scratch files, and stray `.tmp` artifacts all surface here.

### Step 5: Record Evidence

Append to `tasks/todo.md` under the current task:

```markdown
### Verification Results
- [x] Tests: 47 passed, 0 failed (`pytest tests/`)
- [x] Dojo gate: `verify.sh --check` PASS
- [x] Diff: 3 files changed, +84/-12 (matches plan)
- [x] Clean tree
- [x] Evidence: <paste relevant test output, log snippet, or screenshot ref>
```

Only after this block exists do you flip the step to `- [x]`.

### Step 6: Staff-Engineer Sniff Test

Final question: "Would a senior reviewer approve this on the evidence alone?" If no, add the missing evidence before claiming done.

## Pitfalls

- **DO NOT** say "done" without a Verification Results block. Verbal claims don't count.
- **DO NOT** skip tests because "it's a small change." Small changes cause big outages.
- **DO NOT** test only the happy path. Edge cases are where bugs live.
- **DO NOT** ignore flaky tests. A flaky test is a test that sometimes catches bugs — fix it, don't ignore it.
- **DO NOT** trust "it compiles." Compilation is the lowest possible bar.
- **DO NOT** mark a step done before `scripts/verify.sh --check` exits 0.

## Verification

- [ ] Test suite ran to completion with exit 0.
- [ ] `scripts/verify.sh --check` (or `run-checks.ps1 -Check`) passed.
- [ ] `git diff main --stat` matches the plan.
- [ ] `git status --porcelain` is empty.
- [ ] `tasks/todo.md` has a Verification Results block under the task.
