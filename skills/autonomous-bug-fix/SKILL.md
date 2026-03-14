---
name: autonomous-bug-fix
description: >-
  Guides the agent through a complete autonomous bug-fixing cycle — reproduce, diagnose,
  fix, and verify — with zero hand-holding from the user. Use this skill whenever a bug
  report is received, CI tests are failing, an error appears in logs, or the user reports
  unexpected behavior. The agent should fix it independently without asking the user
  how to read logs, run tests, or navigate the codebase.
---

# Autonomous Bug Fixing

Reproduce, diagnose, fix, verify. Full cycle, zero questions. The user provides intent; the agent handles execution.

## When to Use

- User reports a bug or unexpected behavior
- CI tests are failing
- Error appears in logs or stack traces
- User says something like "this is broken" or "it doesn't work"
- A previously working feature stopped working

## How to Use

### Phase 1: Reproduce

Before fixing anything, confirm you can reproduce the issue:

1. **Read the bug report carefully** — Extract the expected vs. actual behavior
2. **Find the relevant code** — Search the codebase, don't ask the user where it is
3. **Run the failing test or reproduce the error** — If there's no test, create a minimal reproduction
4. **Confirm the reproduction** — "I can reproduce this: [evidence]"

If you can't reproduce:
- Check if the bug is environment-specific
- Look for race conditions or state-dependent behavior
- Ask the user for clarification only as a last resort

### Phase 2: Diagnose

Find the root cause, not just the symptom:

1. **Read the error message and stack trace** — These exist for a reason
2. **Trace the execution path** — Follow the data flow from input to error
3. **Check recent changes** — `git log` and `git blame` are your friends
4. **Identify the root cause** — Not "what broke" but "why it broke"

```bash
# Useful diagnostic commands
git log --oneline -20              # Recent changes
git blame path/to/file.ts          # Who changed what
git diff HEAD~5 -- path/to/file.ts # What changed recently
```

### Phase 3: Fix

Implement the fix with precision:

1. **Fix the root cause, not the symptom** — A band-aid now is a bug later
2. **Keep the fix minimal** — Change only what needs to change
3. **Add a test for the bug** — The test should fail without the fix and pass with it
4. **Check for similar issues elsewhere** — If this bug could exist in other places, check them

### Phase 4: Verify

Prove the fix works:

1. **Run the reproduction again** — The error should be gone
2. **Run the full test suite** — No regressions
3. **Show the evidence** — Before/after comparison, test output, log diff
4. **Reference the verify-before-done skill** for the complete checklist

### Rollback Strategy

If verification fails after a fix:

1. **Immediately rollback** the changes — `git checkout -- .` or `git stash`
2. **Log the failed attempt** in `tasks/lessons.md` with root cause analysis
3. **Re-plan** with a different approach
4. **Never push broken code** hoping it will be caught later

## Examples

**Bad — Helpless:**
> User: "The login button doesn't work"
> Agent: "Can you tell me which file the login button is in? What error do you see? How do I run the tests?"

**Good — Autonomous:**
> User: "The login button doesn't work"
> Agent: "Investigating. Found the login handler in `src/auth/LoginForm.tsx`. The `onClick` handler calls `handleLogin()` which throws a `TypeError: Cannot read property 'token' of undefined` at line 42. Root cause: the auth context is `null` when the component mounts because `AuthProvider` is missing from the component tree in the latest route change (commit `a3f2c1d`). Fix: Wrapping the login route with `AuthProvider`. Test added. All 31 tests pass."

## Guidelines

- **No context switching required from the user** — Figure it out yourself
- Point at logs, errors, failing tests — then resolve them
- Go fix failing CI tests without being told how
- When given a bug report: just fix it. Don't ask for hand-holding.
- Find root causes. No temporary fixes. Senior developer standards.

## Anti-Patterns

- **Asking the user to navigate for you** — "Which file?" "How do I run tests?" Figure it out.
- **Band-aid fixes** — Catching and swallowing an exception is not a fix
- **Fixing the symptom** — The login button not working because of a missing provider isn't a "button bug"
- **Skipping verification** — An unverified fix might be worse than no fix
- **Not logging failed attempts** — You lost knowledge. Log it in `tasks/lessons.md`.
