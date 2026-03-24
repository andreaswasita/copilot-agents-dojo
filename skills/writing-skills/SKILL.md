---
name: writing-skills
description: >-
  Meta-skill for creating new SKILL.md files that follow the dojo specification.
  Use this skill when the user wants to create a custom skill, when a lesson
  pattern has matured enough to become a skill (3+ occurrences), when adapting
  the dojo for team-specific workflows, or when scripts/lesson-updater.sh
  recommends a skill amendment. Complements skill-creator with the exact
  YAML frontmatter and structural template.
---

# Writing Skills

Create new skills that follow the dojo spec exactly. Test before committing.

## When to Use

- Creating a new custom skill for the dojo
- A recurring pattern in `tasks/lessons.md` should become a skill
- Adapting the dojo for team-specific workflows
- `scripts/lesson-updater.sh` recommends an amendment or new skill
- User says "make a skill for..." or "teach the agent to..."

## How to Use

### Step 1: Gather Requirements

Before writing, answer:
1. **What does this skill teach?** — One clear behavior or workflow
2. **When should it activate?** — Specific triggers and contexts
3. **What does good look like?** — Expected agent behavior
4. **What mistakes does it prevent?** — Anti-patterns to avoid

### Step 2: Create the Structure

```bash
mkdir -p skills/<skill-name>
```

Folder naming: lowercase, hyphens, matches the `name` field exactly.

Optional subdirectories:
```
skills/<skill-name>/
├── SKILL.md          # Required
├── examples/         # Optional — worked examples
├── references/       # Optional — docs loaded on demand
└── scripts/          # Optional — executable helpers
```

### Step 3: Write the SKILL.md

**Required: YAML frontmatter**

```yaml
---
name: skill-name-here
description: >-
  Clear description of what the skill does AND when the agent should use it.
  Be slightly pushy — agents undertrigger more than they overtrigger.
  Include specific trigger phrases and contexts.
---
```

**Required: Markdown body**

```markdown
# Skill Title

Brief overview — what this skill does and why it matters.

## When to Use
- Trigger condition 1
- Trigger condition 2

## How to Use
### Step 1: ...
### Step 2: ...

## Examples
**Bad:**
> [What the agent does without this skill]

**Good:**
> [What the agent does with this skill]

## Guidelines
- Principle 1
- Principle 2

## Anti-Patterns
- **Pattern name** — Why it's bad and what to do instead
```

### Step 4: Quality Checks

Before committing the skill:

| Check | Pass? |
|-------|-------|
| `name` matches folder name | ✅ |
| Description explains *what* AND *when* | ✅ |
| Triggers are specific, not vague | ✅ |
| Steps are actionable (imperative form) | ✅ |
| Examples show before/after | ✅ |
| Anti-patterns are concrete | ✅ |
| SKILL.md is under 500 lines | ✅ |

### Step 5: Register in skills.md

Add the skill to the top-level `skills.md` index:

```markdown
### [`skills/my-new-skill`](skills/my-new-skill/SKILL.md) — My New Skill
Brief description of what it does.
```

### Step 6: Test the Skill

1. Start a new session
2. Perform a task that should trigger the skill
3. Verify the agent activates and follows the skill
4. Check: Is the output better with the skill than without?
5. Iterate until the skill produces consistent results

## Template

Use this exact template as your starting point:

```yaml
---
name: template-skill
description: >-
  Replace with a clear description of what this skill teaches the agent
  and when it should activate. Be specific about trigger phrases and
  contexts — agents undertrigger more than they overtrigger.
---

# Skill Title

Brief overview of what this skill does and why it matters.

## When to Use
- Trigger condition 1
- Trigger condition 2

## How to Use
Step-by-step instructions.

## Examples
Concrete before/after demonstrations.

## Guidelines
- Guideline 1
- Guideline 2

## Anti-Patterns
- **Pattern name** — Why it's bad
```

## Guidelines

- Start simple — 3 good guidelines beat 30 mediocre ones
- Skills must be testable — can you tell if the agent followed it?
- Use imperative form — "Do X" not "You should consider doing X"
- Include concrete examples — abstract principles don't land without demonstrations
- Keep SKILL.md under 500 lines — extract detail to `references/` if needed

## Anti-Patterns

- **Skills that are too vague** — "Write good code" isn't a skill
- **Skills that are too rigid** — Micromanaging every keystroke removes judgment
- **Skills nobody needs** — A pattern with 1 occurrence is a lesson, not a skill
- **Skills with no examples** — Principles without demonstrations don't stick
- **Untested skills** — If you haven't verified it works, it's a draft, not a skill
