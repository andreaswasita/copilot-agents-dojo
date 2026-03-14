---
name: plan-before-code
description: >-
  Guides the agent to plan multi-step work before writing any code. Use this skill
  whenever a task involves 3+ steps, architectural decisions, or any non-trivial change.
  Also use when the agent is about to rush into implementation without thinking through
  the approach, when re-planning is needed after hitting a wall, or when verification
  steps should be planned upfront.
---

# Plan Before Code

No wild swings. Agents plan multi-step work before touching code. Discipline over impulse.

## When to Use

- Any task with 3+ steps or architectural decisions
- Before implementing unfamiliar features or patterns
- When a previous approach failed and re-planning is needed
- When the scope of a change is unclear or ambiguous
- Before any refactoring that touches multiple files

## How to Use

### Step 1: Assess Complexity

Before writing code, ask:
- How many files will this touch?
- Are there architectural decisions to make?
- Could this break existing functionality?
- Is there ambiguity in the requirements?

If any answer is "yes" or "maybe," enter plan mode.

### Step 2: Write the Plan

Write the plan to `tasks/todo.md` with checkable items:

```markdown
## Task: [Brief description]

### Context
- What: [what we're building/fixing]
- Why: [the motivation]
- Risk: [what could go wrong]

### Steps
- [ ] Step 1: [specific action]
- [ ] Step 2: [specific action]
- [ ] Step 3: [specific action]

### Verification
- [ ] Tests pass
- [ ] No regressions
- [ ] Diff reviewed
```

### Step 3: Validate Before Executing

Review the plan for gaps:
- Are dependencies between steps clear?
- Is the verification plan concrete?
- Could any step be broken down further?

### Step 4: Execute with Checkpoints

Follow the plan. Mark items complete as you go. If something goes sideways:
1. **STOP** immediately
2. Log what went wrong
3. Revise the plan
4. Resume from the revised plan

## Examples

**Bad — Rushing In:**
> User: "Add authentication to the API"
> Agent: *immediately starts writing auth middleware*

**Good — Planning First:**
> User: "Add authentication to the API"
> Agent: "Let me plan this. I'll need to: (1) research the existing API structure, (2) choose an auth strategy, (3) implement the middleware, (4) update routes, (5) write tests, (6) verify. Writing plan to tasks/todo.md..."

## Guidelines

- Write detailed specs upfront to reduce ambiguity
- Use plan mode for verification steps, not just building
- Plans should be concrete enough that a different agent could pick them up
- Time spent planning is never wasted — it prevents rework

## Anti-Patterns

- **"I'll figure it out as I go"** — This leads to half-built features and tangled code
- **Planning in your head** — Write it down in `tasks/todo.md` or it doesn't count
- **Over-planning simple tasks** — A one-line fix doesn't need a 20-step plan. Use judgment.
- **Refusing to re-plan** — The first plan is rarely perfect. Adapt when new information arrives.
