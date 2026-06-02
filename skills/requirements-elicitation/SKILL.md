---
name: requirements-elicitation
description: Turns vague intent into testable requirements.
tier: practical
category: requirements
created_by: human
platforms: [windows, macos, linux]
tags: [requirements, user-stories, acceptance-criteria, definition-of-ready, togaf]
author: Andreas Wasita (@andreaswasita)
---

# Requirements Elicitation

Turns vague intent into precise, testable, engineer-ready requirements. This is a technique skill — not a role. Both the TPM and Architect invoke it at different stages of the requirements pipeline.

> **Requirements are delivery contracts, not meeting minutes.**
> Every requirement must be testable, traceable, and unambiguous before it reaches engineering.

## When to Use

- Starting a new feature, epic, or initiative
- Requirements feel vague, conflicting, or scope-creeping
- Someone asks "what does done look like?"
- Stakeholders keep changing their minds mid-sprint
- Writing PRDs, feature briefs, or story backlogs
- Assessing system impact of incoming requirements (Architect stage)
- Translating user stories into system specifications (Architect stage)

## Prerequisites

- The `ask_user` Copilot tool to gather clarifications without spamming prose.
- The `edit` Copilot tool to write the resulting brief / story cards.
- A target file for the artefacts (typically `requirements/<engagement>/stories.md` or `docs/feature-brief.md`).
- Access to the primary stakeholder — no requirements loop with a phantom user.
- For the Architect stage: read access to the TPM-produced brief.

## How to Run

```text
1. DISCOVER   — Ask 3–5 problem-framing questions; never accept solutions-disguised-as-requirements.
2. INTERROGATE — Drive Socratic questions across scope, edges, success, failure, dependencies, constraints.
3. STRUCTURE  — Write user stories + Given/When/Then acceptance criteria + assumptions + out-of-scope.
4. VALIDATE   — Read each AC back in plain language and capture written sign-off.
5. GATE       — Walk the Definition of Ready checklist. If anything fails, return to step 2.
6. HAND OFF   — TPM passes to Architect; Architect may return stories that are not technically achievable.
```

## Quick Reference

| Artefact | Mandatory format |
|---|---|
| User story | `As a [specific role], I want to [action], so that [measurable outcome].` |
| Acceptance criterion | `Given [precondition], When [action], Then [expected result].` (≥ 3 per story) |
| Non-functional requirement | Numeric threshold + measurement method (no adjectives) |
| Assumption | Statement + owner + expiry date |
| Out of scope | Explicit boundary list (never implied) |

| Pipeline stage | Owner | Outputs |
|---|---|---|
| Business elicitation | TPM | Feature brief + story cards + sign-off log |
| System specification | Architect | Impact assessment + feasibility note + revised ACs |

## Procedure

### Step 1: DISCOVER — Understand the problem, not the solution

- Ask: *What problem are we solving? Who has it? What happens if we don't solve it?*
- Identify the primary stakeholder, affected users, and business driver.
- Never accept "we need a button that does X" — trace back to the why.

### Step 2: INTERROGATE — Socratic elicitation

Use structured questions to surface hidden requirements:

- **Scope**: What is explicitly NOT included?
- **Edge cases**: What happens when [exception scenario]?
- **Success**: How do we measure that this worked?
- **Failure**: What does failure look like? Who notices?
- **Dependencies**: What must exist before this can work?
- **Constraints**: Time, budget, compliance, technical?

### Step 3: STRUCTURE — Write requirements in standard form

**User Story format** (mandatory):

```
As a [specific user role],
I want to [action],
So that [measurable outcome].
```

**Acceptance Criteria format** (mandatory, minimum 3 per story):

```
Given [precondition],
When [action],
Then [expected result].
```

**Additional artefacts:**

- **Functional Requirements** — numbered, atomic, testable
- **Non-Functional Requirements** — performance, security, accessibility thresholds (numeric, not adjectives)
- **Assumptions** — explicit, dated, owner-assigned
- **Out of Scope** — written as a boundary list, not implied

### Step 4: VALIDATE — Confirm before proceeding

- Read back each acceptance criterion in plain language.
- Get explicit sign-off (written, not verbal).
- Log open questions with owners and due dates.

### Step 5: GATE — Definition of Ready checklist

See **Verification** below. If any gate fails → return to INTERROGATE. Do not proceed.

### Output Templates

**Feature Brief (one-pager):**

```markdown
## Feature: [Name]
**Business Objective:** [Measurable outcome]
**Primary User:** [Specific role]
**Problem Statement:** [What breaks without this?]
**In Scope:** [Explicit list]
**Out of Scope:** [Explicit list]
**Success Metric:** [Threshold + measurement method]
**Target Sprint / Date:** [Committed delivery window]
```

**Story Card:**

```markdown
## Story: [ID] [Title]
**As a** [role], **I want to** [action], **so that** [outcome].

**Acceptance Criteria:**
- Given [X], when [Y], then [Z].
- Given [X], when [Y], then [Z].
- Given [X], when [Y], then [Z].

**Edge Cases:** [List]
**Out of Scope:** [List]
**Dependencies:** [List]
**Definition of Done:** [List]
```

### Two-Agent Contract

This skill is invoked at two stages of the requirements pipeline:

| Stage | Agent | Purpose |
|-------|-------|---------|
| Business elicitation | **TPM** | DISCOVER → INTERROGATE → STRUCTURE → VALIDATE → GATE. Produces the handoff package. |
| System specification | **Architect** | Receives the handoff, runs impact assessment, feasibility check, and specification. Can **return stories to TPM** if ACs aren't technically achievable. |

The bidirectional gate between TPM and Architect is what prevents bad requirements from silently becoming bad code.

### Worked Examples

**Bad story** (fails gate):

> As a user, I want the page to load fast so it's a good experience.

Problems: "user" is unspecific, "fast" is unmeasurable, "good experience" is subjective.

**Good story** (passes gate):

> As a retail customer on mobile, I want the product listing page to render within 2 seconds on 3G, so that I can browse without abandoning the session.

- Given I am on a 3G connection, when I open the product listing, then the first meaningful paint occurs within 2 seconds.
- Given the listing has 500+ products, when I scroll past the first page, then the next batch loads within 1 second via infinite scroll.
- Given the API returns an error, when I open the product listing, then I see a retry prompt within 500ms — not a blank page.

## Pitfalls

- Transcribing stakeholder monologues and calling it requirements.
- Writing "the system shall…" without specifying who, what, and when.
- Accepting "we'll figure out the edge cases in dev."
- Letting "fast" or "user-friendly" survive into engineering without a threshold.
- Skipping sign-off because "everyone was in the room."
- Writing 40 stories before validating the first 5.
- Treating scope as flexible once sprint planning begins.
- Letting the Architect silently absorb feasibility risk instead of returning stories to the TPM.

## Verification

Requirements MUST pass all gates before handoff:

- [ ] Business objective is stated and measurable.
- [ ] User role is specific (not "the user" or "admin").
- [ ] Minimum 3 Given/When/Then acceptance criteria, each independently testable.
- [ ] Edge cases documented (minimum 2 per story).
- [ ] Out-of-scope explicitly listed — not implied.
- [ ] All ambiguous language eliminated ("fast" → threshold, "easy" → step count, "intuitive" → measurable heuristic).
- [ ] Non-functional requirements have numeric thresholds.
- [ ] Assumptions recorded with owners and expiry dates.
- [ ] Dependencies identified.
- [ ] Written stakeholder sign-off obtained.
- [ ] Architect impact assessment captured (or stories returned to TPM with reason).
