---
name: durable-work
description: Picks the board over sub-agents for cross-turn work.
tier: core
category: delegation
created_by: human
platforms: [windows, macos, linux]
tags: [delegation, durable, board, persistence]
author: Andreas Wasita (@andreaswasita)
---

# Durable Work Skill

Routes work that must survive a single Copilot turn to `tasks/board/` instead of the `task` tool. Sub-agents launched via `task` are killed if the parent is cancelled (rate-limit, user navigation, OS sleep) — anything you need across sessions belongs on the durable board. The complementary skill is `skills/subagent-strategy`, which handles in-turn delegation.

## When to Use

- Work estimated > 1 turn (e.g. a multi-step deployment, a long build, an iterative review).
- Work that multiple agents or a human will hand off across sessions.
- Work whose state must be queryable later (`scripts/board.sh status`).
- Work whose loss would block the user (e.g. partial migrations, in-flight refactors).
- NOT for: one-shot research, fast file reads, parallel grep — those are sub-agent territory.

## Prerequisites

- `tasks/board/` exists (created by `scripts/init.sh` or the dojo template).
- `scripts/board.sh` available on PATH or as `bash scripts/board.sh`.
- Familiarity with `.dojo/delegation.yaml` → `escalate_to_board_if` triggers.

## How to Run

```text
1. Decide: does this work need to survive parent cancellation? If yes, board.
2. Create the task file: bash scripts/board.sh new "<title>".
3. Fill Context, Plan, Verification in the new tasks/board/NNN-slug.md.
4. Work through Plan checkboxes; update `status:` frontmatter as you go.
5. On completion: set status: done, write the Lessons section, run roll-up.
```

## Quick Reference

| Step | Action | Tool |
|---|---|---|
| Decide durable | Check `.dojo/delegation.yaml` triggers | `view .dojo/delegation.yaml` |
| Create task | New board file from template | `powershell` → `bash scripts/board.sh new "<title>"` |
| Status snapshot | Group tasks by status | `powershell` → `bash scripts/board.sh list` |
| Single-line summary | Counts per status | `powershell` → `bash scripts/board.sh status` |
| Update todo.md | Roll up board into the plan view | `powershell` → `bash scripts/board.sh roll-up` |
| Edit task fields | Update frontmatter or checkboxes | `edit tasks/board/<file>.md` |

## Procedure

### Step 1: Decide Durable vs Ephemeral

Open `.dojo/delegation.yaml` → `escalate_to_board_if`. If ANY of those triggers fire, use the board. Otherwise, the work is in-turn and `subagent-strategy` applies. Do NOT default to the board — overuse turns it into a graveyard of stale tasks.

### Step 2: Create a Board Entry

```bash
bash scripts/board.sh new "Migrate legacy auth to JWT"
```

This copies `tasks/board/000-template.md` to the next ordinal (e.g. `001-migrate-legacy-auth-to-jwt.md`), substitutes id/title/date, and prints the path.

### Step 3: Fill Context and Plan

Open the new file. Write:

- **Context** — Why this task exists. Link the issue, the spec, the conversation.
- **Plan** — Concrete, verifiable checkboxes. NOT "improve auth" — write "replace cookie-based session check in `src/middleware/auth.js` with JWT verifier".
- **Verification** — How we'll know it's done. Tests, diffs, smoke commands.

### Step 4: Work and Update Status

Use the `edit` tool on the task file as work progresses. Update the `status:` field (`pending` → `in_progress` → `done` or `blocked`), bump `updated:`, and check off Plan items as they land. Append to **Decisions** as you make them — never rewrite history.

### Step 5: Roll Up to todo.md

```bash
bash scripts/board.sh roll-up
```

This regenerates `tasks/todo.md` from the board so anyone (human or agent) can see plan state at a glance. The board file remains the source of truth; `todo.md` is the rendered view. Run this before every session start and after every status flip.

### Step 6: Close and Capture Lessons

When `status: done`, write the **Lessons** section. What would you tell a future agent picking up similar work? Cross-reference relevant `tasks/lessons.md` entries.

## Pitfalls

- **DO NOT** use the board for in-turn research, parallel reads, or quick analysis — that's `subagent-strategy`. The board has per-task overhead that swamps small work.
- **DO NOT** edit `tasks/todo.md` directly once the board is in use. Edits will be wiped on the next `roll-up`. Edit the board file instead.
- **DO NOT** leave stale `in_progress` tasks — flip to `blocked` with a reason if you stop.
- **DO NOT** rename board files. The ordinal in the filename is the durable id; downstream tooling indexes it.
- **DO NOT** skip the Lessons section when closing a task — the board is also the dojo's institutional memory.
- **DO NOT** mix durable and ephemeral work in the same task file. One concern per file.

## Verification

- [ ] Every task on the board has `id`, `title`, `status`, `owner`, `created`, `updated` frontmatter.
- [ ] `tasks/todo.md` matches the board (run `bash scripts/board.sh roll-up` if not).
- [ ] No `in_progress` task older than 2 days without a `Decisions` update.
- [ ] No edits to `tasks/todo.md` since the last `roll-up`.
- [ ] Every `done` task has a non-empty `Lessons` section.
