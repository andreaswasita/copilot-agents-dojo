---
name: dispatching-parallel-agents
description: >-
  Runs multiple sub-agents concurrently when a task has independent parts that
  benefit from parallel execution. Use this skill when a complex task has clearly
  independent subtasks, when multiple investigations or implementations can run
  simultaneously, when the user says "do these in parallel" or "speed this up,"
  or when the plan contains tasks with no dependencies between them.
---

# Dispatching Parallel Agents

Throw more compute at the problem. When subtasks are independent, run them concurrently.

## When to Use

- A task has clearly independent subtasks with no shared state
- Multiple research investigations can run simultaneously
- Multiple test suites or verifications can run in parallel
- The implementation plan shows independent phases
- User explicitly asks for parallel execution

## When NOT to Use

- Tasks have dependencies (B needs A's output)
- Shared mutable state would cause conflicts (same files being edited)
- The task is simple enough for one agent to handle in minutes
- Debugging — parallel agents can mask timing-dependent bugs

## How to Use

### Step 1: Identify Independent Subtasks

From the plan in `tasks/todo.md`, identify tasks that:
- Don't read from each other's output
- Don't modify the same files
- Can be verified independently

```markdown
## Parallelizable:
- [ ] Task A: Add user API endpoints (src/api/users/)
- [ ] Task B: Add product API endpoints (src/api/products/)
- [ ] Task C: Write migration scripts (src/db/migrations/)

## Sequential (depends on A+B+C):
- [ ] Task D: Integration tests for all endpoints
```

### Step 2: Create Clear Specs per Agent

Each sub-agent needs a self-contained specification:

```markdown
### Agent 1 Spec: User API Endpoints
**Goal:** Implement CRUD endpoints for users
**Files to modify:** src/api/users/ (create new), src/routes/index.ts (add route)
**DO NOT touch:** src/api/products/, src/db/
**Tests:** Write unit tests in src/api/users/__tests__/
**Verification:** All new tests pass, existing tests unaffected
```

### Step 3: Dispatch and Monitor

Launch sub-agents with clear boundaries:

1. **Spawn** one agent per independent task with its spec
2. **Set boundaries** — which files/modules each agent owns
3. **Monitor** — check for completion or blockers
4. **Collect results** — gather output from each agent

### Step 4: Integrate Results

After all parallel agents complete:

1. **Merge outputs** — Combine code changes from each agent
2. **Resolve any conflicts** — If agents touched shared configuration files
3. **Run integration verification** — Full test suite on the combined result
4. **Use `verification-before-completion` checklist** on the merged output

### Step 5: Handle Failures

If one parallel agent fails:
- **Don't block the others** — Let successful agents complete
- **Diagnose the failure** — Was the spec unclear? Were there hidden dependencies?
- **Re-dispatch** the failed task with a revised spec
- **Log the failure** in `tasks/lessons.md`

## Examples

**Bad — Serial When Parallel is Better:**
> 3 independent API modules, each taking 15 minutes.
> Agent does them one by one: 45 minutes total.

**Good — Parallel Dispatch:**
> Agent: "The plan has 3 independent API modules. Dispatching parallel agents:
> - Agent 1: User endpoints (src/api/users/)
> - Agent 2: Product endpoints (src/api/products/)
> - Agent 3: Order endpoints (src/api/orders/)
>
> Each has non-overlapping file boundaries. Collecting results..."
> Total time: ~15 minutes.

**Bad — Parallel When Serial is Needed:**
> Task B reads Task A's output. Agent runs them in parallel.
> Task B fails because Task A's output doesn't exist yet.

## Guidelines

- Parallel agents should have non-overlapping file boundaries
- Every agent gets a self-contained spec — no agent should need to ask "what do I do?"
- Always run integration verification after combining parallel results
- Better to over-specify boundaries than to deal with merge conflicts
- Log which tasks ran in parallel for the retrospective

## Anti-Patterns

- **Parallelizing dependent tasks** — If B needs A, they must be sequential
- **Vague agent specs** — "Handle the user stuff" produces garbage
- **Skipping integration verification** — Each agent passed alone ≠ combined passes
- **Too many parallel agents** — 3–5 is manageable; 20 is chaos
- **Ignoring partial failures** — One agent failing might invalidate another's work
