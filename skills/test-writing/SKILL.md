---
name: test-writing
description: Writes meaningful tests that actually catch bugs.
tier: practical
category: workflow
created_by: human
platforms: [windows, macos, linux]
tags: [testing, tdd, quality]
author: Andreas Wasita (@andreaswasita)
---

# Test Writing Skill

Produces tests that fail when the code is wrong — not tests that exist for coverage theatre. Covers happy path, edge cases, error paths, and state transitions. Does NOT chase 100% coverage as a goal; chases meaningful coverage that catches real regressions.

## When to Use

- Writing tests for new code or features.
- Adding coverage to an untested area before changing it.
- A bug slipped through that tests should have caught.
- Practicing test-driven development.
- The `verify-before-done` skill flagged missing coverage.
- NOT when the user explicitly asked for a spike or throwaway script.

## Prerequisites

- A test framework installed for the stack (pytest, vitest, jest, go test, xUnit, JUnit).
- Ability to run the test suite via the `powershell` tool.
- The `view`, `edit`, and `grep` tools to read existing patterns.
- A baseline run of the existing suite passing.

## How to Run

```text
1. Read existing tests with `view`/`grep` to copy the project's pattern.
2. List scenarios: happy path, edges, errors, state transitions.
3. Write one test per scenario using Arrange-Act-Assert.
4. Run the suite — confirm new tests pass and nothing else broke.
5. If TDD: write the test first, watch it fail for the right reason, then implement.
```

## Quick Reference

| Stack | Framework | Run command |
|---|---|---|
| TypeScript | Vitest / Jest | `npm test` or `npx vitest` |
| Python | pytest | `pytest` or `python -m pytest` |
| Java | JUnit 5 | `mvn test` or `gradle test` |
| Go | testing | `go test ./...` |
| .NET | xUnit | `dotnet test` |

| Scenario type | Must cover |
|---|---|
| Happy path | Valid input → expected output |
| Edge case | Empty, null, boundary, maximum size |
| Error case | Invalid input, dependency failure, timeout |
| State transition | Stateful object moves between valid states |

## Procedure

### Step 1: Read the Existing Pattern

Use `grep` for `test_*` or `*.spec.*` files and `view` one of them. Match the project's naming, location, fixtures, and assertion style. Do not introduce a second testing dialect.

### Step 2: Enumerate Scenarios

For the code under test, list:

1. Happy path inputs.
2. Edge cases (empty, null, boundary, max).
3. Error cases (invalid input, dependency failure).
4. State transitions, if stateful.

### Step 3: Write Arrange-Act-Assert

```python
def test_calculate_discount_for_premium_user():
    # Arrange
    user = create_user(tier="premium")
    order = create_order(total=100.00)

    # Act
    discount = calculate_discount(user, order)

    # Assert
    assert discount == 20.00
```

Name tests as documentation: `test_login_with_expired_token_returns_401`, not `test_login`.

### Step 4: For Bug Fixes — Test First

1. Write a test that reproduces the bug.
2. Run it. Confirm it fails for the right reason.
3. Implement the fix.
4. Run it. Confirm it passes.
5. Run the full suite — no regressions.

### Step 5: Run and Record

Run the suite via the `powershell` tool. Capture pass/fail counts and paste them into the `tasks/todo.md` Verification Results block (per `verify-before-done`).

## Pitfalls

- **DO NOT** write tests that cannot fail (`assert user is not None` on a freshly constructed object).
- **DO NOT** test implementation details (e.g. mocking that `quicksort` was called). Test the behavior.
- **DO NOT** mock the world. Prefer real collaborators where the cost is acceptable.
- **DO NOT** ignore a flaky test — fix it or delete it. A flaky test erodes trust in the whole suite.
- **DO NOT** chase 100% coverage as a target. Coverage is a metric, not a mission.

## Verification

- [ ] Every new test was observed to fail before it passed (TDD) OR a deliberate mutation was introduced to confirm it fails.
- [ ] The full suite is green after the change.
- [ ] Test names describe scenario + expected behavior.
- [ ] Each bug fix has a regression test that would have caught the original bug.
