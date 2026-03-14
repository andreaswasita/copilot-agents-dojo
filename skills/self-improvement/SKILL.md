---
name: self-improvement
description: >-
  Drives the agent's continuous learning loop — capturing lessons from corrections,
  tracking patterns, and proposing skill amendments. Use this skill at the start of
  every session (to review past lessons), after any correction from the user, when a
  mistake pattern recurs, or when proposing updates to skills.md. This is the dojo's
  memory system — without it, agents repeat the same mistakes forever.
---

# Self-Improvement Loop

After every correction, agents capture the lesson with tags and metrics. Patterns feed back into skills. The dojo is not static — it evolves.

## When to Use

- **Session start**: Review `tasks/lessons.md` before doing anything else
- **After any correction**: User points out a mistake or a better approach
- **After a failed approach**: Something you tried didn't work
- **Pattern recognition**: You notice you've made a similar mistake before
- **Skill amendment**: A pattern hits 3+ occurrences

## How to Use

### Session Start Ritual

Before any work begins:
1. Read `tasks/lessons.md`
2. Filter for entries relevant to the current project, language, or task type
3. Internalize active rules — these are your guardrails for this session
4. Note any lessons with high occurrence counts — these are your blind spots

### Capturing a Lesson

After ANY correction from the user, immediately log a structured entry:

```yaml
- date: 2024-01-15
  error_type: type-error          # category: type-error, logic-bug, test-gap, over-engineering, etc.
  trigger: "Used string where number was expected in API response handler"
  root_cause: "Didn't check the API schema before assuming response types"
  fix: "Added type validation at the API boundary"
  rule: "Always verify API response types against the schema before using them"
  occurrences: 1
  status: active                  # active | resolved | amended-to-skill
```

### Tracking Metrics

For each lesson, track:
- **Occurrences**: How many times this pattern has appeared
- **Pre/post-fix results**: Did the rule actually prevent recurrence?
- **Amendment success rate**: When lessons became skill rules, did they stick?

### The Amendment Cycle

When a pattern hits 3+ occurrences:

1. **Identify the pattern** — What's the common thread across occurrences?
2. **Draft a rule** — Write a concrete, actionable rule
3. **Propose the amendment** — Suggest an update to `skills.md` or `copilot-instructions.md`
4. **Run `scripts/lesson-updater.sh`** — Automated pattern scanning
5. **Evaluate** — After the rule is in place, does the mistake rate drop?
6. **Revise or remove** — If a rule isn't working, fix it or drop it. Dead rules are noise.

## Examples

**Lesson Entry:**
See [examples/lesson-entry.md](examples/lesson-entry.md) for a complete worked example.

**Pattern → Amendment:**
```
Lesson #1: Forgot to run tests before marking task complete (2024-01-10)
Lesson #2: Submitted code that broke existing tests (2024-01-12)
Lesson #3: Missed a regression in the auth module (2024-01-14)

Pattern: Verification gaps before completion
Amendment: Added "Run full test suite" as mandatory step in verify-before-done skill
```

## Guidelines

- Be ruthlessly honest in lessons — the only person you're fooling is yourself
- Tag lessons with metadata (error type, file, discipline) for queryability
- Don't just log the symptom — dig to root cause
- Review lessons at session start, not just when things go wrong
- Celebrate resolved lessons — they prove the system works

## Anti-Patterns

- **Not logging lessons** — "I'll remember next time" is a lie
- **Logging without rules** — A lesson without a prevention rule is just a diary entry
- **Never reviewing** — Lessons you don't review can't help you
- **Overly specific rules** — "Don't use `parseInt` on line 47 of auth.js" won't generalize. Extract the principle.
- **Keeping dead rules** — If a rule hasn't been relevant in months, archive it
