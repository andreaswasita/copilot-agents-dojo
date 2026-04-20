---
name: self-improvement
description: >-
  Drives the agent's continuous learning loop — capturing lessons from corrections,
  tracking patterns, and proposing skill amendments. Use this skill at the start of
  every session (to review past lessons), after any correction from the user, when a
  mistake pattern recurs, or when proposing updates to skills.md. This is the dojo's
  memory system — without it, agents repeat the same mistakes forever.
  Integrates with the memory vault (memory/) for persistent, linked knowledge.
---

# Self-Improvement Loop

After every correction, agents capture the lesson with tags and metrics. Patterns feed back into skills. The dojo is not static — it evolves.

The memory vault (`memory/`) extends this with structured, linked knowledge:
- **Lessons** live in `tasks/lessons.md` (short-term capture)
- **Patterns** graduate to `memory/patterns/` when they hit 3+ occurrences
- **Decisions** are recorded in `memory/decisions/` for architectural context
- **Preferences** accumulate in `memory/preferences/` from user corrections
- **Sessions** are summarized in `memory/sessions/` with links to all of the above

## When to Use

- **Session start**: Review `memory/INDEX.md` + `tasks/lessons.md` before doing anything else
- **After any correction**: User points out a mistake or a better approach
- **After a failed approach**: Something you tried didn't work
- **Pattern recognition**: You notice you've made a similar mistake before
- **Skill amendment**: A pattern hits 3+ occurrences
- **After any architectural decision**: Record it in `memory/decisions/`
- **Session end**: Write a session summary in `memory/sessions/`

## How to Use

### Session Start Ritual

Before any work begins:
1. Read `memory/INDEX.md` — understand what knowledge exists
2. Read `tasks/lessons.md` — check for recent, un-promoted lessons
3. Query relevant context: `bash scripts/memory-query.sh --type pattern --tag <current-task-domain>`
4. Filter for entries relevant to the current project, language, or task type
5. Internalize active rules — these are your guardrails for this session
6. Note any lessons with high occurrence counts — these are your blind spots

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
3. **Promote to memory vault** — Create a file in `memory/patterns/` using the template:
   ```bash
   cp memory/patterns/_template.md memory/patterns/pattern-name.md
   ```
4. **Propose the amendment** — Suggest an update to `skills.md` or `copilot-instructions.md`
5. **Run `scripts/lesson-updater.sh`** — Automated pattern scanning
6. **Run `scripts/link-index.sh`** — Update the link graph with new connections
7. **Evaluate** — After the rule is in place, does the mistake rate drop?
8. **Revise or remove** — If a rule isn't working, fix it or drop it. Dead rules are noise.

### Recording Decisions

When an architectural or design decision is made during a session:

1. Copy the template: `cp memory/decisions/_template.md memory/decisions/YYYY-MM-DD-short-name.md`
2. Fill in context, decision, alternatives, and consequences
3. Link from the session summary: `[decision](../decisions/YYYY-MM-DD-short-name.md)`
4. Run `scripts/link-index.sh` to update backlinks

### Recording Preferences

When the user corrects your approach (not a bug, but a style/approach preference):

1. Copy the template: `cp memory/preferences/_template.md memory/preferences/preference-name.md`
2. Record what they prefer and why
3. Set confidence to `low` initially — raise to `medium` after 2nd reinforcement, `high` after 3rd

### Session End Ritual

At the end of every non-trivial session:

1. Create `memory/sessions/YYYY-MM-DD-summary.md` from template
2. Link to any decisions, patterns, or preferences created/referenced
3. Run `scripts/link-index.sh` to rebuild the graph
4. Update `tasks/lessons.md` metrics

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
- **Skipping promotion** — A lesson that hits 3+ occurrences but stays in lessons.md is wasted knowledge. Promote it to `memory/patterns/`
- **Orphaned memory files** — Files in `memory/` with no links to or from anything. Run `scripts/link-index.sh` and check for orphans
- **Duplicating skill rules as preferences** — `memory/preferences/` is for *learned* behaviors, not hardcoded rules that already exist in skills
