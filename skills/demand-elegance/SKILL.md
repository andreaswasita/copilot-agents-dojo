---
name: demand-elegance
description: Challenges hacky fixes on non-trivial changes.
tier: core
category: discipline
created_by: human
platforms: [windows, macos, linux]
tags: [quality, design, simplicity]
author: Andreas Wasita (@andreaswasita)
---

# Demand Elegance Skill

Forces the agent to challenge its own non-trivial diff before presenting it: fewer moving parts, standard patterns over custom abstractions, boring over clever. Does NOT apply to typos, one-line fixes, or hotfixes — over-engineering trivial work is the failure mode this skill explicitly avoids.

## When to Use

- A fix feels hacky, fragile, or "barely working".
- Multiple solutions exist and the tradeoffs aren't obvious.
- The diff is large and includes infrastructure the original task didn't ask for.
- Refactoring with simplification as the explicit goal.
- Self-review before presenting any non-trivial solution.
- NOT for: typos, one-line bugfixes, comment edits, formatting, production hotfires.

## Prerequisites

- A working solution (or near-working) to challenge — don't run this on a blank canvas.
- The full diff visible (`git diff` via the `powershell` tool).
- Willingness to throw work away if a simpler approach exists.

## How to Run

```text
1. Confirm the change is non-trivial. If trivial, skip — see Pitfalls.
2. Run the Elegance Check (4 questions in Procedure §1).
3. Apply the Simplicity Ladder (Procedure §2) to choose between options.
4. Self-review the diff as if it were someone else's PR.
5. If hacky, restart with the elegant approach — don't deodorize the smell.
```

## Quick Reference

| Question | If answer is "yes" → action |
|---|---|
| Is there a more elegant way? | Try it before shipping. |
| Knowing what I know now, would I build it this way? | If no, refactor before presenting. |
| Can I reduce moving parts? | Cut them. |
| Would a senior engineer raise an eyebrow? | They would. Fix it. |

| Choose | Over |
|---|---|
| Fewer lines | More lines (all else equal) |
| Standard patterns | Custom abstractions |
| Fewer dependencies | More dependencies |
| Readable | Clever |
| Boring & correct | Exciting & fragile |

## Procedure

### Step 1: The Elegance Check

For non-trivial work, before presenting the diff, ask in order:

1. Is there a more elegant way?
2. Knowing everything I know now, would I build it this way?
3. Can I reduce the number of moving parts?
4. Would a senior reviewer raise an eyebrow at this?

A "yes" to any means: pause and try the simpler path.

### Step 2: The Simplicity Ladder

When picking between solutions, prefer the upper rungs:

1. No code change (the bug isn't a bug, or the requirement is wrong).
2. Configuration change.
3. Small, local code change inside one function.
4. Localized refactor inside one module.
5. Cross-module change with explicit motivation.
6. New abstraction (only if 1–5 are insufficient).

If you land on rung 6, justify why 1–5 do not work in a comment or in `tasks/todo.md`.

### Step 3: Self-Review the Diff

Run `git diff` via the `powershell` tool and read your own diff as if reviewing a stranger's PR. Identify the smelliest part — there is always one. Ask whether that smell can be eliminated, not just covered up.

### Step 4: Restart If Hacky

If the diff still feels hacky after Step 3, throw it away and start over with the simpler approach. Resist the sunk-cost reflex.

A useful self-prompt: *"Knowing everything I know now, implement the elegant solution."*

## Pitfalls

- **DO NOT** run this skill on trivial changes. A typo fix doesn't need an architecture review.
- **DO NOT** premature-abstract. Build for the requirements that exist, not the ones you imagine.
- **DO NOT** gold-plate. The user asked for a button fix, not a component-system redesign.
- **DO NOT** confuse cleverness with elegance. If you need a comment to explain what (not why) the code does, it's too clever.
- **DO NOT** apply during production hotfires. Stabilize first; log a `tasks/lessons.md` entry to revisit.
- **DO NOT** deodorize a smell — eliminate it. Wrapping bad code in a clean interface still leaves bad code.

## Verification

- [ ] Diff size is justified by the task description in `tasks/todo.md`.
- [ ] No new abstractions without explicit justification.
- [ ] No new dependencies without explicit justification.
- [ ] Self-review pass completed (`git diff` read end-to-end).
- [ ] No `tasks/lessons.md` entry tagged `over-engineering` for this task.
