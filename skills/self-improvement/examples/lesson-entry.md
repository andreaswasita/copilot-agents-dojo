# Lesson Entry — Worked Example

## Scenario

The agent was asked to add a new API endpoint for user preferences. It implemented the endpoint but forgot to add input validation, and the user corrected it.

## The Lesson Entry

```yaml
- date: 2024-03-15
  error_type: security-gap
  trigger: "Implemented POST /api/preferences without validating request body"
  root_cause: "Jumped straight to handler logic without considering input boundaries"
  fix: "Added Zod schema validation at the route handler entry point"
  rule: "Every new API endpoint must have input validation before any business logic runs"
  occurrences: 1
  status: active
  tags:
    - api
    - validation
    - security
  discipline: plan-before-code
```

## What Makes This Entry Effective

1. **Specific trigger** — Not "forgot validation" but exactly *which* endpoint and *what* was missing
2. **Root cause goes deeper** — The real issue wasn't forgetting validation, it was skipping the planning step where input boundaries would have been considered
3. **Actionable rule** — Clear enough that the agent can check this before every endpoint implementation
4. **Tagged for discovery** — Future sessions working on APIs will surface this lesson
5. **Linked to a discipline** — Traces back to `plan-before-code`, reinforcing the pattern

## Evolution of This Lesson

If this pattern recurs:

**Occurrence 2** (2024-03-22):
```yaml
  trigger: "PUT /api/settings also lacked validation"
  occurrences: 2
  status: active
```

**Occurrence 3** (2024-04-01) — Amendment triggered:
```yaml
  occurrences: 3
  status: amended-to-skill
  amendment: "Added 'Input validation checkpoint' to plan-before-code skill"
```

At 3 occurrences, the lesson graduates from a personal note to a structural rule in the skill system.
