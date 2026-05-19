---
name: self-improvement
description: Captures lessons and proposes skill amendments.
tier: core
category: discipline
created_by: human
platforms: [windows, macos, linux]
tags: [learning, lessons, curator]
author: Andreas Wasita (@andreaswasita)
---

# Self-Improvement Skill

Logs every correction and failed approach to `tasks/lessons.md` with structured metadata, escalates recurring patterns into skill amendments via `scripts/lesson-updater.sh`, and respects the cache-aware mutation rule so amendments don't trash Copilot's prompt cache mid-session. Does NOT delete or rewrite past lessons — history is evidence, not noise.

## When to Use

- Session start: read `tasks/lessons.md` before any other work.
- Immediately after a user correction or pointed-out mistake.
- After any approach that failed (even if you fixed it on the next try).
- When you recognize a pattern you've hit before.
- When a single lesson reaches 3+ `occurrences` — amend the relevant skill.

## Prerequisites

- `tasks/lessons.md` exists (created by `scripts/init.sh`).
- `scripts/lesson-updater.sh` available for the pattern-scan + amendment proposal.
- Familiarity with the cache-aware mutation rule (see `AGENTS.md` → Cache-Aware Mutations).

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

Run `scripts/lesson-updater.sh` to scan for 3+ recurrence patterns and emit amendment proposals. By default the script defers invalidation — the change is written but takes effect on the next Copilot session, preserving the in-flight prompt cache.

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

- [ ] `tasks/lessons.md` has an entry for every correction this session.
- [ ] Each entry has a `rule:` field, not just a `trigger:`.
- [ ] No duplicate rules — recurrence is tracked via `occurrences:`.
- [ ] Amendments default to deferred invalidation unless `--now` is justified.
- [ ] `scripts/verify.sh spec` passes after any skill amendment.
