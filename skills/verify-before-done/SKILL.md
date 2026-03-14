---
name: verify-before-done
description: >-
  Ensures the agent proves its work before declaring a task complete. Use this skill
  before marking any task as done, before submitting code for review, when running
  pre-PR checks, or when the agent is about to close out a task without demonstrating
  correctness. No kata is complete without demonstration — tests, logs, diffs, or it
  didn't happen.
---

# Verify Before Done

No kata is complete without demonstration. Tests, logs, diffs — show your work or it didn't happen.

## When to Use

- Before marking any task complete in `tasks/todo.md`
- Before creating a pull request
- After implementing a fix or feature
- When the agent is about to say "done" without evidence

## How to Use

### The Verification Checklist

Before declaring any task complete, run through this checklist:

1. **Tests pass** — Run the full test suite, not just "it compiles"
   ```bash
   # Use the project's test command, e.g.:
   npm test          # Node.js
   pytest            # Python
   go test ./...     # Go
   dotnet test       # .NET
   mvn test          # Java
   ```

2. **No regressions** — Diff behavior between main and your changes
   ```bash
   git diff main --stat
   ```

3. **Clean tree** — No untracked files that should be committed, no debug artifacts left behind

4. **Demonstrate correctness** — Show concrete evidence:
   - Test output showing green
   - Before/after screenshots for UI changes
   - Log output showing the fix works
   - API response showing correct behavior

5. **Staff engineer test** — Ask yourself: "Would a staff engineer approve this?"

### Automated Verification

When available, use `scripts/verify.sh` to automate:
```bash
bash scripts/verify.sh
```

This script:
- Runs tests
- Checks for uncommitted changes
- Validates that `tasks/todo.md` has a plan
- Reports pass/fail

### Documenting Results

Add a review section to `tasks/todo.md`:

```markdown
### Verification Results
- [x] Tests: 47 passed, 0 failed
- [x] No regressions: diff reviewed, 3 files changed
- [x] Clean tree: no untracked files
- [x] Evidence: test output attached below
```

## Examples

**Bad — Declaring Victory Without Proof:**
> "I've fixed the authentication bug. The code looks correct."

**Good — Showing Your Work:**
> "I've fixed the authentication bug. Here's the evidence:
> - Root cause: Token expiry check was using `<` instead of `<=`
> - Fix: Changed comparison in `auth/token.ts:47`
> - Tests: All 23 auth tests pass, including the new edge case test I added
> - Regression check: No other files affected
> - Manual verification: Tested with expired token — correctly returns 401"

## Guidelines

- Never mark a task complete without proving it works
- Automated verification is better than manual ("trust, but verify" becomes "verify, then trust")
- If tests don't exist for the area you changed, write them as part of the task
- Diff behavior between main and your changes when relevant
- When in doubt, over-verify rather than under-verify

## Anti-Patterns

- **"It compiles, ship it"** — Compilation is the lowest bar. Prove behavior.
- **Skipping tests because "it's a small change"** — Small changes cause big outages
- **Testing only the happy path** — Edge cases are where bugs live
- **Declaring done verbally** — Write it down with evidence, or it didn't happen
- **Ignoring flaky tests** — A flaky test is a test that sometimes catches bugs. Fix it, don't ignore it.
