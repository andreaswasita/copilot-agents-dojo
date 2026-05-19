---
name: brainstorming
description: Refines rough ideas into approved designs before code.
tier: practical
category: workflow
created_by: human
platforms: [windows, macos, linux]
tags: [design, socratic, discovery]
author: Andreas Wasita (@andreaswasita)
---

# Brainstorming Skill

Turns a vague request into an approved design through focused Socratic questioning and tradeoff-honest alternatives. Does NOT permit any code to be written until the user has explicitly approved the design.

## When to Use

- User describes a new feature or project.
- Requirements are unclear, conflicting, or ambiguous.
- An architectural decision needs to be made.
- Re-designing after a failed or rejected approach.
- User says "I want to build…", "let's make…", or "new feature".
- NOT when the user explicitly asks to skip design and prototype.

## Prerequisites

- The `edit` tool to save the approved design.
- The `ask_user` tool to gather clarifications without spamming prose.
- A target file for the design (typically `tasks/todo.md` or `docs/design.md`).
- The user is actually available to respond — no design loops with a phantom user.

## How to Run

```text
1. Ask 3–5 Socratic questions to surface the real problem.
2. Present 2–3 alternative approaches with honest tradeoffs.
3. Recommend ONE with reasoning.
4. Walk the design in chunks: overview → architecture → data → API → edges.
5. Get explicit approval ("approved", "go", "ship it") before saving.
6. Save the approved design. Hand off to `executing-plans`.
```

## Quick Reference

| Question shape | Why it matters |
|---|---|
| What problem are we solving? | Forces the "why", not just the "what" |
| Who is this for? | Persona, scale, constraints |
| What does success look like? | Measurable outcome, not vibes |
| What are the constraints? | Time, stack, existing systems, team |
| What have you already tried? | Avoid re-inventing failed approaches |

| Design chunk | Length |
|---|---|
| Overview | 1 paragraph |
| Architecture | 5–10 lines + diagram if useful |
| Data model | Table or list |
| API / interface | Endpoint or function signatures |
| Edge cases | Bullet list |

## Procedure

### Step 1: Socratic Questions (3–5 max)

Use the `ask_user` tool. Ask focused questions one at a time. Stop at five. More than five feels like interrogation.

### Step 2: Present Alternatives

```markdown
## Approaches

### Option A: <name>
- Pros: <…>
- Cons: <…>
- Effort: <rough estimate>

### Option B: <name>
- Pros: <…>
- Cons: <…>
- Effort: <rough estimate>

**Recommendation:** Option B — <specific reason>.
```

Be honest about tradeoffs. A fake "Option A" you do not believe in undermines trust.

### Step 3: Walk the Design in Chunks

Present overview → architecture → data → API → edges. Pause for feedback after each chunk. Do not dump a 500-line document in one message.

### Step 4: Get Explicit Approval

"Maybe" is not approval. "I'm not sure" is not approval. Ask what is bothering them and iterate. Only proceed when the user says "approved", "go ahead", "ship it", or equivalent.

### Step 5: Save the Approved Design

Use `edit` to write to `docs/design.md` or `tasks/todo.md`:

```markdown
## Approved Design: <feature>
Date: <YYYY-MM-DD>
Status: Approved

### Problem
<what we're solving>

### Solution
<what we're building>

### Architecture
<how it fits together>

### Acceptance Criteria
- [ ] <criterion 1>
- [ ] <criterion 2>
```

Hand off to the `plan-before-code` or `executing-plans` skill.

## Pitfalls

- **DO NOT** start writing code while the design is still under discussion.
- **DO NOT** interrogate the user — five questions per round, maximum.
- **DO NOT** present a single "approach" with no alternatives. That is a decree, not a design discussion.
- **DO NOT** dump a 300-line design in one message. Chunk it.
- **DO NOT** treat "maybe" as consent. Get the word "approved".

## Verification

- [ ] At least 3 Socratic questions were asked and answered.
- [ ] At least 2 alternatives were presented with honest tradeoffs.
- [ ] Design was walked in chunks with user feedback between them.
- [ ] Explicit approval ("approved" / "go ahead") is captured.
- [ ] Approved design is saved to `docs/design.md` or `tasks/todo.md`.
