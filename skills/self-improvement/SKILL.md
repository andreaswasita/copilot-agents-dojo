---
name: self-improvement
description: Captures lessons and promotes recurring patterns.
tier: core
category: workflow
created_by: human
platforms: [windows, macos, linux]
tags: [memory, lessons, patterns, continuous-learning]
author: Andreas Wasita (@andreaswasita)
---

# Self-Improvement Skill

Logs every correction and failed approach to `tasks/lessons.md` with structured metadata, escalates recurring patterns into skill amendments via `scripts/lesson-updater.sh`, and respects the cache-aware mutation rule so amendments don't trash Copilot's prompt cache mid-session. Does NOT delete or rewrite past lessons — history is evidence, not noise.

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

## Prerequisites

- `tasks/lessons.md` exists (created by `scripts/init.sh`).
- `scripts/lesson-updater.sh` available for the pattern-scan + amendment proposal.
- Familiarity with the cache-aware mutation rule (see `AGENTS.md` → Cache-Aware Mutations).

Before any work begins:
1. Read `memory/INDEX.md` — understand what knowledge exists
2. Read `tasks/lessons.md` — check for recent, un-promoted lessons
3. Query relevant context: `bash scripts/memory-query.sh --type pattern --tag <current-task-domain>`
4. Filter for entries relevant to the current project, language, or task type
5. Internalize active rules — these are your guardrails for this session
6. Note any lessons with high occurrence counts — these are your blind spots

## How to Run

```text
1. At session start: `view tasks/lessons.md` and internalize active rules.
2. On correction: append a structured YAML entry (template in Procedure §2).
3. Periodically: `scripts/lesson-updater.sh` to scan for 3+ recurrences.
4. On amendment: edit the relevant skill; default to deferred invalidation.
```

## Quick Reference

| Trigger | Action | Tool |
|---|---|---|
| Session start | Read lessons | `view tasks/lessons.md` |
| Correction logged | Append entry | `edit tasks/lessons.md` |
| Pattern scan | Run updater (deferred) | `powershell` → `bash scripts/lesson-updater.sh` |
| Pattern scan (urgent) | Run updater (immediate) | `powershell` → `bash scripts/lesson-updater.sh --now` |
| Amend a skill | Edit the SKILL.md | `edit skills/<name>/SKILL.md` |
| Archive a stale skill | Curator handles it | `powershell` → `bash scripts/curator.sh archive <name>` |

## Procedure

### Step 1: Session-Start Ritual

Before any work begins, `view tasks/lessons.md`. Filter mentally for entries relevant to the current project, language, or task type. High `occurrences` counts are your active blind spots — treat them as guardrails for this session.

### Step 2: Capture a Lesson

After any correction or failed approach, append a structured entry to `tasks/lessons.md`:

```yaml
- date: 2026-05-19
  error_type: type-error          # type-error | logic-bug | test-gap | over-engineering | scope-creep | …
  trigger: "Used string where number was expected in API response handler"
  root_cause: "Did not check the API schema before assuming response types"
  fix: "Added type validation at the API boundary"
  rule: "Verify API response types against the schema before using them"
  occurrences: 1
  status: active                  # active | resolved | amended-to-skill
  related_skill: code-review      # optional — which skill should absorb the rule?
```

Be ruthlessly honest. The only person you're fooling is yourself.

### Step 3: Watch for Patterns

When the same `rule` appears across 2+ entries, increment `occurrences` on the canonical entry instead of duplicating. At `occurrences: 3`, escalate.

### Step 4: Amend the Relevant Skill

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

Pass `--now` only when correctness requires immediate effect. The script prints a warning about cache-invalidation cost.

After the amendment lands, set the lesson's `status: amended-to-skill`.

### Step 5: Let the Curator Handle Stale Skills

Skills with `created_by: agent` and no recent use are auto-archived by `scripts/curator.sh` to `skills/.archive/`. Human-authored skills are never touched. Pin a skill to exempt it: `bash scripts/curator.sh pin <name>`.

## Pitfalls

- **DO NOT** "remember next time." If a lesson isn't in `tasks/lessons.md`, it doesn't exist.
- **DO NOT** log without a `rule:` field. A symptom without a prevention rule is a diary entry.
- **DO NOT** write hyper-specific rules. "Don't use `parseInt` on line 47 of auth.js" won't generalize. Extract the principle.
- **DO NOT** delete old lessons. Set `status: resolved` instead — history is evidence.
- **DO NOT** pass `--now` to `lesson-updater.sh` casually. It invalidates Copilot's prompt cache and dramatically raises cost.
- **DO NOT** edit `created_by: human` skills via the curator. The curator only manages `created_by: agent` skills.

## Verification

Concrete checks that prove the skill is producing intended outcomes. Run at session end (or after any correction) via the `powershell` tool:

```text
bash scripts/self-improvement-verify.sh
```

The script (source: `scripts/self-improvement-verify.sh`) asserts:

1. **`tasks/lessons.md` exists** — required artifact.
2. **Every lesson has a `rule:` field** — a lesson without a prevention rule is a diary entry and fails the check.
3. **No duplicated active rules** — the same `rule:` across multiple entries means someone cloned instead of incrementing `occurrences:`.
4. **Threshold promotion happened** — any entry with `occurrences: 3+` must either carry `status: amended-to-skill` or have a corresponding file under `memory/patterns/`.
5. **Memory graph has zero orphans** — runs `scripts/link-index.sh` and inspects `memory/INDEX.md`.
6. **Today's session summary (if any) links out** — at least one link to `memory/decisions/`, `memory/patterns/`, or `memory/preferences/`.

The script exits non-zero on hard failures and prints `Summary: pass=… fail=… warn=…`. Treat warnings as signal, not noise — investigate before closing the session.

Beyond the script: **active rules should reduce repeat errors**. If the same `error_type` + `trigger` recurs within 5 subsequent sessions after a rule lands, the rule is wrong — rewrite or remove it per Step 4 §8.
