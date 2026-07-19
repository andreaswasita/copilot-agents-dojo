---
name: debugging
description: Systematic root-cause investigation for hard bugs.
tier: practical
category: workflow
created_by: human
platforms: [windows, macos, linux]
tags: [debugging, diagnostics, root-cause]
author: Andreas Wasita (@andreaswasita)
---

# Debugging Skill

Investigates hard or non-obvious bugs by gathering evidence, forming a hypothesis, and narrowing the search space — never by guessing or shotgun-changing code. Complements `autonomous-bug-fix` with deeper diagnostic technique. Does NOT replace running the failing test and reading the actual error.

## When to Use

- The cause of a bug is not immediately obvious.
- Intermittent or hard-to-reproduce failures.
- Bugs spanning multiple components or layers.
- Standard approaches ("read the error, fix the obvious") have failed.
- Performance regressions, memory leaks, race conditions.
- NOT when the failing test message already states the problem — just fix it.

## Prerequisites

- Ability to reproduce the failure (or evidence captured from production).
- The `view`, `grep`, `glob`, and `powershell` Copilot tools.
- `git` for history and bisect.
- A test or repro script that exhibits the bug.

## How to Run

```text
1. Reproduce the failure. Capture the exact error and stack.
2. Gather evidence: recent commits, environment, inputs, logs.
3. Form ONE hypothesis based on evidence.
4. Test the hypothesis with the cheapest technique that disproves it.
5. Narrow the layer, then the line.
6. Write a regression test BEFORE the fix.
7. Fix the root cause, not the symptom.
```

## Quick Reference

| Technique | Use when |
|---|---|
| `git bisect` | Bug appeared recently, clean commit history |
| Print / log tracing | Need to see execution flow |
| Minimal repro | Complex system, need to isolate the variable |
| Breakpoint debugging | Need to inspect state at a specific point |
| Diff analysis (`git log`, `git diff`) | "It worked before" — something changed |
| Input shrinking | Test with smaller inputs until the failure stops |

| Bug shape | First place to look |
|---|---|
| Race condition | Shared mutable state, missing `await`, missing lock |
| Memory leak | Growing collections, unclosed resources, retained refs |
| Performance | Database (N+1, missing index), network (uncached calls) |
| Intermittent | Timing, external dependencies, ordering assumptions |

## Procedure

### Step 1: Reproduce

Capture the exact failing command and full error output via the `powershell` tool. If you cannot reproduce locally, debugging is guessing. Stop and build a repro first.

### Step 2: Gather Evidence

Inspect:

- Recent commits with `git log --oneline -10`.
- The diff of any commit touching the failing path.
- The full stack trace, including the "caused by" chain.
- Environment differences if it works elsewhere.

Use `view` to read the offending code path. Use `grep` to locate related call sites.

### Step 3: Form a Hypothesis

Based on evidence — not intuition — write down a single hypothesis:

> "The cache is stale because invalidation runs before the write completes."

If you cannot articulate a hypothesis, you do not have enough evidence yet. Gather more.

### Step 4: Disprove It Cheaply

Choose the cheapest technique that would falsify the hypothesis:

- Add one print/log at the suspected divergence point.
- Run `git bisect` if a recent commit is suspect.
- Construct a minimal repro that isolates the variable.

### Step 5: Narrow Layer → Line

Walk the request through the system:

```text
Input → Layer A → Layer B → Layer C → Output
```

At each boundary, check: correct input in? correct output out? The bug lives at the boundary where correct input produces incorrect output.

### Step 6: Regression Test First, Then Fix

Before changing code:

1. Write a test that reproduces the bug. It must fail.
2. Implement the fix.
3. Run the test. It must pass.
4. Run the full suite. No regressions.
5. Search the codebase with `grep` for the same anti-pattern elsewhere.

### Step 7: Log the Lesson

If the technique was non-obvious, append to `tasks/lessons.md`:

```yaml
- date: 2026-05-19
  error_type: stale-cache
  trigger: "Test passed alone, failed in suite"
  root_cause: "Cache invalidated before write committed"
  fix: "Made invalidation await the write"
  rule: "All cache invalidations follow the source mutation, not lead it"
```

## Pitfalls

- **DO NOT** shotgun-change code hoping something sticks.
- **DO NOT** skip the reproduction step. You cannot fix what you cannot see.
- **DO NOT** blame the framework first. It is almost always your code.
- **DO NOT** debug in production when local reproduction is possible.
- **DO NOT** ship a fix you cannot explain. If you cannot articulate why it works, you have patched a symptom.

## Verification

- [ ] Failure was reproduced locally before any code change.
- [ ] A regression test exists and failed prior to the fix.
- [ ] The regression test now passes.
- [ ] The full test suite is green.
- [ ] The root cause is written down (commit message or `tasks/lessons.md`).
