---
name: test-writing
description: >-
  Guides the agent in writing effective, meaningful tests — not just tests that exist,
  but tests that catch bugs. Use this skill when writing tests for new code, when adding
  test coverage to untested areas, when a bug was found that tests should have caught,
  when implementing TDD, or when the verify-before-done skill reveals missing test coverage.
---

# Test Writing

Tests aren't paperwork. They're proof that your code works and a safety net for everyone who touches it next.

## When to Use

- Writing tests for new features or bug fixes
- Adding coverage to untested code
- A bug slipped through that tests should have caught
- Practicing test-driven development (TDD)
- The verify-before-done skill flagged missing coverage

## How to Use

### The Testing Pyramid

Prioritize tests by value:

```
        ╱  E2E  ╲           Few, slow, high-confidence
       ╱─────────╲
      ╱Integration ╲        Moderate count, test boundaries
     ╱───────────────╲
    ╱   Unit Tests    ╲     Many, fast, focused
   ╱───────────────────╲
```

- **Unit tests** — Test individual functions/methods in isolation. Fast, many.
- **Integration tests** — Test component boundaries (API → DB, service → service). Moderate.
- **E2E tests** — Test full user workflows. Few, high-value scenarios only.

### Step 1: Identify What to Test

For any piece of code, identify:
1. **Happy path** — Does it work with valid input?
2. **Edge cases** — Empty input, null, boundary values, large datasets
3. **Error cases** — Invalid input, network failures, missing dependencies
4. **State transitions** — If stateful, do transitions work correctly?

### Step 2: Write Tests That Catch Bugs

Good tests have three parts (Arrange-Act-Assert):

```python
def test_calculate_discount_for_premium_user():
    # Arrange — Set up the scenario
    user = create_user(tier="premium")
    order = create_order(total=100.00)

    # Act — Execute the behavior
    discount = calculate_discount(user, order)

    # Assert — Verify the outcome
    assert discount == 20.00  # Premium users get 20%
```

### Step 3: Name Tests Like Documentation

Test names should describe the scenario and expected behavior:

```
✅ test_login_with_expired_token_returns_401
✅ test_empty_cart_shows_no_items_message
✅ test_bulk_import_with_duplicate_emails_skips_duplicates

❌ test_login
❌ test_cart
❌ test_import
```

### Step 4: Test the Bug, Not Just the Fix

When fixing a bug, write the test **first**:

1. Write a test that reproduces the bug (it should fail)
2. Confirm it fails for the right reason
3. Implement the fix
4. Confirm the test now passes
5. Run the full suite — no regressions

## Framework Quick Reference

| Stack | Framework | Run Command |
|-------|-----------|-------------|
| TypeScript | Vitest / Jest | `npm test` or `npx vitest` |
| Python | pytest | `pytest` or `python -m pytest` |
| Java | JUnit 5 | `mvn test` or `gradle test` |
| Go | testing | `go test ./...` |
| .NET | xUnit | `dotnet test` |

## Examples

**Bad — Test That Proves Nothing:**
```python
def test_user_exists():
    user = User(name="test")
    assert user is not None  # This will always pass
```

**Good — Test That Catches Bugs:**
```python
def test_user_email_validation_rejects_missing_domain():
    with pytest.raises(ValidationError, match="invalid email"):
        User(name="test", email="user@")
```

**Bad — Testing Implementation Details:**
```python
def test_sort_uses_quicksort():
    # Brittle: tied to internal implementation
    with mock.patch('module.quicksort') as qs:
        sort_items([3, 1, 2])
        qs.assert_called_once()
```

**Good — Testing Behavior:**
```python
def test_sort_returns_ascending_order():
    assert sort_items([3, 1, 2]) == [1, 2, 3]
```

## Guidelines

- Test behavior, not implementation — tests should survive refactoring
- Every bug fix should come with a test that would have caught it
- Aim for >80% coverage, but coverage alone doesn't mean quality
- Flaky tests must be fixed immediately — they erode trust in the whole suite
- Mocks are a last resort, not a first choice — prefer real dependencies when feasible

## Anti-Patterns

- **Tests that always pass** — If a test can't fail, it's not testing anything
- **Testing the framework** — Don't test that `if` statements work. Test your logic.
- **Copy-paste test suites** — If tests are repetitive, use parameterized/table-driven tests
- **Ignoring test failures** — A failing test is a bug report. Treat it that way.
- **100% coverage as a goal** — Coverage is a metric, not a mission. Focus on meaningful coverage.
