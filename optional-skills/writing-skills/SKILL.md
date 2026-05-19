---
name: writing-skills
description: Authors new SKILL.md files that conform to the dojo spec.
tier: optional
category: meta
created_by: human
platforms: [windows, macos, linux]
tags: [meta, authoring, skill-creation]
author: Andreas Wasita (@andreaswasita)
---

# Writing Skills (meta) Skill

Walks the agent through producing a new SKILL.md that conforms to `spec/copilot-skills-spec.md` and passes `scripts/verify.sh spec`. Covers intent capture, folder layout, frontmatter, canonical body sections, and the test loop. Does NOT auto-register the new skill in `skills.md` — that is the regen script's job.

## When to Use

- The user explicitly asks to create or amend a skill.
- A `tasks/lessons.md` pattern has ≥3 occurrences and should graduate to a skill.
- The dojo curator (see `self-improvement`) flags a candidate skill to formalize.
- Team adapts the dojo for a new domain.
- NOT for one-off rules — those live in `tasks/lessons.md` until they recur.

## Prerequisites

- `spec/copilot-skills-spec.md` and `template/SKILL.md` exist (this skill is parasitic on them).
- The `view`, `edit`, and `powershell` Copilot tools.
- `scripts/verify.sh` available on the path (or git bash on Windows).
- Decision recorded for which tier the new skill belongs in.

## How to Run

```text
1. Capture intent — what, when, what good looks like, what mistakes to prevent.
2. Pick the tier (core / practical / optional) and folder destination.
3. Copy `template/SKILL.md` to `<tier-dir>/<skill-name>/SKILL.md`.
4. Fill frontmatter; ≤60-char description with period; no marketing words.
5. Walk the canonical body sections in order.
6. Run `bash scripts/verify.sh spec` until the new skill is clean.
7. Hand off to the regen script (Phase 5.1) to update `skills.md`.
```

## Quick Reference

| Tier | Folder | Loaded when |
|---|---|---|
| core | `skills/` | Always |
| practical | `skills/` | On trigger |
| optional | `optional-skills/` | Installed explicitly |

| Frontmatter key | Rule |
|---|---|
| `name` | Lowercase, hyphens, matches folder |
| `description` | ≤60 chars, ends with period, no marketing words |
| `tier` | `core` \| `practical` \| `optional` |
| `category` | See spec §1.2 valid set |
| `created_by` | `human` or `agent` |
| `platforms` | Subset of `[windows, macos, linux]` |
| `author` | `Name (@handle)`, human first |

| Body section (in order) | Purpose |
|---|---|
| When to Use | Triggers and contexts |
| Prerequisites | What must be true before running |
| How to Run | One-screen happy path |
| Quick Reference | Tables the agent can act from |
| Procedure | Deep step-by-step |
| Pitfalls | `DO NOT` imperative register |
| Verification | Checkboxes that prove the skill ran |

## Procedure

### Step 1: Capture Intent

Answer four questions before touching files:

1. What behavior does this skill teach?
2. When should it trigger? (keywords, contexts)
3. What does good output look like?
4. What mistakes does it prevent?

If lesson-driven, open `tasks/lessons.md` and read every entry with the same `error_type` to extract the pattern.

### Step 2: Pick Tier and Folder

| Signal | Tier |
|---|---|
| Always-on discipline applied to every session | core |
| Triggered by a task family (review, debug, plan) | practical |
| Heavy, niche, or requires external installation | optional |

Create the folder:

```bash
mkdir -p skills/<skill-name>          # core or practical
mkdir -p optional-skills/<skill-name> # optional
```

### Step 3: Copy the Template

Use `edit` to read `template/SKILL.md` and `edit` to write `<folder>/<name>/SKILL.md`. Replace every placeholder. Do NOT introduce sections outside the canonical seven.

### Step 4: Frontmatter

```yaml
---
name: my-new-skill
description: <single sentence ≤60 chars ending with a period>.
tier: practical
category: workflow
created_by: human
platforms: [windows, macos, linux]
tags: [keyword1, keyword2]
author: Real Name (@handle)
---
```

Forbidden description words (marketing — flagged by `verify.sh`):

```
powerful  comprehensive  seamless  advanced
robust    cutting-edge   intelligent  revolutionary
```

### Step 5: Body — Canonical Sections

Write each section in order. The Verification section MUST be a checklist whose items are testable — not aspirations.

In prose, reference Copilot tools by name in backticks (`view`, `edit`, `grep`, `glob`, `powershell`, `web_fetch`, `task`). Do NOT instruct the agent to call bare shell utilities — `verify.sh` warns on these:

```
cat  sed  awk  find  head  tail
```

### Step 6: Run the Spec Gate

```bash
bash scripts/verify.sh spec
```

Iterate until the new skill produces no errors and no warnings.

### Step 7: Smoke Test

Open a fresh session. Use a trigger phrase the skill claims to handle. Observe whether it activates and whether the output reflects the procedure. Iterate description and triggers as needed.

## Pitfalls

- **DO NOT** invent new body sections. Seven canonical, in fixed order.
- **DO NOT** write a description over 60 chars or without a period — the gate will reject it.
- **DO NOT** use marketing adjectives in the description.
- **DO NOT** instruct the agent to call bare shell utilities. Use Copilot tool names.
- **DO NOT** register the skill manually in `skills.md` — let the regen script do it.
- **DO NOT** ship a skill without verifying it actually triggers on its claimed contexts.

## Verification

- [ ] `bash scripts/verify.sh spec` produces no errors for the new skill.
- [ ] No warnings on the new skill (banned shell utilities, etc.).
- [ ] Frontmatter complete with all required keys.
- [ ] Body sections present in canonical order.
- [ ] Smoke test in a fresh session confirms the skill activates as claimed.
- [ ] If created from a lesson, the originating `tasks/lessons.md` entry references the new skill.
