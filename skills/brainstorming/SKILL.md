---
name: brainstorming
description: >-
  Activates before any code is written to refine rough ideas through Socratic
  questioning, explore alternatives, and produce an approved design document.
  Use this skill when the user describes a new feature, when requirements are
  unclear or ambiguous, when an architectural decision needs to be made, when
  the user says "I want to build," "let's make," or "new feature," or when
  re-designing after a failed approach.
---

# Brainstorming

Refine rough ideas into clear designs through Socratic questioning. No code until the design is approved.

## When to Use

- User describes a new feature or project
- Requirements are unclear or ambiguous
- Architectural decisions need to be made
- Re-designing after a failed or rejected approach
- User says "I want to build...", "let's make...", or "new feature"
- Any non-trivial work where jumping straight to code would be premature

## How to Use

### Step 1: Ask Socratic Questions

Don't assume you understand the full picture. Draw out the real requirements:

1. **What problem are we solving?** — Not what to build, but *why*
2. **Who is this for?** — User persona, scale, constraints
3. **What does success look like?** — Measurable outcomes, not vague goals
4. **What are the constraints?** — Time, tech stack, existing systems, team size
5. **What have you already tried?** — Don't re-invent failed approaches

Ask 3–5 focused questions. Don't interrogate — guide the conversation toward clarity.

### Step 2: Explore Alternatives

Before committing to an approach:
- Present 2–3 viable approaches with tradeoffs
- Highlight which approach you'd recommend and why
- Note what each approach sacrifices (complexity, performance, flexibility)

```markdown
## Approaches

### Option A: [Name]
- **Pros:** Simple, fast to implement
- **Cons:** Doesn't scale past X users
- **Effort:** ~2 hours

### Option B: [Name]
- **Pros:** Scales well, maintainable
- **Cons:** More complex upfront
- **Effort:** ~4 hours

**Recommendation:** Option B — the extra upfront work pays off because [specific reason].
```

### Step 3: Present Design in Chunks

Don't dump a 500-line design document. Present in digestible sections:

1. **Overview** — One paragraph, what we're building and why
2. **Architecture** — How the pieces fit together
3. **Data model** — What data flows where
4. **API / Interface** — How the outside world interacts
5. **Edge cases** — What could go wrong

Wait for approval on each section before moving to the next.

### Step 4: Save the Approved Design

Once the user explicitly approves:

```markdown
## Approved Design: [Feature Name]
Date: [date]
Status: Approved

### Problem
[What we're solving]

### Solution
[What we're building]

### Architecture
[How it fits together]

### Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
```

Save to `docs/design.md` or `tasks/todo.md` depending on the project convention.

### Step 5: Get Explicit Approval

**Never proceed to planning or code without the user saying "approved," "go ahead," "looks good," or equivalent explicit consent.**

If the user says "maybe" or "I'm not sure" — that's not approval. Ask what's bothering them.

## Examples

**Bad — Skipping Design:**
> User: "I want to add notifications to the app"
> Agent: *immediately starts writing a NotificationService class*

**Good — Brainstorming First:**
> User: "I want to add notifications to the app"
> Agent: "Before we build, let me understand the scope:
> 1. What types of notifications? (email, push, in-app, all three?)
> 2. What triggers them? (user actions, system events, scheduled?)
> 3. Do users need to configure preferences (opt-in/out)?
> 4. What's the expected volume? (10/day vs 10,000/day changes the architecture)
> 5. Any existing notification infrastructure we should integrate with?"

**Bad — Design Dump:**
> Agent: *sends a 300-line design document in one message*

**Good — Chunked Presentation:**
> Agent: "Here's the overview: We'll add an in-app notification system with push support.
> Three components: a notification service, a preference store, and a delivery layer.
> Does this direction make sense before I detail the architecture?"

## Guidelines

- Ask questions to clarify, not to stall — 3–5 questions max per round
- Present alternatives with honest tradeoffs, not just the one you prefer
- Keep design chunks short enough to actually read (5–10 lines each)
- Save the approved design — it becomes the source of truth for planning
- Never plan or code without an approved design document

## Anti-Patterns

- **"I'll figure out the design as I code"** — This produces spaghetti, not architecture
- **Asking too many questions** — 15 questions feels like an interrogation, not a conversation
- **One-sided design** — Presenting only one approach without alternatives
- **Proceeding without approval** — "I assumed you'd be fine with this" is not consent
- **Design documents nobody reads** — If it's longer than 2 pages, it's a novel, not a design
