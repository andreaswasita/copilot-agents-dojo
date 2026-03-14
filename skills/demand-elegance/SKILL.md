---
name: demand-elegance
description: >-
  Challenges the agent to find elegant solutions for non-trivial changes while
  avoiding over-engineering on simple fixes. Use this skill when a fix feels hacky
  or when the agent is about to submit a brute-force solution to a nuanced problem.
  Also use when refactoring, when multiple approaches exist and the right tradeoff
  needs evaluation. Skip this for one-line bug fixes or trivial changes — the skill
  itself teaches when NOT to apply.
---

# Demand Elegance (Balanced)

Brute force is for beginners. Challenge hacky solutions — but skip the kata for simple fixes.

## When to Use

- A fix feels hacky or fragile
- There are multiple approaches and the tradeoffs aren't obvious
- The agent is about to submit a solution with many moving parts when fewer would suffice
- During refactoring when the goal is simplification
- When reviewing your own work before presenting it

## When to Skip

- **One-line bug fixes** — Don't wrap a typo fix in an abstraction layer
- **Simple, obvious changes** — If the solution is clear and minimal, just do it
- **Time-critical hotfixes** — Elegance matters, but production fires come first (log a lesson to revisit later)

## How to Use

### The Elegance Check

For any non-trivial change, pause and ask:

1. **"Is there a more elegant way?"** — Step back from the implementation and think about the approach
2. **"Knowing everything I know now, would I build it this way?"** — Fresh eyes on your own work
3. **"Can I reduce the moving parts?"** — Fewer components = fewer failure points
4. **"Would a senior engineer raise an eyebrow?"** — If yes, reconsider

### The Simplicity Principle

When choosing between solutions:

```
Fewer lines > more lines (all else being equal)
Standard patterns > custom abstractions
Fewer dependencies > more dependencies
Readable > clever
Boring but correct > exciting but fragile
```

### Challenge Your Own Work

Before presenting any non-trivial solution:
1. Read through the diff as if reviewing someone else's code
2. Identify the "smelliest" part — there's always one
3. Ask if that smell can be eliminated, not just deodorized
4. If the solution feels hacky, say: *"Knowing everything I know now, implement the elegant solution"* and start fresh

## Examples

**Hacky — Over-Complicated:**
```python
# Adding retry logic with custom backoff, circuit breaker, and dead letter queue
# for a function that calls one API once at startup
class RetryWithCircuitBreaker:
    ...  # 200 lines of infrastructure
```

**Elegant — Right-Sized:**
```python
# Simple retry for startup API call
for attempt in range(3):
    try:
        result = fetch_config()
        break
    except APIError:
        if attempt == 2:
            raise
        time.sleep(2 ** attempt)
```

**Over-Engineered — Gold Plating:**
```
User: "Fix the typo in the error message"
Agent: "I've fixed the typo and also created an i18n system with
       translation files, a string extraction pipeline, and a CI
       check for missing translations."
```

## Guidelines

- The best solution is the one with the fewest moving parts that solves the real problem
- Challenge your own work before presenting it
- When in doubt, choose the boring solution — boring is reliable
- Elegance is not cleverness. Clever code is hard to debug. Elegant code is easy to understand.
- Every abstraction has a cost. Don't pay it unless you need to.

## Anti-Patterns

- **Premature abstraction** — Don't build flexibility for requirements that don't exist
- **Cleverness over clarity** — If you need comments to explain what the code does (not why), it's too clever
- **Gold plating** — Fixing the bug + adding 3 features nobody asked for
- **Refactoring the world** — You were asked to fix a button. Don't rewrite the component system.
- **Paralysis** — Overthinking simple changes. The elegance check is meant for non-trivial work.
