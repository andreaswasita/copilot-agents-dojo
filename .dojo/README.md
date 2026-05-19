# `.dojo/` — Runtime State

Local, machine-specific state for the dojo. **Not** the dojo itself — that lives at the repo root.

Contents:

| File                       | Purpose                                                                 |
|----------------------------|-------------------------------------------------------------------------|
| `skill-usage.json`         | Per-skill telemetry: invocation counts, last-used timestamps, lessons.  |
| `pending-amendments.md`    | Deferred skill amendments emitted by `scripts/lesson-updater.sh`.       |
| `curator.log`              | Append-only audit trail for every `scripts/curator.sh` action.          |

## Why a sidecar?

Telemetry and pending-state must not live inside `skills/*/SKILL.md` — those files are prompt-cached and edits invalidate the cache mid-session (see [`AGENTS.md` → Cache-Aware Mutations](../AGENTS.md#cache-aware-mutations)).

`.dojo/` is the agreed escape hatch: written hot, read cold.

## Commit policy

- ✅ Commit `.dojo/skill-usage.json` if you want team-wide telemetry rollups.
- ❌ Do NOT commit `.dojo/pending-amendments.md` — it's an inbox, not a record.
- ❌ Do NOT commit `.dojo/curator.log` — local audit only.

The default `.gitignore` for the dojo treats `.dojo/` as **opt-in to commit** per file. Add entries to `.dojo/.gitignore` to suppress what you don't want tracked.

## Schema: `skill-usage.json`

```json
{
  "version": 1,
  "generated_at": "2026-05-20T00:00:00Z",
  "skills": {
    "plan-before-code": {
      "uses": 0,
      "last_used": null,
      "lessons_logged": 0,
      "last_lesson_at": null,
      "pinned": false
    }
  }
}
```

Bumped by `scripts/curator.sh record <skill>` (manual or hooked) and by `scripts/lesson-updater.sh` when a lesson tagged with `related_skill:` is appended.
