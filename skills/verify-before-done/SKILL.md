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

Refuses to mark a task complete without concrete evidence from both automated checks and the real artifact or user-facing surface. Produces an explicit `VERIFIED`, `NOT VERIFIED`, or `INCONCLUSIVE` verdict. Does NOT replace `scripts/verify.sh` — it tells the agent *when* to run it and what evidence the gate cannot supply.

## When to Use

- Before flipping any step in `tasks/todo.md` from `- [ ]` to `- [x]`.
- Before opening a pull request.
- After any fix or feature implementation.
- After performance work, migrations, or changes whose success depends on runtime behavior.
- Any time the agent is about to say "done" or "ready" without evidence.

## Prerequisites

- A test runner installed for the stack (pytest, vitest, go test, etc.).
- `scripts/verify.sh` (or `scripts/run-checks.ps1` on Windows) executable.
- The `powershell` tool to invoke runners and `git`.
- `git` available so diffs can be inspected.

## How to Run

```text
1. State the success predicate and capture a baseline when behavior is changing.
2. Run the project's tests and the dojo gate via the `powershell` tool.
3. Exercise the real artifact or user-facing surface.
4. Inspect the diff and working tree.
5. Record evidence and assign a verdict.
6. Mark the step complete only when the verdict is `VERIFIED`.
```

## Quick Reference

| Check | Command (run via `powershell`) | Pass criterion |
|---|---|---|
| Tests pass | `pytest` / `npm test` / `go test ./...` / `dotnet test` / `mvn test` | exit 0, no failures reported |
| Dojo gate | `bash scripts/verify.sh --check` | exit 0 |
| Real artifact | Matching browser, CLI, API, package, migration, or runtime check | observed result satisfies the stated predicate |
| Baseline comparison | Same measurement before and after the change | result moves from failing/old state to expected state |
| Diff summary | `git diff main --stat` | matches plan in `tasks/todo.md` |
| No regressions | `git diff main -- <touched paths>` | only intended changes |
| Clean tree | `git status --porcelain` | empty output (or expected untracked) |
| Evidence captured | `edit tasks/todo.md` | Verification Results block added |

| Verdict | Meaning | Completion allowed? |
|---|---|---|
| `VERIFIED` | Evidence proves the success predicate on the real artifact. | Yes |
| `NOT VERIFIED` | Evidence proves the result is wrong or regressed. | No |
| `INCONCLUSIVE` | The check was unavailable, used the wrong surface, or could not distinguish success from failure. | No |

## Procedure

### Step 1: State the Predicate and Baseline

Write one falsifiable sentence describing success before running checks. For a bug, capture the failing behavior first. For performance work, record the original measurement. For a migration, record the pre-change state and the expected post-change invariant.

Examples:

- "Submitting an expired token returns HTTP 401."
- "The p95 latency for this fixture is below 200 ms."
- "Running the migration twice leaves the schema and data unchanged."

If no meaningful baseline exists, state why. Do not invent one after seeing the result.

### Step 2: Run the Full Test Suite

Run via the `powershell` tool — not "it compiles", not "the unit test I wrote". The full suite catches regressions in adjacent code.

If the area you changed has no tests, write one as part of the task. An untested change is unverified by definition.

### Step 3: Run the Dojo Gate

```bash
bash scripts/verify.sh --check
```

This wraps the spec/plan/actions/tests checks in CI parity mode. If it fails locally, it will fail in CI.

### Step 4: Exercise the Real Artifact

Use the matching surface:

| Change | Required runtime evidence |
|---|---|
| Browser or desktop UI | Drive the affected flow and capture the observed state or screenshot. |
| CLI or TUI | Run the command with representative inputs and inspect exit code and output. |
| API | Send a representative request and inspect status, headers, and response body. |
| Package or library | Exercise the public entry point from a consumer-shaped test or example. |
| Migration | Run forward, validate invariants, and test the supported retry or rollback path. |
| Performance | Repeat the same measurement method used for the baseline. |

Tests prove code paths. The real-surface check proves the reported problem or requested outcome. A check on the wrong surface is `INCONCLUSIVE`, not a pass.

### Step 5: Diff Against Main

```bash
git diff main --stat
git diff main
```

The change set must match the plan in `tasks/todo.md`. Unexpected files in the diff are a red flag — either the plan is stale or you've leaked scope.

### Step 6: Clean Tree Check

```bash
git status --porcelain
```

Output must be empty (or contain only deliberately-untracked files). Debug prints, leftover scratch files, and stray `.tmp` artifacts all surface here.

### Step 7: Record Evidence and Verdict

Append to `tasks/todo.md` under the current task:

```markdown
### Verification Results
- Predicate: Expired tokens return HTTP 401.
- Verdict: VERIFIED
- Baseline: expired token returned HTTP 500 before the fix
- [x] Tests: 47 passed, 0 failed (`pytest tests/`)
- [x] Dojo gate: `verify.sh --check` PASS
- [x] Real artifact: API request returned HTTP 401 with expected body
- [x] Diff: 3 files changed, +84/-12 (matches plan)
- [x] Clean tree
- [x] Evidence: <paste relevant test output, log snippet, or screenshot ref>
```

Only a `VERIFIED` block permits flipping the step to `- [x]`. Record `NOT VERIFIED` and `INCONCLUSIVE` honestly, then keep working or report the blocker.

### Step 8: Staff-Engineer Sniff Test

Final question: "Would a senior reviewer approve this on the evidence alone?" If no, add the missing evidence before claiming done.

## Pitfalls

- **DO NOT** say "done" without a Verification Results block. Verbal claims don't count.
- **DO NOT** skip tests because "it's a small change." Small changes cause big outages.
- **DO NOT** test only the happy path. Edge cases are where bugs live.
- **DO NOT** ignore flaky tests. A flaky test is a test that sometimes catches bugs — fix it, don't ignore it.
- **DO NOT** trust "it compiles." Compilation is the lowest possible bar.
- **DO NOT** treat unit tests as proof that a user-visible or runtime problem is gone.
- **DO NOT** convert an unavailable or wrong-surface check into a pass. Use `INCONCLUSIVE`.
- **DO NOT** change the measurement method between baseline and result.
- **DO NOT** mark a step done before `scripts/verify.sh --check` exits 0.

## Verification

- [ ] Test suite ran to completion with exit 0.
- [ ] `scripts/verify.sh --check` (or `run-checks.ps1 -Check`) passed.
- [ ] The real artifact or user-facing surface satisfies the stated predicate.
- [ ] Baseline and result used the same measurement method when comparison applies.
- [ ] `git diff main --stat` matches the plan.
- [ ] `git status --porcelain` is empty.
- [ ] `tasks/todo.md` has a Verification Results block with an explicit verdict.
