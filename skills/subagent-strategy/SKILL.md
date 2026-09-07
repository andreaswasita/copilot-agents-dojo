---
name: subagent-strategy
description: Delegates research and parallel work to sub-agents.
tier: core
category: delegation
created_by: human
platforms: [windows, macos, linux]
tags: [delegation, parallel, context-management]
author: Andreas Wasita (@andreaswasita)
---

# Subagent Strategy Skill

Delegates focused work to Copilot sub-agents via the `task` tool so the parent context stays clean. Supports decomposition, where agents own different workstreams, and competition, where isolated agents attempt the same high-risk artifact before a judge and lead select the result. Does NOT apply when the work must outlive the current turn — use the durable board (`skills/durable-work`) for that, since sub-agents are cancelled if the parent is interrupted.

## When to Use

- Research across docs, APIs, or unfamiliar code (research role).
- Log / stack-trace / performance-profile analysis (analysis role).
- Parallel investigation when the answer lives in multiple places.
- A one-way-door design or ambiguous artifact benefits from independent competing attempts.
- The main context is filling with exploratory output (>~20 file reads).
- Multiple independent questions to resolve.
- NOT for: reading one file, single `grep`, work that must survive the turn.

## Prerequisites

- Access to the `task` tool (Copilot built-in).
- A clear, written mission for each sub-agent — vague delegation produces vague output.
- Awareness of the configured knobs in `.dojo/delegation.yaml` (defaults: `max_spawn_depth: 2`, `max_concurrent_children: 3`, `default_mode: background`, `sync_timeout_seconds: 180`, `max_mission_tokens: 1500`).

## How to Run

```text
1. Choose decomposition or competition mode.
2. Define one mission, scope, deliverable, and success rubric.
3. Give every sub-agent an isolated, non-overlapping target.
4. Invoke the `task` tool with mode=background for independent work,
   mode=sync only when you must block on the result.
5. Inspect evidence and artifacts; synthesize rather than forwarding summaries.
```

## Quick Reference

| Role | Mission shape | Tool & mode |
|---|---|---|
| Research | "Find X across the codebase; report file:line citations." | `task` (background) |
| Analysis | "Diagnose this stack trace; report root cause and 3 candidate fixes." | `task` (background) |
| Refactor scout | "Identify code smells in `path/`; propose alternatives." | `task` (background) |
| Test scout | "List untested branches in `module/`." | `task` (background) |
| Self-review | "Audit my diff against `tasks/todo.md`; flag gaps." | `task` (sync) |

| Mode | Use when | Ownership |
|---|---|---|
| Decomposition | Work separates into independent files, layers, or questions. | One distinct workstream per sub-agent. |
| Competition | A high-cost decision has several credible shapes and weak precedent. | Same task and rubric, isolated outputs, independent judge. |

Competition defaults to two or three candidates. More candidates require a reason because model diversity costs time and context.

## Procedure

### Step 1: Choose the Mode

Use decomposition for ordinary parallel work. Use competition only when choosing one implementation too early would lock in the wrong architecture, interface, or artifact.

Competition requires:

1. The same task statement for every candidate.
2. A private rubric with three to six concrete criteria.
3. A separate output path or worktree for every candidate.
4. A judge that sees sanitized candidate labels, not model identities.
5. Lead review of every candidate before selecting or combining work.

### Step 2: One Mission Per Sub-Agent

Each sub-agent gets exactly one focused mission. Bundling unrelated questions blurs the output. Spawn a second sub-agent instead.

### Step 3: Bound the Scope

Tell the sub-agent which paths, files, or symbols to focus on. Unbounded sub-agents wander.

For competition, give candidates isolated targets. Shared writes destroy independence and can corrupt both outputs.

### Step 4: Specify the Deliverable and Rubric

Be explicit: "Return a bullet list of file:line citations" beats "look into this." If you want code, say so. If you want a recommendation with tradeoffs, say so.

For competition, define success before launching. Keep the rubric from candidates when it would cue them to game the evaluation; give it to the judge.

### Step 5: Launch, Don't Babysit

Use `mode: background` for independent sub-agents and continue planning in the foreground. Use `mode: sync` only when the next step genuinely depends on the result.

### Step 6: Inspect, Then Integrate

Do not repeat the sub-agent's whole search. Spot-check the cited evidence, inspect produced artifacts, and verify claims that drive a decision. A sub-agent summary is input, not ground truth.

For competition:

1. Read every candidate end to end.
2. Have the judge score each sanitized candidate against the same rubric.
3. Select the most maintainable base, not the most elaborate artifact.
4. Integrate only compatible strengths from other candidates.
5. Record rejected alternatives and why they lost.

### Step 7: Resolve Conflicts

If two sub-agents disagree, re-issue with sharper scope or pick the one with stronger citations. Never silently choose — log discrepancies in `tasks/lessons.md`.

### Step 8: Respect the Configured Knobs

All limits live in `.dojo/delegation.yaml` (read at session start). The agent MUST respect:

- `max_spawn_depth` (default 2) — orchestrators that spawn orchestrators that spawn orchestrators kill context windows.
- `max_concurrent_children` (default 3) — past 3 in flight, the parent can't track results.
- `max_mission_tokens` (default 1500) — missions longer than this are almost always under-scoped; break them up.
- `sync_timeout_seconds` (default 180) — if a sync child hasn't returned by this point, switch to background polling.
- `conflict_resolution` (default `escalate`) — when sub-agents disagree, log to `tasks/lessons.md` with `error_type: delegation-conflict` and proceed with the higher-citation answer.
- `escalate_to_board_if` — if any trigger fires, this is not sub-agent work; use `skills/durable-work`.

To override per-project, edit `.dojo/delegation.yaml`. To override per-call, pass the corresponding argument to the `task` tool — and log the exception in `tasks/lessons.md`.

## Pitfalls

- **DO NOT** delegate work that must outlive this turn. Sub-agents are NOT durable; if the parent is interrupted, the child is cancelled. Use `skills/durable-work` instead.
- **DO NOT** issue vague missions ("look into this"). Specify scope and deliverable.
- **DO NOT** spawn a sub-agent for one `view` or one `grep` — the overhead exceeds the benefit.
- **DO NOT** re-run searches the sub-agent already did. Trust the summary.
- **DO NOT** treat a sub-agent summary as proof. Inspect the cited evidence and produced artifact.
- **DO NOT** use competition for routine changes with an obvious local pattern.
- **DO NOT** let competing candidates write to the same path or worktree.
- **DO NOT** tell a blinded judge which model produced each candidate.
- **DO NOT** average incompatible designs. Pick a coherent base and integrate selectively.
- **DO NOT** exceed `max_concurrent_children` (see `.dojo/delegation.yaml`) without justification logged in `tasks/lessons.md`.
- **DO NOT** silently pick a winner when sub-agents conflict. Resolve per `conflict_resolution` or log.

## Verification

- [ ] Each sub-agent invocation has a single, written mission.
- [ ] Each invocation specifies the deliverable shape.
- [ ] Decision-driving evidence and produced artifacts were inspected.
- [ ] Competition, when used, had isolated outputs and a model-blind judge.
- [ ] Rejected alternatives and the selection rationale were recorded.
- [ ] No sub-agent depth >2 unless deliberately justified in `tasks/lessons.md`.
