---
name: refactoring
description: >-
  Guides the agent through safe, systematic code refactoring — improving structure
  without changing behavior. Use this skill when asked to clean up code, reduce
  duplication, simplify complexity, extract components or functions, reorganize file
  structure, or improve maintainability. Also use when the demand-elegance skill
  identifies a hacky solution that needs restructuring.
---

# Refactoring

Improve the structure of existing code without changing its behavior. Every refactoring is a series of small, safe transformations.

## When to Use

- Codebase has accumulated technical debt
- Duplication across multiple files or functions
- A function or class has grown too large
- Naming doesn't reflect current purpose
- The demand-elegance skill flagged a hacky solution
- Before adding new features to a messy area of code

## How to Use

### Principle: Behavior Preservation

The golden rule of refactoring: **tests pass before and after every step**. If you don't have tests, write them first.

### Step 1: Establish a Safety Net

Before changing anything:
1. **Identify existing tests** that cover the code you're about to change
2. **Run them** — confirm they pass on the current code
3. **If no tests exist**, write characterization tests that capture current behavior
4. **Commit the tests** separately from the refactoring

### Step 2: Identify the Smell

Common code smells and their refactoring:

| Smell | Refactoring |
|-------|-------------|
| **Long function** (>30 lines) | Extract smaller, named functions |
| **Duplicate code** | Extract shared function or module |
| **Deep nesting** (>3 levels) | Early returns, extract conditions |
| **God class/file** | Split by responsibility |
| **Primitive obsession** | Introduce domain types |
| **Feature envy** | Move logic to the class that owns the data |
| **Long parameter list** (>4 params) | Introduce parameter object |
| **Dead code** | Delete it. That's what version control is for. |

### Step 3: Small Steps

Make one transformation at a time:

1. **Make the change** — One refactoring move
2. **Run tests** — Confirm behavior is preserved
3. **Commit** — Small, atomic commits with clear messages
4. **Repeat** — Next transformation

```
Refactoring commit messages:
  refactor: extract validateInput() from handleRequest()
  refactor: rename UserManager to UserRepository
  refactor: move email logic to NotificationService
  refactor: remove unused formatLegacyDate()
```

### Step 4: Verify the Whole

After all transformations:
- Run the complete test suite
- Review the full diff — does the result look cleaner?
- Check that no behavior changed (same inputs → same outputs)

## Examples

**Before — Nested Mess:**
```python
def process_order(order):
    if order:
        if order.items:
            if order.customer:
                if order.customer.verified:
                    for item in order.items:
                        if item.in_stock:
                            # actual business logic buried 5 levels deep
                            ...
```

**After — Early Returns:**
```python
def process_order(order):
    if not order or not order.items:
        return
    if not order.customer or not order.customer.verified:
        raise UnverifiedCustomerError()

    in_stock_items = [item for item in order.items if item.in_stock]
    # business logic at the top level, clear and readable
    ...
```

## Guidelines

- Write tests before refactoring, not after
- One transformation per commit — makes it easy to bisect if something breaks
- The goal is clarity, not cleverness
- If a refactoring makes the code harder to understand, revert it
- Don't refactor and add features in the same PR

## Anti-Patterns

- **Refactoring without tests** — You're just rearranging code and hoping for the best
- **Big bang refactoring** — Rewriting everything at once. Small steps, always.
- **Refactoring for hypothetical futures** — "We might need this to be pluggable someday" — no, just make it clear
- **Mixing refactoring with feature work** — Separate PRs. Always.
- **Renaming without search** — Rename a function and forget the 5 other files that call it
