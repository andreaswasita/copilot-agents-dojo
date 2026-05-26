---
name: derive-security-from-risk
description: Derives security requirements from a named threat.
tier: practical
category: workflow
created_by: human
platforms: [windows, macos, linux]
tags: [security, requirements, traceability, togaf, threat-modelling]
author: Andreas Wasita (@andreaswasita)
---

# Derive Security From Risk

Turns a ratified business driver or functional requirement — together
with a named threat — into a Security Requirement (SR) the gate can
verify. This skill does NOT propose generic controls and does NOT
parent SRs to unspecified parent risks; every SR names the obligation
or threat it satisfies.

## When to Use

- A `BR-*` or `FR-*` exists for the engagement and processes regulated
  data, money, identity, or controlled access.
- A threat modelling session (STRIDE, LINDDUN, attack tree) has
  produced a concrete threat the architecture must mitigate.
- A compliance obligation (PCI, HIPAA, APRA CPS 234, GDPR, ISO 27001
  Annex A) maps to a control the design must enforce.
- **NOT** when nobody can name the threat yet — run a threat-modelling
  session first; do not derive a control to look productive.

## Prerequisites

- The parent `BR-*` or `FR-*` exists in
  `requirements/<engagement>/` and is ratified.
- A named threat or obligation is recorded in
  `requirements/<engagement>/threats/<threat-id>.md` (free-form, but
  the SR body must cite it).
- `spec/artifact-schema.md` is the contract for SR frontmatter.

If no named threat exists, stop. The TOGAF red thread breaks the
moment a control mitigates a threat nobody named.

## How to Run

```bash
bash scripts/verify-traceability.sh requirements/<engagement>
# create requirements/<engagement>/SR/SR-NNN.md
bash scripts/verify-traceability.sh requirements/<engagement>
```

## Quick Reference

| Action | Tool | Notes |
|---|---|---|
| Read parent BR/FR | `view` | Get exact `id`. |
| Read threat record | `view` | The threat ID goes in the SR body. |
| Write SR | `create` | Frontmatter per schema; `measurable: true`. |
| Verify lineage | `bash scripts/verify-traceability.sh` | Must pass before commit. |

Example SR frontmatter:

```yaml
---
id: SR-003
layer: SR
title: PII masking before persistence
parent_ids: [BR-001, FR-002]
owner: security.lead@example.com
measurable: true
ratified_by: ""
target: "Zero unmasked PII fields in storage; verified by daily DLP scan."
derivation_skill: derive-security-from-risk
tags: [pii, masking, data-protection, threat-T03]
---
```

## Procedure

### Step 1: Assess

- Read the parent artifact with `view`. Confirm the data classification
  (public / internal / confidential / regulated) is stated.
- Read the threat record. Confirm it names a threat actor, a target
  asset, and a damaging outcome. A "threat" of "users might do
  something bad" is not a threat — stop.

### Step 2: Derive

For each named threat or obligation, produce one SR with:

- A **control statement** that names what the system MUST or MUST NOT
  do (RFC 2119 register, not prose).
- A **measurable target**: a scan, a metric, an audit query, an
  attestation cadence. If the control cannot be measured the gate
  rejects it.
- A **traceable obligation**: cite the threat ID or the
  regulation clause in the body. The agent never invents the
  obligation — it cites one.

### Step 3: Link

- `parent_ids` includes the affected `BR-*` and/or `FR-*`. SRs MAY
  also parent to an `NFR-*` when the control constrains an existing
  quality attribute (e.g. an availability SR for a fraud-detection
  service).
- `derivation_skill: derive-security-from-risk` is mandatory.

### Step 4: Confirm

```bash
bash scripts/verify-traceability.sh requirements/<engagement>
```

Must exit 0. Then regenerate the RTM:

```bash
bash scripts/gen-rtm.sh requirements/<engagement>
```

## Pitfalls

- **DO NOT** emit a generic "encrypt everything" SR with no threat
  cited. Generic controls produce generic audits and miss the actual
  risk.
- **DO NOT** parent an SR to a threat record directly — the threat is
  the *justification* (cited in the body); the parent is always a
  ratified requirement.
- **DO NOT** mark `measurable: true` without defining how it is
  measured. The gate cannot tell, but the auditor can.
- **DO NOT** ratify the SR from the agent. The Security Architect (or
  a human approver) sets `ratified_by` after review.
- **DO NOT** write an SR that mitigates a threat without an owner. An
  unowned control is an unowned control failure six months from now.

## Verification

- [ ] `SR-*.md` filename equals its `id`.
- [ ] `parent_ids` resolves to ratified `BR-*`/`FR-*`/`NFR-*`.
- [ ] Body cites a named threat ID or a specific regulatory clause.
- [ ] `target` describes how the control is measured.
- [ ] `bash scripts/verify-traceability.sh requirements/<engagement>` exits 0.
- [ ] `bash scripts/verify.sh` passes the full gate.
