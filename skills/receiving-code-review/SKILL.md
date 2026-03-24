---
name: receiving-code-review
description: >-
  Processes feedback from human or agent code reviews and iterates until the
  code is approved. Use this skill when review comments are received on a PR
  or diff, when the user provides corrections or suggestions, when a self-review
  (requesting-code-review) flagged issues, or when CI/CD checks fail with
  actionable feedback.
---

# Receiving Code Review

Feedback received. Process every comment. Fix, verify, update, and request re-review.

## When to Use

- Review comments received on a pull request
- User provides corrections or improvement suggestions
- Self-review (`requesting-code-review`) flagged issues to fix
- CI/CD checks fail with actionable feedback
- Another agent's review output needs to be addressed

## How to Use

### Step 1: Acknowledge and Categorize

Read every comment. Categorize by action needed:

| Category | Action |
|----------|--------|
| **Agree — will fix** | Fix it. No debate needed. |
| **Agree — won't fix now** | Log as follow-up with reason |
| **Disagree — with explanation** | Respond with reasoning and evidence |
| **Question — need clarification** | Ask a focused follow-up question |
| **Already addressed** | Point to the commit/line that addresses it |

### Step 2: Address Each Comment

For every review comment:

1. **Fix the issue** — Make the code change
2. **Run relevant tests** — Verify the fix doesn't break anything
3. **Respond to the comment** — Explain what you changed and why
4. **Mark resolved** — Track which comments are addressed

```markdown
## Review Response

### Comment 1: "Missing error handling on API call" — @reviewer
**Action:** Added try/catch with proper error response (commit abc123)
**Verification:** New test covers the error path

### Comment 2: "Consider using a Map instead of Object" — @reviewer
**Action:** Agree, refactored to Map for O(1) lookups (commit def456)
**Verification:** All existing tests pass, perf test shows 2x improvement

### Comment 3: "Add pagination" — @reviewer
**Action:** Logged as follow-up — out of scope for this PR
**Tracking:** Added to tasks/todo.md as future item
```

### Step 3: Re-Verify After Changes

After addressing all comments:

1. **Run the full test suite** — Not just the tests for changed code
2. **Re-review the diff** — Use `requesting-code-review` skill on the updated code
3. **Check that fixes don't introduce new issues** — Every fix is a potential new bug

### Step 4: Update Tracking Files

```markdown
# tasks/todo.md — add review section
### Review Feedback (Round 1)
- [x] Fix missing error handling (comment #1)
- [x] Refactor to Map (comment #2)
- [ ] Add pagination (comment #3 — logged as follow-up)
```

Update `tasks/lessons.md` if the review caught a recurring pattern:

```yaml
- date: 2026-03-24
  error_type: error-handling-gap
  trigger: "Reviewer caught missing try/catch on external API call"
  root_cause: "Didn't consider failure modes for external dependencies"
  fix: "Added error boundary pattern for all external calls"
  rule: "Every external API call gets a try/catch with proper error response"
  occurrences: 1
  status: active
```

### Step 5: Request Re-Review

After all fixes are committed:

```markdown
**Re-review ready**
- Addressed 2/3 comments directly
- 1 comment logged as follow-up (out of scope)
- All tests pass (49 total, 2 new)
- No new issues in self-review
```

## Examples

**Bad — Defensive Response:**
> Reviewer: "This doesn't handle null"
> Agent: "It works fine in my tests"

**Good — Constructive Response:**
> Reviewer: "This doesn't handle null"
> Agent: "Good catch. Added null guard at the boundary and a test for the null case.
> Commit abc123. All 49 tests pass."

**Bad — Ignoring Feedback:**
> *3 comments received, agent addresses 1 and ignores the rest*

**Good — Complete Response:**
> Agent: "Addressed all 3 comments:
> 1. ✅ Fixed — null handling added
> 2. ✅ Fixed — renamed for clarity
> 3. 📝 Logged — pagination is out of scope, added to follow-up"

## Guidelines

- Address every comment — even if the answer is "won't fix now, here's why"
- Fixes from review get their own commits — don't amend the original
- Re-verify after every round of fixes
- Log recurring review themes in `tasks/lessons.md` — they're learning opportunities
- If you disagree with feedback, explain with evidence, not attitude

## Anti-Patterns

- **Ignoring comments** — Every comment deserves a response
- **Being defensive** — "It works" is not a response to "this could be better"
- **Fixing without verifying** — A fix that breaks something else isn't a fix
- **Losing track of comments** — Use a checklist to ensure every comment is addressed
- **Not learning from reviews** — If the same feedback keeps appearing, log the lesson
