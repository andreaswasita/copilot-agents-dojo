---
name: refactoring
description: Safe, test-backed code restructuring in small steps.
tier: practical
category: workflow
created_by: human
platforms: [windows, macos, linux]
tags: [refactoring, quality, debt]
author: Andreas Wasita (@andreaswasita)
---

# Refactoring Skill

Restructures existing code without changing behavior, in small atomic steps each backed by a green test suite. Does NOT add features in the same change — refactoring and feature work travel in separate PRs.

## When to Use

- A function, class, or file has grown unmanageable.
- Duplication is spreading across modules.
- The `demand-elegance` skill flagged a hacky solution.
- Names no longer reflect purpose after a domain shift.
- Before adding a new feature into a messy area.
- NOT when there is no test coverage and the change is high-risk — write tests first.

## Prerequisites

- Working test suite (or willingness to write characterization tests first).
- `git` for atomic commits per transformation.
- The `view`, `edit`, `grep`, and `glob` Copilot tools.
- A baseline run of the test suite passing (proven, not assumed).

## How to Run

```text
1. Run the full test suite. Confirm green baseline.
2. If no tests cover the target, write characterization tests; commit separately.
3. Apply one named transformation.
4. Re-run tests. If red, revert.
5. Commit. Repeat for next transformation.
6. Final pass: full suite + review of the whole diff.
```

## Quick Reference

| Smell | Refactoring |
|---|---|
| Long function (>30 lines) | Extract smaller, named functions |
| Duplicate code | Extract shared function or module |
| Deep nesting (>3 levels) | Early returns, extract conditions |
| God class / file | Split by responsibility |
| Primitive obsession | Introduce domain types |
| Feature envy | Move logic to the class that owns the data |
| Long parameter list (>4) | Introduce parameter object |
| Dead code | Delete it — version control remembers |

## Procedure

### Step 1: Establish the Safety Net

Identify tests covering the target with `grep` / `glob`. Run them via the `powershell` tool. If they fail or do not exist, write characterization tests first and commit them in a separate commit before any refactor.

### Step 2: Name the Transformation

Each step in the refactor must have a name from the rubric above ("extract method", "introduce parameter object", "rename for clarity"). If you cannot name it, you are freelancing — stop.

### Step 3: One Transformation, One Commit

For each step:

1. Apply the change with the `edit` tool.
2. Run the full test suite.
3. If red, revert immediately.
4. If green, commit with message `refactor: <named transformation>`.

```text
refactor: extract validateInput() from handleRequest()
refactor: rename UserManager to UserRepository
refactor: move email logic to NotificationService
refactor: delete unused formatLegacyDate()
```

### Step 4: Verify the Whole

Run the full suite a final time. Review the cumulative diff (`git diff main`). Ask: is the result actually clearer, or just rearranged? If not clearer, revert.

## Pitfalls

- **DO NOT** refactor without a green test baseline. You are gambling, not refactoring.
- **DO NOT** mix refactor and feature work in one PR. Reviewers cannot tell signal from noise.
- **DO NOT** rename a symbol without searching every reference first (`grep` on the symbol).
- **DO NOT** rewrite for a hypothetical future ("we might need this pluggable"). Refactor for today.
- **DO NOT** big-bang refactor across the whole repo in one commit — small atomic steps, always.

## Verification

- [ ] Test suite is green before the first transformation.
- [ ] Test suite is green after every commit.
- [ ] Each commit is named `refactor: <transformation>`.
- [ ] No public API changed (or, if it did, callers were updated in the same PR).
- [ ] Final diff is meaningfully clearer than the starting code.
