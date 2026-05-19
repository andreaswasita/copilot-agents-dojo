---
name: requirements-elicitation
description: Turns vague intent into testable, gated requirements.
tier: practical
category: workflow
created_by: human
platforms: [windows, macos, linux]
tags: [requirements, product, stories]
author: Andreas Wasita (@andreaswasita)
---

# Requirements Elicitation Skill

Drives a vague request through DISCOVER → INTERROGATE → STRUCTURE → VALIDATE → GATE until the result is a testable, traceable, unambiguous set of user stories with Given/When/Then acceptance criteria. Does NOT produce design or implementation — that is the next skill in the chain.

## When to Use

- Starting a new feature, epic, or initiative.
- Requirements feel vague, conflicting, or scope-creeping.
- Someone asks "what does done look like?"
- Stakeholders change their mind mid-sprint.
- Writing PRDs, feature briefs, or story backlogs.
- Both TPM (business elicitation) and Architect (system specification) stages.

## Prerequisites

- The `ask_user` tool to drive the Socratic loop.
- The `edit` tool to write the brief and stories.
- A target file (typically `docs/requirements.md` or `tasks/todo.md`).
- Access to the stakeholder for sign-off (not just one-way capture).

## How to Run

```text
1. DISCOVER — surface the real problem, not the proposed solution.
2. INTERROGATE — Socratic questions on scope, edges, success, failure.
3. STRUCTURE — user stories + Given/When/Then ACs + NFR thresholds.
4. VALIDATE — read back, get written sign-off.
5. GATE — Definition of Ready checklist. Any fail → back to INTERROGATE.
```

## Quick Reference

| Stage | Output |
|---|---|
| DISCOVER | Problem statement, primary user, business driver |
| INTERROGATE | Scope, edges, success, failure, dependencies, constraints |
| STRUCTURE | User stories, ≥3 Given/When/Then ACs, NFRs with numbers |
| VALIDATE | Read-back, written sign-off, open questions logged |
| GATE | DoR checklist — all green or back to INTERROGATE |

| Mandatory format | Template |
|---|---|
| User story | `As a <role>, I want to <action>, so that <outcome>.` |
| Acceptance criterion | `Given <precondition>, when <action>, then <result>.` |

## Procedure

### Step 1: DISCOVER

Ask what problem is being solved, who has it, and what happens if it goes unsolved. Trace any "we need a button that does X" back to the why. Never accept the proposed solution at face value.

### Step 2: INTERROGATE

Use `ask_user` for focused Socratic questions:

- Scope: what is explicitly NOT included?
- Edges: what happens when <exception scenario>?
- Success: how do we measure that this worked?
- Failure: what does failure look like? Who notices?
- Dependencies: what must exist before this can work?
- Constraints: time, budget, compliance, technical?

### Step 3: STRUCTURE

Write user stories and acceptance criteria. Minimum 3 ACs per story. NFRs use numeric thresholds, never adjectives.

**Feature Brief:**

```markdown
## Feature: <Name>
**Business Objective:** <measurable outcome>
**Primary User:** <specific role>
**Problem Statement:** <what breaks without this>
**In Scope:** <explicit list>
**Out of Scope:** <explicit list>
**Success Metric:** <threshold + measurement method>
**Target Date:** <commitment>
```

**Story Card:**

```markdown
## Story: <ID> <Title>
**As a** <role>, **I want to** <action>, **so that** <outcome>.

**Acceptance Criteria:**
- Given <X>, when <Y>, then <Z>.
- Given <X>, when <Y>, then <Z>.
- Given <X>, when <Y>, then <Z>.

**Edge Cases:** <list>
**Out of Scope:** <list>
**Dependencies:** <list>
**Definition of Done:** <list>
```

### Step 4: VALIDATE

Read each AC back in plain language. Get explicit written sign-off — not verbal, not implied. Log open questions with owners and due dates.

### Step 5: GATE — Definition of Ready

Every story must pass all gates before handoff:

- [ ] Business objective stated and measurable.
- [ ] User role is specific (not "the user" or "admin").
- [ ] ≥3 Given/When/Then ACs, each independently testable.
- [ ] ≥2 edge cases documented.
- [ ] Out-of-scope explicitly listed.
- [ ] Ambiguous words eliminated ("fast" → threshold, "easy" → step count).
- [ ] NFRs have numeric thresholds.
- [ ] Assumptions recorded with owners and expiry dates.
- [ ] Dependencies identified.
- [ ] Written stakeholder sign-off obtained.

**Any gate fails → back to INTERROGATE. Do not proceed.**

## Pitfalls

- **DO NOT** transcribe stakeholder monologues and call it requirements.
- **DO NOT** let "fast" or "user-friendly" survive into engineering without a numeric threshold.
- **DO NOT** accept "we'll figure out the edge cases in dev".
- **DO NOT** skip sign-off because "everyone was in the room".
- **DO NOT** write 40 stories before validating the first 5.
- **DO NOT** treat scope as flexible once sprint planning begins.

## Verification

- [ ] Feature brief exists and is filled in.
- [ ] Every story has ≥3 Given/When/Then ACs.
- [ ] Every NFR has a numeric threshold.
- [ ] Edge cases (≥2 per story) are documented.
- [ ] Written sign-off is captured.
- [ ] Definition of Ready checklist passes for every story.
