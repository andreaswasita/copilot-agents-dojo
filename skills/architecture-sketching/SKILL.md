---
name: architecture-sketching
description: Defines types and boundaries before implementation.
tier: practical
category: workflow
created_by: human
platforms: [windows, macos, linux]
tags: [architecture, design, types, interfaces, boundaries]
author: Andreas Wasita (@andreaswasita)
---

# Architecture Sketching Skill

Defines the data shapes, public signatures, module ownership, alternatives, and invalidation conditions for a cross-boundary change before implementation begins. It produces a small design contract that implementation can test and revise. It does NOT require architecture ceremony for a local change with an obvious existing pattern.

This workflow adapts architecture-exploration ideas from Lauren Tan's pstack project, licensed under MIT, to the dojo's verification and traceability model.

## When to Use

- A change crosses a function, module, service, process, or persistence boundary.
- A new API, event, command, schema, or shared type is being introduced.
- Several credible designs exist and choosing one would be expensive to reverse.
- Implementation keeps adding casts, optional fields, locks, wrappers, or special cases.
- The user asks to architect, design, model, or decide where behavior belongs.
- NOT for a one-file change that follows a clear local pattern without changing a contract.

## Prerequisites

- An approved problem statement or requirements package.
- A grounded view of affected code from `view`, `grep`, `glob`, or `codebase-onboarding`.
- `plan-before-code` active for multi-step work.
- `subagent-strategy` available when competitive design exploration is justified.
- A writable design location chosen by repository convention.

## How to Run

```text
1. Ground the current flow, constraints, and ownership.
2. Name the data shapes and illegal states.
3. Sketch public signatures and module boundaries with no implementation.
4. Compare credible alternatives and select one with a written rationale.
5. Define verification and explicit signals that would invalidate the sketch.
6. Implement against the sketch; redesign when repeated friction disproves it.
```

## Quick Reference

| Artifact | Required content |
|---|---|
| Problem frame | Goal, scope, constraints, and success predicate |
| Data shapes | Inputs, outputs, state, identity, ownership, invalid states |
| Contract sketch | Public types, signatures, commands, events, or endpoints |
| Module map | Which component owns each decision and dependency direction |
| Alternatives | Two or three credible shapes, or why only one is viable |
| Selection rationale | Tradeoff that decided the shape and what was rejected |
| Verification plan | Static checks plus real-artifact behavior |
| Invalidation signals | Evidence that requires redesign instead of another patch |

Keep the sketch proportional. A small change may need one page. A cross-service design may need linked diagrams or an ADR.

## Procedure

### Step 1: Ground the Existing System

Trace the affected path from trigger to result. Identify:

- The boundary where external or untrusted data enters.
- The current owner of validation, state, policy, and side effects.
- Contracts that existing callers depend on.
- Concurrency, retry, compatibility, and failure constraints.

Reference concrete files, symbols, requirements, or runtime evidence. Do not infer ownership from directory names alone.

If the request provides no repository or product context, keep the sketch provider-neutral and label assumptions explicitly. Do not borrow names, files, technologies, or business rules from an unrelated workspace merely because they are visible.

### Step 2: Name the Data Shapes

Write the core shapes before functions:

- Inputs and outputs.
- Stable identifiers.
- Valid states and state transitions.
- Errors that callers must handle.
- Data that is external, validated, internal, persisted, or emitted.

Prefer shapes that make invalid states unrepresentable. Validate at system boundaries, then let internal code trust the validated type.

### Step 3: Sketch Contracts Without Bodies

Define only the public contract:

- Type or schema names.
- Function signatures.
- API endpoints, commands, or events.
- Dependency direction.
- Module or service ownership.

Use pseudocode or explicit placeholders where a body would distract from the shape. The sketch should let another engineer explain how data and control move without reading an implementation.

### Step 4: Explore Alternatives

When the choice is consequential and precedent is weak, use the competition mode in `subagent-strategy`. Ask isolated candidates for whole-design alternatives, not small variations inside one design.

Compare candidates using criteria tied to the task:

- Correctness and illegal-state prevention.
- Reader load and number of layers.
- Boundary clarity.
- Retry and idempotency behavior.
- Migration and deletion path.
- Ease of verification on the real artifact.

Skip competitive exploration when repository conventions or platform constraints dictate the shape. Record that reason.

### Step 5: Select and Record the Contract

Choose one coherent design. Record:

1. The selected data and module shape.
2. The deciding tradeoff.
3. Rejected alternatives and why they lost.
4. Consequences and migration steps.
5. Verification commands and runtime checks.

Use an ADR when the decision affects multiple teams, services, or future extension points. Link requirements to the chosen contract when traceability applies.

### Step 6: Define Invalidation Signals

Before implementation, list evidence that would disprove the sketch:

- Two or more unrelated callers need the same new escape hatch.
- Internal code repeatedly needs casts or partially valid objects.
- Callers must understand hidden implementation rules.
- Multiple edge cases require the same special-case branch.
- Shared state or locking appears where the sketch assumed isolation.
- The public contract changes repeatedly during implementation.

One awkward case may be local complexity. A repeated pattern means the architecture is wrong.

### Step 7: Implement Against the Sketch

Treat deviations as evidence. Record them instead of silently extending the contract. If the invalidation signals fire:

1. Stop adding patches.
2. Re-ground with the new evidence.
3. Remove accidental complexity.
4. Revise or replace the sketch.
5. Re-run verification against the updated contract.

The sketch is a hypothesis, not a promise. Preserving a disproven design is not consistency.

## Pitfalls

- **DO NOT** start with classes or services before naming the data they exchange.
- **DO NOT** invent project-specific context. Cite the repository evidence or keep the design generic.
- **DO NOT** call a file list an architecture. Show ownership and dependency direction.
- **DO NOT** create wrappers, factories, or extension points without a current requirement.
- **DO NOT** preserve legacy APIs indefinitely. Plan caller migration and deletion together.
- **DO NOT** serialize shared writes before asking whether the state can be separated.
- **DO NOT** average incompatible candidate designs into one incoherent result.
- **DO NOT** hide implementation deviations. Repeated deviations are redesign evidence.
- **DO NOT** block a reversible design on human approval unless the user requested a checkpoint.

## Verification

- [ ] The sketch names inputs, outputs, states, identifiers, and errors.
- [ ] Every project-specific claim has evidence; otherwise assumptions are explicit and generic.
- [ ] Public signatures and module ownership are explicit.
- [ ] Alternatives were compared, or the reason to skip was recorded.
- [ ] Rejected options and the deciding tradeoff are documented.
- [ ] Static and real-artifact verification are defined.
- [ ] Invalidation signals are concrete and observable.
- [ ] Implementation deviations are recorded and reviewed before sign-off.
