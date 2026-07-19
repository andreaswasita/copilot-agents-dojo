# `tasks/board/` — Durable Task Board

One markdown file per task. Each file outlives a single Copilot turn, survives
agent cancellation, and can be picked up across sessions by any agent or human.

This is the **durable** complement to `tasks/todo.md`:

| Concern                                | `tasks/todo.md`           | `tasks/board/`                   |
|----------------------------------------|---------------------------|----------------------------------|
| Lifetime                               | Current turn / session    | Cross-session                    |
| Granularity                            | Plan steps                | One file per discrete task       |
| Updated by                             | Active agent              | Any agent / human                |
| Audited by                             | `scripts/verify.sh plan`  | `scripts/verify.sh plan`         |
| Source of truth for `tasks/todo.md`?   | n/a                       | YES (via `scripts/board.sh roll-up`) |

## File format

Each task is a markdown file named `NNN-slug.md` where `NNN` is a zero-padded
ordinal (e.g. `001-add-auth.md`). YAML frontmatter on top, then a checklist.

```yaml
---
id: 001-add-auth
title: Add JWT-based authentication
status: in_progress       # pending | in_progress | blocked | done
owner: software-engineer  # persona slug or human name
created: 2026-05-20
updated: 2026-05-20
depends_on: []
labels: [security, api]
estimate: 2-turns
---
```

Body sections (canonical):

- **Context** — why this task exists, links to upstream issues/specs.
- **Plan** — checkbox list of concrete steps.
- **Decisions** — notes captured during execution.
- **Verification** — how we'll know it's done.
- **Lessons** — postmortem (after completion).

## Commands

```bash
bash scripts/board.sh new "title here"    # create a new task file
bash scripts/board.sh list                # show all tasks grouped by status
bash scripts/board.sh roll-up             # regenerate tasks/todo.md from board/
bash scripts/board.sh status              # quick summary
```

Or use the `skills/durable-work` skill, which is the agent-facing wrapper.

## Why this exists

Sub-agents launched via the `task` tool are **not** durable. If the parent is
interrupted (rate-limit, user navigation, OS sleep), the child is cancelled
and its work is lost. The board is the escape hatch for work that must
survive a turn.

See `.dojo/delegation.yaml` → `escalate_to_board_if` for the explicit criteria.
