---
name: subagent-strategy
description: >-
  Teaches agents to delegate work to subagents for parallel execution, research,
  and analysis. Use this skill when a task involves research across docs or codebases,
  when parallel analysis would speed things up, when the main context window is getting
  crowded, or when multiple independent investigations are needed. Also use when
  debugging complex issues that benefit from divide-and-conquer approaches.
---

# Subagent Strategy

A master delegates. Subagents handle research, analysis, testing, and review — keeping the main context window clean and focused.

## When to Use

- Before implementing unfamiliar features (research subagent)
- During debugging or optimization (analysis subagent)
- When exploring alternative implementations (refactor subagent)
- During verification phase (test subagent)
- Before marking a task complete (review subagent)
- Any time the main context is getting cluttered with exploratory work

## How to Use

### Principle: One Task Per Subagent

Each subagent gets exactly one focused mission. Don't overload a subagent with multiple unrelated tasks — spawn another one instead.

### Subagent Roles

| Role | Purpose | When to Deploy |
|------|---------|----------------|
| **Research Subagent** | Search docs, APIs, dependencies, or codebase patterns | Before implementing unfamiliar features |
| **Analysis Subagent** | Analyze error logs, stack traces, performance profiles | During debugging or optimization |
| **Refactor Subagent** | Explore alternative implementations, identify code smells | When "Demand Elegance" triggers |
| **Test Subagent** | Write and run test suites in parallel | During verification phase |
| **Review Subagent** | Audit changes against plan, check for regressions | Before marking task complete |

### Delegation Pattern

1. **Define the mission** — What exactly should the subagent investigate or produce?
2. **Set boundaries** — What files, APIs, or resources should it focus on?
3. **Specify the deliverable** — What should it report back? (findings, code, recommendations)
4. **Launch and await** — Spawn the subagent with clear instructions
5. **Integrate results** — Incorporate the subagent's findings into the main context

### Multi-Agent Coordination

When multiple subagents are needed:
- Launch independent investigations in parallel when possible
- Subagents report back to the main agent context
- If subagents return conflicting results, re-run with more specific instructions or resolve via majority consensus
- Never let subagent conflicts silently pass — log discrepancies in `tasks/lessons.md`

## Examples

**Research Delegation:**
```
"I need to add WebSocket support. Let me spawn a research subagent to:
1. Check what WebSocket libraries are already in our dependencies
2. Review how similar features are implemented in the codebase
3. Identify the best integration point

While that runs, I'll plan the implementation structure."
```

**Parallel Analysis:**
```
"This performance issue could be in the database layer or the API layer.
Spawning two analysis subagents:
- Subagent A: Profile the database queries in the slow endpoint
- Subagent B: Check the API middleware chain for bottlenecks

I'll compare their findings to identify the root cause."
```

## Guidelines

- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- Write clear, specific instructions — vague delegation produces vague results
- Review subagent output critically; they can make mistakes too

## Anti-Patterns

- **Doing everything in the main context** — If you're scrolling through 50 search results, you should have delegated
- **Vague subagent instructions** — "Look into this" produces garbage. Be specific.
- **Ignoring conflicts** — When two subagents disagree, investigate; don't pick randomly
- **Spawning subagents for trivial tasks** — Reading one file doesn't need a subagent
