# Copilot Agents Dojo — Skill Specification

> A portable, modular format for teaching AI coding agents behavioral disciplines and practical workflows.

## Overview

Skills are self-contained folders of instructions, examples, and resources that GitHub Copilot agents (and other AI coding assistants) load to improve performance on specialized tasks. Each skill teaches the agent *how* to approach a category of work — whether that's planning before coding, running a code review, or onboarding to an unfamiliar codebase.

This specification defines the format used across the Copilot Agents Dojo.

## Skill Anatomy

```
skill-name/
├── SKILL.md          (required)  — YAML frontmatter + markdown instructions
├── examples/         (optional)  — Concrete examples, sample inputs/outputs
├── references/       (optional)  — Docs loaded into context as needed
├── scripts/          (optional)  — Executable code for deterministic tasks
└── assets/           (optional)  — Templates, icons, config snippets
```

### SKILL.md Structure

Every skill **must** have a `SKILL.md` with YAML frontmatter:

```yaml
---
name: skill-name            # Lowercase, hyphens for spaces. Must match folder name.
description: >-             # What the skill does AND when to use it.
  Concise description of the skill's purpose and the contexts
  that should trigger it. Be slightly pushy — agents undertrigger
  more than they overtrigger.
---
```

The markdown body below the frontmatter contains the agent's instructions. Organize with clear headings:

| Section | Purpose |
|---------|---------|
| **Overview** | What this skill does, in 1–2 sentences |
| **When to Use** | Specific triggers, keywords, and contexts |
| **How to Use** | Step-by-step workflow the agent follows |
| **Examples** | Concrete before/after or input/output demonstrations |
| **Guidelines** | Rules and principles to follow |
| **Anti-Patterns** | Common mistakes this skill prevents |
| **References** | Links to bundled reference files, if any |

Not every section is required — use what the skill needs.

## Progressive Disclosure

Skills use a three-level loading system to manage context window budget:

1. **Metadata** (name + description) — Always in context (~100 words). This determines whether the skill triggers.
2. **SKILL.md body** — Loaded when the skill activates (<500 lines ideal).
3. **Bundled resources** (examples/, references/, scripts/) — Loaded on demand. Scripts can execute without reading their source.

Keep SKILL.md under 500 lines. If you're approaching this limit, extract detail into reference files and add clear pointers.

## Naming Conventions

- Folder name: lowercase, hyphens (`plan-before-code`, `autonomous-bug-fix`)
- `name` in frontmatter: must match folder name exactly
- Description: present tense, action-oriented ("Guides the agent to plan multi-step work before writing code")

## Skill Categories

### Core Disciplines (The Six Kata)
Behavioral skills that govern *how* the agent thinks and operates. These are style-agnostic — they work regardless of language or framework.

### Practical Skills
Task-specific skills that teach the agent *how to do* a particular kind of work — code review, debugging, test writing, PR workflows, etc.

### Custom Skills
Your own skills, created for your team's specific workflows, conventions, or domain knowledge. Use the `template/` folder or the `skill-creator` skill to build them.

## Creating a New Skill

1. Copy `template/SKILL.md` into a new folder under `skills/`
2. Set `name` to match the folder name
3. Write a description that explains both *what* and *when*
4. Fill in the markdown body with instructions, examples, and guidelines
5. Add bundled resources if the skill needs them
6. Test by asking the agent to perform the task — does it follow the skill?

## Integration with Copilot

Skills are discovered automatically when placed in the `skills/` directory. The top-level `skills.md` serves as the index — it summarizes all available skills and links to their folders.

For GitHub Copilot specifically:
- `skills.md` at repo root is auto-discovered as the behavioral framework
- `.github/copilot-instructions.md` provides repo-wide conventions and links to skills
- Individual skill folders can be referenced from instructions or loaded by the agent on demand

## Versioning

Skills evolve through the self-improvement loop. When a pattern in `tasks/lessons.md` hits 3+ occurrences, it should be proposed as a skill amendment. Track changes in commit history — skills are code, treat them with the same rigor.
