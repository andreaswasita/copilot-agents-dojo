---
name: derive-nfr-from-driver
description: Derives measurable NFRs from a parent business driver.
tier: practical
category: workflow
created_by: human
platforms: [windows, macos, linux]
tags: [requirements, traceability, nfr, togaf]
verifier: traceability-sample
author: Andreas Wasita (@andreaswasita)
---

# Derive NFR From Driver

Turns a ratified business driver (BR) — and the functional requirements
(FRs) derived from it — into measurable Non-Functional Requirements with
verified parentage. This skill does NOT elicit drivers and does NOT
invent FRs; it derives NFRs against parents that already exist on disk.

## When to Use

- A `BR-*` and at least one `FR-*` exist for the engagement and need
  performance, availability, scalability, or accessibility targets
  before Phase D begins.
- The architect is about to design components and needs SLO-shaped
  inputs, not adjectives.
- A reviewer asks "what does *fast* mean?" — derive an NFR with a
  numeric target instead of arguing prose.
- **NOT** when the driver itself is unratified — go to
  `requirements-elicitation` first.

## Prerequisites

- `requirements/<engagement>/BR/` contains at least one ratified `BR-*`
  artifact (`ratified_by` is non-empty).
- `requirements/<engagement>/FR/` contains the FR(s) this NFR will
  constrain.
- `spec/artifact-schema.md` is the contract for frontmatter fields.

If a prerequisite is missing the skill must stop and report — never
emit an NFR pointing at a non-existent or unratified parent.

## How to Run

```bash
# 1. Confirm the parent exists and is ratified
bash scripts/verify-traceability.sh requirements/<engagement>

# 2. Create the NFR file (filename MUST equal {id}.md)
#    Then run the gate again to prove the new link resolves
bash scripts/verify-traceability.sh requirements/<engagement>
```

## Quick Reference

| Action | Tool | Notes |
|---|---|---|
| Read parent BR/FR | `view` | Get the exact `id` values. |
| List existing NFRs | `glob requirements/<engagement>/NFR/*.md` | Pick the next free `NFR-NNN`. |
| Write NFR | `create` | Frontmatter per `spec/artifact-schema.md`. |
| Verify lineage | `bash scripts/verify-traceability.sh` | Must pass before commit. |

The frontmatter the agent emits:

```yaml
---
id: NFR-007
layer: NFR
title: Classification latency under load
parent_ids: [BR-001, FR-002]
owner: jane.doe@example.com
measurable: true
ratified_by: ""
target: "p95 < 2s on 3G, p99 < 4s"
derivation_skill: derive-nfr-from-driver
tags: [latency, classification]
---
```

## Procedure

### Step 1: Assess

- Read the parent `BR-*` and any candidate `FR-*` with `view`.
- Identify the **quality attribute** the driver implies: latency,
  throughput, availability, durability, accessibility, recoverability,
  observability, portability.
- Reject the derivation outright if the driver is unratified
  (`ratified_by` empty). Send back to `requirements-elicitation`.

### Step 2: Derive

For each quality attribute, write one NFR with:

- A **numeric target** in the `target` field (percentile + threshold +
  operating envelope — never just "fast"). If you cannot write a
  number, you have not derived an NFR yet.
- A **measurement method** stated in the body (synthetic probe, RUM,
  load test fixture). Without it the NFR is unfalsifiable.
- An **operating envelope**: load profile, network condition, payload
  size. NFRs without envelopes drift on contact with production.

### Step 3: Link

- `parent_ids` MUST include the driver's `BR-*` and SHOULD include the
  most specific `FR-*` the NFR constrains.
- `derivation_skill: derive-nfr-from-driver` is mandatory — the curator
  uses this to attribute learned patterns.

### Step 4: Confirm

```bash
bash scripts/verify-traceability.sh requirements/<engagement>
```

The gate must pass with zero failures. A warning on `ratified_by` is
expected until a human ratifies the NFR at the architecture review
board.

## Pitfalls

- **DO NOT** invent a parent BR to justify an NFR you already wanted —
  the skill exists specifically to prevent this. If the parent does not
  exist, stop.
- **DO NOT** write `measurable: false` to bypass the gate; the gate
  fails on it for NFRs by design (see `spec/artifact-schema.md` §2.3).
- **DO NOT** parent an NFR to another NFR — the schema disallows it.
  NFRs are leaves of the requirement layer, not branches.
- **DO NOT** set `ratified_by` from inside the agent. Ratification is
  the human's signal that the derivation is accepted. The agent leaves
  it blank.
- **DO NOT** copy the driver's prose into the `target` field. The
  target is a number with units; the prose belongs in the body.

## Verification

- [ ] New `NFR-*.md` filename equals its `id`.
- [ ] `parent_ids` lists at least one `BR-*` that exists on disk.
- [ ] `target` contains a numeric threshold and an operating envelope.
- [ ] `bash scripts/verify-traceability.sh requirements/<engagement>` exits 0.
- [ ] `bash scripts/gen-rtm.sh requirements/<engagement>` shows the new
      NFR linked under its driver in `docs/rtm.md`.
- [ ] `bash scripts/verify.sh` passes the full gate.
