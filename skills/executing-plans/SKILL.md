---
name: executing-plans
description: >-
  Dispatches and executes bite-sized tasks from the approved plan in tasks/todo.md.
  Use this skill when a plan has been approved and execution should begin, when
  working through a multi-step implementation, when resuming work after a break
  or context switch, or when the user says "go," "start," or "execute the plan."
  Works with subagent-strategy for delegation or directly for sequential execution.
---

# Executing Plans

Take one task. Execute it. Verify it. Move to the next. No skipping. No freelancing.

## When to Use

- A plan in `tasks/todo.md` has been approved
- Starting or resuming a multi-step implementation
- User says "go," "start," "execute," or "begin"
- After brainstorming + planning produces a clear task list
- When a subagent completes a batch and the next batch is ready

## How to Use

### Step 1: Load the Plan

Read `tasks/todo.md` and identify the next uncompleted task:

```markdown
## Plan
- [x] Step 1: Set up database schema         ✅
- [x] Step 2: Create data models              ✅
- [ ] Step 3: Implement API endpoints          ← NEXT
- [ ] Step 4: Add input validation
- [ ] Step 5: Write integration tests
```

### Step 2: Execute One Task at a Time

For each task:

1. **Read the task spec** — What exactly needs to happen?
2. **Check dependencies** — Are prerequisites complete?
3. **Execute** — Write the code, run the commands
4. **Verify** — Tests pass, behavior is correct (reference `verify-before-done`)
5. **Mark complete** — Update `tasks/todo.md` with the checkbox
6. **Commit** — One commit per completed task (or logical unit)

```bash
# After completing Step 3
git add -A
git commit -m "feat: implement API endpoints for user preferences"
```

### Step 3: Use Subagents When Beneficial

For tasks that benefit from delegation:
- **Independent tasks** → Dispatch to parallel subagents (reference `dispatching-parallel-agents`)
- **Research-heavy tasks** → Spawn a research subagent first
- **Test-heavy tasks** → Subagent writes tests while you implement

For simple sequential tasks, just execute directly.

### Step 4: Handle Blockers

When a task can't be completed as planned:

1. **STOP** — Don't improvise around the blocker
2. **Log the blocker** in `tasks/todo.md`:
   ```markdown
   - [ ] Step 3: Implement API endpoints
     > ⚠️ BLOCKED: Database schema doesn't support the required query pattern.
     > Need to add an index or restructure Step 1.
   ```
3. **Re-plan** — Update the plan to address the blocker
4. **Resume** from the revised plan

### Step 5: Progress Updates

After every 2–3 completed tasks, provide a brief status:

```markdown
**Progress:** 3/5 tasks complete
- ✅ Schema, models, and endpoints done
- ⏳ Next: input validation
- 🚫 No blockers
```

## Examples

**Bad — Skipping Around:**
> Plan says: Schema → Models → API → Validation → Tests
> Agent: *Starts with Tests because "it's TDD"*

**Good — Following the Plan:**
> Agent: "Plan loaded. 5 tasks, starting with Step 1: Set up database schema.
> Dependencies: none. Executing..."
> [completes task, verifies, commits]
> Agent: "Step 1 complete. Moving to Step 2: Create data models."

**Bad — Improvising:**
> Agent: "While implementing the API endpoints, I noticed we should also add
> rate limiting, caching, and a webhook system. I'll add those too."

**Good — Staying on Plan:**
> Agent: "While implementing the API endpoints, I noticed rate limiting might
> be useful. Logging this as a future consideration. Staying on the current plan."

## Guidelines

- One task at a time — complete, verify, commit, then move to the next
- Never skip tasks or change execution order without re-planning
- Never add scope beyond what's in the plan — log ideas for future consideration
- When a task takes significantly longer than expected, pause and check the plan
- Use subagents for parallelizable work, direct execution for sequential work

## Anti-Patterns

- **Working outside the plan** — If it's not in `tasks/todo.md`, it doesn't get done this session
- **Skipping verification** — A completed task without proof is an unverified task
- **Batching everything** — Don't do 5 tasks then verify once. Verify after each.
- **Silent blockers** — If you're stuck, log it. Don't silently work around it.
- **Scope creep** — "While I'm here, I might as well..." — No. Log it. Stay on plan.
