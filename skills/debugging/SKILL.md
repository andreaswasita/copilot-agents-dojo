---
name: debugging
description: >-
  A systematic approach to debugging complex issues — from reproducing the problem to
  identifying root cause. Use this skill when investigating errors, stack traces, or
  unexpected behavior, when the cause of a bug is not immediately obvious, when dealing
  with intermittent or hard-to-reproduce issues, or when standard debugging approaches
  have failed. This complements autonomous-bug-fix with deeper diagnostic techniques.
---

# Debugging

When the cause isn't obvious, be systematic. Debugging is investigation, not guessing.

## When to Use

- The cause of a bug is not immediately obvious
- Dealing with intermittent or hard-to-reproduce issues
- Complex issues spanning multiple components
- Standard approaches (read the error, fix the obvious) have failed
- Performance issues, memory leaks, race conditions

## How to Use

### The Debugging Mindset

Two rules:
1. **The computer is not lying to you.** If the behavior is unexpected, your mental model is wrong.
2. **Every bug has a cause.** If you can't find it, you're not looking in the right place.

### Step 1: Gather Evidence

Before hypothesizing:
```bash
# Read the actual error — all of it
cat logs/error.log | tail -50

# Get the full stack trace
# Check recent changes
git log --oneline -10

# Check if the issue is new or old
git bisect start
git bisect bad HEAD
git bisect good <last-known-good-commit>
```

### Step 2: Form a Hypothesis

Based on evidence, not hunches:
- What changed recently? (`git log`, `git diff`)
- What's different about the failing case? (input, environment, timing)
- Where in the execution path does behavior diverge from expectation?

### Step 3: Test the Hypothesis

**Narrow down the cause systematically:**

| Technique | When to Use |
|-----------|-------------|
| **Binary search (git bisect)** | Bug appeared recently, clean commit history |
| **Print/log debugging** | Need to trace execution flow |
| **Minimal reproduction** | Complex system, need to isolate the variable |
| **Breakpoint debugging** | Need to inspect state at a specific point |
| **Diff analysis** | "It worked before" — find what changed |
| **Input manipulation** | Test with simpler inputs to find the failing condition |

### Step 4: Apply Divide and Conquer

For complex issues, isolate the layer:

```
Request → Middleware → Controller → Service → Database
                                      ↑
                      Narrow it down to this layer,
                      then narrow within the layer
```

1. **Is the input correct?** — Check what reaches each layer
2. **Is the output correct?** — Check what leaves each layer
3. **Find the gap** — The bug is where correct input produces incorrect output

### Step 5: Fix and Prevent

Once root cause is found:
1. Write a test that reproduces the bug
2. Fix the root cause (not the symptom)
3. Verify the fix resolves the original issue
4. Check for the same pattern elsewhere in the codebase
5. Log a lesson in `tasks/lessons.md` if the debugging technique was non-obvious

## Debugging Specific Issues

### Race Conditions
- Add logging with timestamps to trace execution order
- Look for shared mutable state
- Check for missing locks, missing `await`, or unguarded concurrent access

### Memory Leaks
- Profile memory over time, not just at one point
- Look for growing collections, unclosed resources, or retained references
- Event listeners and subscriptions are common culprits

### Performance Issues
- Profile first, optimize second — never guess at bottlenecks
- Check the database (N+1 queries, missing indexes, full table scans)
- Check the network (unnecessary requests, missing caching)

### Intermittent Failures
- Look for timing-dependent code (timeouts, race conditions)
- Check for external dependencies (network, third-party APIs)
- Run the failing test in a loop to gather more data

## Guidelines

- **Read the error message.** Completely. Including the "caused by" chain.
- Let evidence guide you, not intuition — intuition is wrong more often than you think
- When stuck for >15 minutes, change your approach entirely
- Subagents are excellent for parallel investigation of hypotheses
- Document non-obvious debugging sessions in `tasks/lessons.md`

## Anti-Patterns

- **Shotgun debugging** — Changing random things and hoping something sticks
- **Skipping the reproduction** — You can't fix what you can't see
- **Blaming the framework** — It's almost always your code. Check your code first.
- **Debugging in production** — Reproduce locally whenever possible
- **Fixing without understanding** — If you can't explain why the fix works, you haven't found the root cause
