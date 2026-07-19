---
# REQUIRED. Lowercase, hyphens. MUST match the folder name.
name: template-skill

# REQUIRED. ≤60 chars, one sentence, ends with a period.
# State the capability, not the implementation. No marketing words.
# Do NOT repeat the skill name in the description.
description: Replace with the capability this skill provides.

# REQUIRED. core | practical | optional
#   core      → always-on discipline (skills/)
#   practical → task-specific, loaded on trigger (skills/)
#   optional  → heavy/niche, installed explicitly (optional-skills/)
tier: practical

# REQUIRED. See spec §1.2 for the valid set.
category: workflow

# REQUIRED. human | agent  (agent-authored skills are curator-eligible)
created_by: human

# REQUIRED. OSes the scripts and shell snippets actually support.
# verify.sh audits this against script imports.
platforms: [windows, macos, linux]

# Optional. Free-form keywords for search and grouping.
tags: []

# Optional but expected. Human contributor first; format: Name (@handle).
author: Your Name (@your-handle)

# Optional. Config keys this skill expects under .dojo/config.yaml.
# Each key is prompted during `dojo setup` if missing at load time.
# config:
#   - dojo.example.threshold

# Optional. MCP server dependencies. IDs MUST resolve to mcp/registry.yaml.
# mcp:
#   required: [github]
#   optional: [fetch]

# Optional. Curator promotion gate. ID MUST resolve to a case in
# scripts/curator.sh → lookup_verifier_cmd(). When set, the curator runs
# the named verifier before promoting this skill to `active`. See spec §1.5.
# verifier: traceability-sample
---

# Template Skill

Two to three sentences stating what this skill does AND what it deliberately does NOT do. The "does not" half is as important as the "does" half — it prevents over-triggering on adjacent tasks.

## When to Use

Specific triggers, keywords, and contexts that should activate the skill. Be slightly pushy — agents undertrigger more often than they overtrigger.

- Trigger condition 1 (concrete situation, not abstract)
- Trigger condition 2
- Trigger condition 3 (include negative triggers if helpful: "but NOT when…")

## Prerequisites

What must be true before the skill can run.

- Tool / MCP server availability
- Required env vars or config keys
- Repo state (e.g. clean working tree, on a feature branch)

If a prerequisite is missing, the skill must fail loudly — never degrade silently.

## How to Run

One-screen overview of the canonical happy path. If the skill ships a script, show the command:

```bash
scripts/example.sh --flag value
```

## Quick Reference

| Action | Command / Tool | Notes |
|---|---|---|
| Common op 1 | `view path` | Use the Copilot `view` tool, not shell `cat`. |
| Common op 2 | `grep pattern` | Use the Copilot `grep` tool, not shell `grep`/`rg`. |
| Common op 3 | `scripts/example.sh` | Ships with the skill. |

The agent should be able to act from this table alone for routine cases.

## Procedure

Step-by-step detailed workflow. This is where the depth lives.

### Step 1: Assess

What the agent checks before acting.

### Step 2: Act

The actual work. Reference real Copilot tools in backticks (`view`, `edit`, `grep`, `glob`, `powershell`, `web_fetch`, `task`). Do NOT instruct the agent to call bare shell utilities (`cat`, `sed`, `find`) that have a Copilot wrapper.

### Step 3: Confirm

Intermediate verification before moving on.

## Pitfalls

Imperative "DO NOT" register of failure modes this skill prevents.

- **DO NOT** [common mistake 1] — [why it bites].
- **DO NOT** [common mistake 2] — [why it bites].
- **DO NOT** [common mistake 3] — [why it bites].

## Verification

How the agent (or a reviewer) proves the skill worked.

- [ ] Test or check 1 (with concrete command)
- [ ] Test or check 2
- [ ] `scripts/verify.sh` passes
