---
name: traceability-gate
description: Enforces parent-link lineage across requirement layers.
tier: core
category: discipline
created_by: human
platforms: [windows, macos, linux]
tags: [traceability, governance, togaf, gate]
author: Andreas Wasita (@andreaswasita)
---

# Traceability Gate

The single governance gate for the TOGAF red thread: no artifact at
layer N+1 may persist unless it carries a verified link to a parent at
layer N. The skill does NOT elicit requirements and does NOT derive
new ones; its only job is to refuse to let unlinked artifacts live.

## When to Use

- Before any pull request that touches `requirements/**` or any skill
  that emits artifacts under it.
- Before promoting a curator-proposed skill from `optional-skills/` to
  `skills/` — learned skills must pass the same gate as live delivery.
- During Phase B → C and Phase C → D transitions, to prove the cascade
  is intact before architecture commits to a design.
- After every batch run of `derive-nfr-from-driver` or
  `derive-security-from-risk`.
- **NOT** as a substitute for elicitation — the gate verifies linkage,
  not quality of requirements. A bad requirement linked to a bad
  parent still passes the gate.

## Prerequisites

- The engagement directory exists at `requirements/<engagement>/`.
- `spec/artifact-schema.md` defines the frontmatter contract.
- `scripts/verify-traceability.sh` is executable.

The gate is allowed to be called against an empty engagement
directory — it reports zero artifacts and exits 0. That is the seed
state, not a failure.

## How to Run

```bash
# Full traceability check for one engagement
bash scripts/verify-traceability.sh requirements/<engagement>

# CI / strict mode — warnings (e.g. unratified) become failures
bash scripts/verify-traceability.sh --strict requirements/<engagement>

# Generate the RTM as a byproduct of the gate
bash scripts/gen-rtm.sh requirements/<engagement>

# Roll the gate into the dojo-wide gate
bash scripts/verify.sh        # invokes run_traceability_checks
```

## Quick Reference

| Action | Tool | Notes |
|---|---|---|
| Run gate locally | `bash scripts/verify-traceability.sh requirements/<engagement>` | Exit 0 = lineage intact. |
| Run gate strict | `bash scripts/verify-traceability.sh --strict …` | CI default. |
| Regenerate RTM | `bash scripts/gen-rtm.sh requirements/<engagement>` | Writes `docs/rtm-<engagement>.md`. |
| Full dojo gate | `bash scripts/verify.sh` | Includes the traceability check. |

## Procedure

### Step 1: Walk

The gate walks every `*.md` under `requirements/<engagement>/{BR,FR,NFR,SR,IR,TR}/`
and parses YAML frontmatter only. The body is ignored — humans read
the body, the machine reads the schema.

### Step 2: Validate

For each artifact:

1. All required frontmatter keys present (`id`, `layer`, `title`,
   `parent_ids`, `owner`, `measurable`, `ratified_by`,
   `derivation_skill`).
2. `id` matches filename and starts with the correct layer prefix.
3. `layer` is in `{BR, FR, NFR, SR, IR, TR}`.
4. Every `parent_ids` entry resolves to an existing file in the same
   engagement.
5. Every parent's `layer` is in the **Valid parent layers** column for
   this artifact (see `spec/artifact-schema.md` §1).
6. `measurable: true` for `NFR`/`SR`/`TR`.
7. No cycles in the parent graph.

### Step 3: Decide

- Any rule failure → **gate fails** (exit 1). The artifact cannot
  persist. The agent must fix the link or delete the artifact.
- `ratified_by` empty → warning by default, failure in `--strict`.
  CI runs `--strict`; the local loop does not, so iteration is fast.
- Zero artifacts → exit 0 with a note. Empty is a valid seed state.

### Step 4: Publish

If the gate passes, regenerate the RTM. The RTM is never edited by
hand — it is always a function of the artifact graph.

```bash
bash scripts/gen-rtm.sh requirements/<engagement>
```

## Pitfalls

- **DO NOT** treat the gate as a style check. It is the precondition
  for an artifact existing; downgrading a failure to a warning
  collapses the whole framework.
- **DO NOT** add a `# skip-traceability` escape hatch. Every escape
  hatch becomes the default within a quarter.
- **DO NOT** parent a `TR` straight to a `BR` because "it's obvious"
  — the layers exist so the agent cannot quietly skip them.
- **DO NOT** ratify an artifact from inside the agent to make the gate
  green. Ratification is a human signal; faking it is the worst
  failure mode this whole framework exists to prevent.

## Verification

- [ ] `bash scripts/verify-traceability.sh requirements/sample` exits 0.
- [ ] `bash scripts/verify-traceability.sh --strict requirements/sample`
      exits 1 when at least one artifact has `ratified_by: ""`.
- [ ] `bash scripts/gen-rtm.sh requirements/sample` writes a
      non-empty `docs/rtm-sample.md`.
- [ ] `bash scripts/verify.sh` includes the traceability gate in its
      output and the run is green.
