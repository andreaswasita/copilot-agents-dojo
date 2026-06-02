# Copilot Agents Dojo — Skill Specification (v1)

> A portable, modular format for teaching AI coding agents behavioral disciplines and practical workflows.

This is the **HARDLINE** spec. Reviewers reject PRs that violate it. Authors fix violations before re-requesting review. `scripts/verify.sh` enforces every measurable rule below.

## Overview

Skills are self-contained folders of instructions, examples, and resources that GitHub Copilot agents (and other AI coding assistants) load to improve performance on specialized tasks. Each skill teaches the agent *how* to approach a category of work — planning before coding, running a code review, onboarding to an unfamiliar codebase, etc.

## Skill Anatomy

```
skill-name/
├── SKILL.md          (required)   YAML frontmatter + markdown instructions
├── scripts/          (optional)   Executable helpers — don't expect inline parsers
├── references/       (optional)   Detailed docs loaded into context as needed
├── templates/        (optional)   Starter files / config snippets the agent copies
├── examples/         (optional)   Concrete before/after demonstrations
└── tests/            (optional)   pytest smoke tests for scripts/ helpers
```

`assets/` is allowed for icons and binary fixtures; everything that influences agent behavior belongs in one of the dirs above.

---

## 1. Frontmatter (Required)

Every `SKILL.md` opens with YAML frontmatter. **All required fields must be present** — `verify.sh` rejects missing keys.

```yaml
---
name: plan-before-code              # REQUIRED. Lowercase, hyphens. MUST match folder name.
description: Plans multi-step work before writing code.   # REQUIRED. ≤60 chars. See §1.1.
tier: core                          # REQUIRED. core | practical | optional
category: discipline                # REQUIRED. See §1.2 for valid values.
created_by: human                   # REQUIRED. human | agent (drives curator eligibility)
platforms: [windows, macos, linux]  # REQUIRED. Audited against script imports — see §1.3.
tags: [planning, workflow]          # Optional. Free-form keywords for search.
author: Andreas Wasita (@andreaswasita)   # Optional but expected. Human first. See §1.4.
config:                             # Optional. Config keys this skill expects under .dojo/config.yaml
  - dojo.plan.min_steps             # Each key prompted during `dojo setup` if missing.
mcp:                                # Optional. MCP server dependencies.
  required: [github]                # IDs MUST resolve to mcp/registry.yaml entries.
  optional: [fetch]
---
```

### 1.1 `description` — HARDLINE

- **≤ 60 characters.** Long descriptions bloat the skills index and dilute the model's attention.
- **One sentence, ends with a period.**
- **State the capability, not the implementation.**
- **No marketing words:** `powerful`, `comprehensive`, `seamless`, `advanced`, `robust`, `cutting-edge`, `intelligent`, `revolutionary`. `verify.sh` greps for these and fails.
- **Do not repeat the skill name.** `name: plan-before-code` + `description: Plan before coding for multi-step tasks.` is redundant — drop the echo.

Self-check:

```bash
python -c "
import re, pathlib, sys
m = re.search(r'^description: (.*)$',
              pathlib.Path('skills/<name>/SKILL.md').read_text(),
              re.MULTILINE)
d = m.group(1).strip().strip('\"')
assert len(d) <= 60, f'description too long: {len(d)} chars'
assert d.endswith('.'), 'description must end with period'
"
```

### 1.2 `tier` and `category`

| `tier` | Meaning | Location |
|---|---|---|
| `core` | Always-on discipline. Loaded at session start. | `skills/` |
| `practical` | Task-specific workflow. Loaded on trigger. | `skills/` |
| `optional` | Heavy or niche; opt-in via `dojo install`. | `optional-skills/` |

Valid `category` values: `discipline`, `workflow`, `review`, `testing`, `debugging`, `refactoring`, `onboarding`, `delegation`, `mcp`, `meta`, `release`, `documentation`. Propose additions in a PR that updates this list.

### 1.3 `platforms` — Audited

Declare the OSes the skill's scripts and shell snippets actually work on. `verify.sh` greps script files for platform-bound primitives and fails if `platforms:` claims more than the code supports.

| If your scripts use… | …declare platforms |
|---|---|
| `fcntl`, `termios`, `os.setsid`, `/proc`, `signal.SIGKILL`, bash heredocs, `osascript`, `apt`, `systemctl` | restrict to `[linux]` / `[macos]` as appropriate |
| Only `pathlib`, `tempfile.gettempdir`, `psutil`, PowerShell-equivalent helpers | `[windows, macos, linux]` |

**Default posture:** try to fix it cross-platform first. Gate narrower only when the dependency is genuinely platform-bound.

### 1.4 `author` — Human First

Credit the human contributor first. Format: `Real Name (@github-handle)`. If multiple, separate with `, `. `Copilot` is a collaborator, not the lead — even if you used Copilot to draft the skill, replace any auto-attribution with your own name.

### 1.5 `verifier` — Optional Promotion Gate

A skill MAY declare an optional `verifier:` ID in its frontmatter. The curator (`scripts/curator.sh`) runs the named verifier before promoting the skill to `active` — via `record`, `transition` reactivation, `restore`, or the explicit `promote` verb. On verifier failure, the promotion is blocked and the event is logged to `.dojo/curator.log`.

Verifier IDs are **whitelisted** in `lookup_verifier_cmd()` inside `curator.sh`. Freeform shell commands are not accepted by design — learned agent skills could otherwise smuggle arbitrary code through the activation path.

Currently registered verifiers:

| ID | What it runs | Skills that should use it |
|---|---|---|
| `traceability-sample` | `bash scripts/verify-traceability.sh requirements/sample` | Skills that derive new requirements artefacts (e.g. `derive-nfr-from-driver`, `derive-security-from-risk`) |

If a skill has no `verifier:` (or the value is empty), the curator promotes it without running anything — fully backward compatible.

```yaml
verifier: traceability-sample
```

To add a new verifier, append a new case to `lookup_verifier_cmd()` and document it here. Skills referencing an unknown verifier ID are blocked from promotion until the registry is updated.

---

## 2. Body Sections (Required Order)

The body **must** appear in this order. `verify.sh` checks for heading presence and ordering.

```markdown
# <Skill Name> Skill

2–3 sentence intro stating what the skill does AND what it deliberately does NOT do.

## When to Use
Specific triggers, keywords, and contexts. Be slightly pushy — agents undertrigger more than they overtrigger.

## Prerequisites
Tools, MCP servers, env vars, config keys the skill assumes. Anything missing → fail loudly, don't degrade silently.

## How to Run
One-screen overview of the canonical happy path. If the skill ships a script, show the command here.

## Quick Reference
Cheat-sheet table or bullet list of the most common operations. The agent should be able to act from this section alone for routine cases.

## Procedure
Step-by-step detailed workflow. This is where the depth lives.

## Pitfalls
Common failure modes the skill prevents. Imperative "DO NOT" format.

## Verification
How the agent (or a reviewer) proves the skill worked. Tests, diffs, command outputs.
```

### Target Lengths

| Skill complexity | Target SKILL.md length |
|---|---|
| Simple (one capability, no script) | ~100 lines |
| Standard | ~150 lines |
| Complex (orchestrates scripts/MCP) | ~200 lines, cap at 500 |

If you're approaching 500, extract depth into `references/` and link from `Procedure`.

---

## 3. Tool-Naming Rule (HARDLINE)

Tools referenced in SKILL.md prose **must be real Copilot tools or named MCP servers**. Use backticks. Do NOT name shell utilities the agent already has wrapped.

| If you want the agent to… | Write this | NOT this |
|---|---|---|
| Find files by name | `` `glob` `` | `find`, `ls`, `dir` |
| Search file contents | `` `grep` `` (the Copilot tool) | shell `grep`, `rg`, `Select-String`, `findstr` |
| Read a file | `` `view` `` | `cat`, `head`, `tail`, `Get-Content` |
| Edit a file | `` `edit` `` or `` `create` `` | `sed`, `awk`, manual heredocs |
| Run a command | `` `powershell` `` | "run a shell command" |
| Fetch a URL | `` `web_fetch` `` or `` `web_search` `` | `curl`, `wget` |
| Delegate work | `` `task` `` (sub-agent) | "spawn a subprocess" |
| Talk to GitHub | named MCP server (e.g. `github` from `mcp/registry.yaml`) | bare `gh` calls in prose |

Inside `scripts/` files, any tool is fair game — that's a real shell environment. The rule applies to **prose in SKILL.md** that the model reads as instructions. `verify.sh` greps SKILL.md bodies for the banned bare utilities and fails.

If the skill depends on an MCP server, name it in `Prerequisites` and link to `mcp/registry.yaml`.

---

## 4. Layout Rules

- **`scripts/`** — Don't expect the model to inline-write parsers, XML walkers, or non-trivial logic every call. Ship a helper script and reference it by relative path from SKILL.md (`scripts/foo.sh`, `scripts/foo.ps1`).
- **`references/`** — Detailed docs the model loads on demand. Linked from `Procedure`.
- **`templates/`** — Starter files the agent copies, not generates.
- **`tests/`** — Pytest smoke tests for `scripts/` helpers. Stdlib + `pytest` + `unittest.mock` only. No live network. Run via `scripts/verify.sh tests`.
- **Cross-platform parity** — if `scripts/foo.sh` exists, prefer also shipping `scripts/foo.ps1` so the skill works on Windows.

---

## 5. Naming & Provenance

- Folder: lowercase, hyphens (`plan-before-code`, `autonomous-bug-fix`).
- `name:` matches folder exactly.
- Skills with `created_by: agent` are eligible for curator auto-archive (see `skills/self-improvement/SKILL.md`). Skills with `created_by: human` are off-limits to the curator unless explicitly pinned/unpinned.

---

## 6. Tiering & Discovery

| Tier | Location | Activation |
|---|---|---|
| `core` | `skills/` | Always loaded at session start by `using-superpowers` |
| `practical` | `skills/` | Loaded on trigger conditions from `When to Use` |
| `optional` | `optional-skills/` | Installed explicitly via `dojo install optional/<name>` |

`skills.md` at repo root is the index, grouped by tier then category. It is **generated** from frontmatter via `scripts/regen-skills-index.sh` — do not hand-edit it. `verify.sh --check` fails on drift.

---

## 7. Creating a New Skill

1. Copy `template/SKILL.md` into a new folder under `skills/`.
2. Fill in all required frontmatter fields.
3. Write the body in the required section order.
4. If the skill needs deterministic logic, add `scripts/` (cross-platform when possible) and a `tests/` smoke test.
5. Run `scripts/verify.sh` locally — it must pass before push.
6. Open the PR. Reviewer checklist is `.github/known-pitfalls.md` + this spec.

---

## 8. Versioning & Evolution

Skills evolve through the self-improvement loop. When a pattern in `tasks/lessons.md` recurs 3+ times, `scripts/lesson-updater.sh` proposes a skill amendment.

**Cache-aware mutation rule:** amendments default to **deferred** invalidation — the change takes effect on the next Copilot session, preserving in-flight prompt caching. Pass `--now` to `lesson-updater.sh` only when correctness requires immediate effect; it will warn about cache-invalidation cost. Full rationale in [`AGENTS.md`](../AGENTS.md#cache-aware-mutations).

Track changes in commit history. Skills are code — treat them with the same rigor.
