---
name: using-superpowers
description: >-
  The activation skill — loads the full dojo framework at the start of every
  Copilot session. Use this skill at the beginning of every new session, when
  the user says "use superpowers," "activate the dojo," or "start the framework,"
  or when any other skill references the mandatory workflow. This skill ensures
  all other skills are active and the mandatory workflow is enforced.
---

# Using Superpowers (Copilot Dojo Edition)

The dojo activator. Load this, and every skill is live. The mandatory workflow starts.

## Activation

When a new session begins or the user says "use superpowers":

1. **All skills in `skills/` are active** — Auto-discovered by Copilot from repo root
2. **The mandatory workflow is enforced** — No skipping steps
3. **`tasks/lessons.md` is reviewed** — Past lessons inform this session
4. **Clean state is verified** — `git status`, test baseline confirmed

## The Mandatory Workflow

Every non-trivial task follows this pipeline:

```
1. BRAINSTORM  → Refine ideas, get design approved
2. WORKTREE    → Create isolated workspace
3. PLAN        → Break into bite-sized tasks in tasks/todo.md
4. EXECUTE     → One task at a time (or parallel dispatch)
5. TEST        → RED-GREEN-REFACTOR for every change
6. REVIEW      → Self-review against plan after each task
7. FINISH      → Full verification, merge decision, cleanup
8. LEARN       → Update tasks/lessons.md with retrospective
```

### When to Use the Full Pipeline

| Scenario | Workflow |
|----------|----------|
| New feature | Full pipeline: brainstorm → finish |
| Bug fix (non-trivial) | Skip brainstorm, start at plan |
| One-line fix | Direct fix + verify-before-done |
| Refactoring | Start at plan, emphasis on test baseline |
| Code review | Use code-review + receiving-code-review |

### Skill Activation Map

**Always active (Core Disciplines):**
- `plan-before-code` — Plan multi-step work before touching code
- `verify-before-done` — Prove your work with evidence
- `self-improvement` — Capture lessons, review at session start
- `demand-elegance` — Challenge hacky solutions
- `autonomous-bug-fix` — Full bug cycle, zero hand-holding
- `subagent-strategy` — Delegate research and analysis

**Workflow skills (activate in sequence):**
- `brainstorming` → `using-git-worktrees` → `executing-plans` → `requesting-code-review` → `finishing-a-development-branch`

**On-demand skills (load when needed):**
- `code-review` — Reviewing PRs or diffs
- `refactoring` — Safe restructuring
- `test-writing` — Writing meaningful tests
- `pr-workflow` — Preparing merge-ready PRs
- `debugging` — Systematic complex debugging
- `codebase-onboarding` — Understanding unfamiliar repos
- `dispatching-parallel-agents` — Concurrent sub-agent work
- `receiving-code-review` — Processing review feedback
- `skill-creator` / `writing-skills` — Creating new skills

## Session Start Ritual

Every session begins with:

1. Review `tasks/lessons.md` — What did we learn last time?
2. Check `tasks/todo.md` — Is there work in progress?
3. Verify git status — Are we on the right branch? Clean state?
4. Acknowledge active skills — "Dojo framework active. All skills loaded."

## Enforcement Rules

1. **All skills are mandatory** — No skipping steps in the workflow
2. **No code without a plan** (unless one-liner fix)
3. **No merge without verification** — `scripts/verify.sh` or equivalent
4. **No "done" without proof** — Tests, logs, diffs
5. **Every correction becomes a lesson** — `tasks/lessons.md`
6. **Main branch is read-only** — Work on feature branches/worktrees

## Examples

**Session Start:**
> Agent: "Dojo framework active. Reviewed lessons.md (3 active lessons, 1 relevant
> to today's task). No work in progress. On main branch, clean state. Ready."

**Skill Triggering:**
> User: "I want to add real-time notifications"
> Agent: *brainstorming activates* → asks Socratic questions → design approved
> → *using-git-worktrees activates* → creates feature branch
> → *plan-before-code activates* → writes plan to tasks/todo.md
> → *executing-plans activates* → works through tasks
> → *requesting-code-review activates* → self-reviews
> → *finishing-a-development-branch activates* → presents merge options

## Anti-Patterns

- **"I'll skip brainstorming, I know what to build"** — You don't. Ask questions.
- **"I'll just commit to main this once"** — You won't "just" anything. Use a branch.
- **"Tests take too long, I'll add them later"** — Later never comes. Test now.
- **"The plan is in my head"** — Write it in `tasks/todo.md` or it doesn't exist.
- **"I already know everything"** — Review `tasks/lessons.md`. You forgot something.
