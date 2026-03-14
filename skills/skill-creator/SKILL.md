---
name: skill-creator
description: >-
  A meta-skill for creating new dojo skills. Guides the agent through capturing intent,
  writing SKILL.md files, and testing skill effectiveness. Use this skill when the user
  wants to create a new custom skill, when a lesson pattern has matured enough to become
  a skill, when adapting the dojo for team-specific workflows, or when the user says
  "make a skill for" or "teach the agent to."
---

# Skill Creator

A skill for creating new skills. Meta? Yes. Useful? Absolutely.

## When to Use

- User wants to create a new custom skill
- A recurring pattern in `tasks/lessons.md` should be formalized
- Adapting the dojo for team-specific workflows or conventions
- User says "make a skill for..." or "teach the agent to..."
- `scripts/lesson-updater.sh` recommends a skill amendment

## How to Use

### Step 1: Capture Intent

Before writing anything, understand:

1. **What should this skill teach the agent to do?**
2. **When should this skill activate?** (trigger phrases, contexts)
3. **What does a good outcome look like?** (expected behavior)
4. **What are the common mistakes to prevent?** (anti-patterns)

If the skill is emerging from lessons, review the relevant entries in `tasks/lessons.md` to extract the pattern.

### Step 2: Create the Skill Structure

```bash
mkdir -p skills/<skill-name>
```

The folder name should be lowercase with hyphens: `my-new-skill`.

### Step 3: Write the SKILL.md

Use this structure (adapting from `template/SKILL.md`):

```yaml
---
name: my-new-skill
description: >-
  Clear description of what the skill does AND when the agent should use it.
  Be slightly pushy in the description — agents undertrigger more than they
  overtrigger. Include trigger phrases and contexts.
---
```

Then write the markdown body:

```markdown
# Skill Title

Brief overview — what and why.

## When to Use
- Specific trigger conditions
- Contexts that should activate this skill

## How to Use
Step-by-step workflow the agent follows.

## Examples
Concrete before/after demonstrations.

## Guidelines
Principles to follow.

## Anti-Patterns
Common mistakes this skill prevents.
```

### Step 4: Writing Tips

**Descriptions are critical.** The description field is the primary trigger mechanism. Make it:
- Specific about *what* and *when*
- Slightly pushy — include contexts the agent might not immediately connect
- Action-oriented with trigger phrases

**Keep instructions practical:**
- Use imperative form ("Do X", not "You should consider doing X")
- Include concrete examples, not just principles
- Show both good and bad approaches
- Explain *why* behind each guideline — agents work better when they understand intent

**Manage context budget:**
- Keep SKILL.md under 500 lines
- Move detailed references to an `examples/` or `references/` subdirectory
- Scripts in `scripts/` can be executed without reading their source

### Step 5: Add Bundled Resources (Optional)

If the skill needs supporting files:

```
skills/my-new-skill/
├── SKILL.md              # Required
├── examples/             # Concrete examples
│   └── good-example.md
├── references/           # Docs loaded on demand
│   └── api-reference.md
└── scripts/              # Executable helpers
    └── validate.sh
```

### Step 6: Register the Skill

Add the skill to the top-level `skills.md` index:

```markdown
### [`skills/my-new-skill`](skills/my-new-skill/SKILL.md) — My New Skill
Brief description of what it does.
```

### Step 7: Test the Skill

Ask the agent to perform a task that should trigger the skill:
1. Does the skill activate when expected?
2. Does the agent follow the instructions?
3. Is the output better with the skill than without?
4. Are there gaps or unclear instructions?

Iterate until the skill produces consistent, high-quality results.

## Examples

**From Lesson to Skill:**

Lessons log shows:
```yaml
- error_type: security-gap
  trigger: "No input validation on new endpoints"
  occurrences: 4
  rule: "Every new endpoint must validate input before business logic"
```

This should become a skill:
```yaml
---
name: api-input-validation
description: >-
  Ensures every new API endpoint has input validation before business logic.
  Use when creating new endpoints, adding request handlers, or modifying
  API routes.
---
```

## Guidelines

- Start simple — a skill with 3 good guidelines beats 30 mediocre ones
- Skills should be testable — can you tell if the agent followed it?
- Don't over-specify — leave room for the agent to exercise judgment
- Iterate — skills improve through use, just like the agents that use them

## Anti-Patterns

- **Skills that are too vague** — "Write good code" isn't a skill, it's a wish
- **Skills that are too rigid** — Micromanaging every keystroke removes agent judgment
- **Skills nobody needs** — If a pattern only appeared once, it's a lesson, not a skill
- **Skills with no examples** — Abstract principles without concrete demonstrations don't land
- **Forgetting to test** — An untested skill is just a document
