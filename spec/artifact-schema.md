# Requirements Artifact Schema (v1) — The Red Thread

> Every requirement artifact in this repo carries a verified link to its
> parent. The traceability gate (`scripts/verify-traceability.sh`) rejects
> any artifact at layer N+1 that does not resolve to a parent at layer N.
> Traceability stops being a document and becomes a precondition for
> existence.

This spec is the executable form of the TOGAF red thread described in
[*Keeping the TOGAF Red Thread Unbroken*](https://wasita.net/blog/red-thread-togaf-traceability).

## 1. Layers

Artifacts live under `requirements/<engagement>/<layer>/<id>.md`. The
allowed layers, in cascade order:

| Layer code | Name                          | TOGAF phase | Valid parent layers |
|------------|-------------------------------|-------------|---------------------|
| `BR`       | Business Requirement / Driver | A / B       | *(root — none)*     |
| `FR`       | Functional Requirement        | C           | `BR`                |
| `NFR`      | Non-Functional Requirement    | C           | `BR`, `FR`          |
| `SR`       | Security Requirement          | C / D       | `BR`, `FR`, `NFR`   |
| `IR`       | Integration Requirement       | D           | `FR`, `NFR`         |
| `TR`       | Technical Requirement         | D / E       | `FR`, `NFR`, `SR`, `IR` |

Every layer other than `BR` MUST resolve at least one parent. `BR` is the
only root layer; a `BR` with no parent is the design intent.

## 2. Frontmatter (Required)

Every artifact file is a markdown file with YAML frontmatter. The
traceability gate parses only the frontmatter; the body is for humans.

```yaml
---
id: NFR-001                      # REQUIRED. {LAYER}-{zero-padded int}.
layer: NFR                       # REQUIRED. One of BR|FR|NFR|SR|IR|TR.
title: Classification latency    # REQUIRED. One line, no period.
parent_ids: [BR-001, FR-002]     # REQUIRED unless layer == BR. Resolvable IDs.
owner: jane.doe@example.com      # REQUIRED. Named human, not a team alias.
measurable: true                 # REQUIRED. true|false. Gate fails if false at NFR/SR/TR.
ratified_by: arb-2026-05-20      # REQUIRED. Decision record / meeting ID.
target: "p95 < 2s on 3G"         # REQUIRED for NFR/SR/TR. Free-form but numeric.
derivation_skill: derive-nfr-from-driver   # REQUIRED. Skill that produced it.
tags: [latency, classification]  # Optional.
---
```

### 2.1 `id` — HARDLINE

- Format: `{LAYER}-{NNN}` where LAYER ∈ `BR|FR|NFR|SR|IR|TR`.
- Globally unique across the engagement directory.
- Filename MUST equal `{id}.md`.

### 2.2 `parent_ids` — HARDLINE

- Required for every layer except `BR`.
- Every element MUST resolve to an existing artifact file in the same
  engagement directory.
- Every element's `layer` MUST be in the **Valid parent layers** column
  of §1 for this artifact's layer. A `TR` cannot parent to a `BR`
  directly; it must pass through `FR`/`NFR`/`SR`/`IR`.

### 2.3 `measurable` — HARDLINE

- For `NFR`, `SR`, `TR`: `measurable: false` fails the gate.
- For `BR`, `FR`, `IR`: `measurable: false` warns but does not fail.
- The `target` field is the evidence. Adjectives ("fast", "robust",
  "intuitive") fail the elicitation skill before they reach the gate.

### 2.4 `ratified_by` — HARDLINE

- Free-form string but MUST be non-empty.
- Convention: `<decision-body>-<yyyy>-<mm>-<dd>` (e.g.
  `arb-2026-05-20`, `customer-2026-05-21`).
- The point is auditability: who said yes, when. Not the prose, the
  record.

## 3. Directory Layout

```
requirements/
└── <engagement>/
    ├── BR/
    │   ├── BR-001.md
    │   └── BR-002.md
    ├── FR/
    │   └── FR-001.md
    ├── NFR/
    │   └── NFR-001.md
    ├── SR/
    │   └── SR-001.md
    ├── IR/
    │   └── IR-001.md
    └── TR/
        └── TR-001.md
```

The gate walks one engagement at a time. Multiple engagements coexist
under `requirements/`.

## 4. Lifecycle

1. **Elicited.** Created by an agent running an elicitation or
   derivation skill (`requirements-elicitation`,
   `derive-nfr-from-driver`, `derive-security-from-risk`). The skill
   sets `derivation_skill` in the frontmatter.
2. **Ratified.** A human sets `ratified_by` to the decision record.
   Until then the gate flags the artifact as `unratified`.
3. **Live.** The gate passes. The artifact may parent downstream
   artifacts.
4. **Retired.** Move the file to `requirements/<engagement>/retired/`.
   The gate ignores retired artifacts but warns if any live artifact
   still names a retired parent.

## 5. The Gate Contract

`scripts/verify-traceability.sh` walks `requirements/<engagement>/`
and fails (exit 1) on any of:

- Missing required frontmatter key.
- `id` does not match filename or layer prefix.
- `layer` not in the valid set.
- `parent_ids` missing for non-`BR` artifact.
- A `parent_ids` element does not resolve to a file.
- A parent's `layer` is not in the **Valid parent layers** for this
  artifact's layer (a `TR` parented straight to a `BR`, for example).
- `measurable: false` at `NFR`/`SR`/`TR`.
- `ratified_by` missing or empty (warning, not failure, in default
  mode; failure in `--strict`).
- A cycle in the parent graph.

`scripts/gen-rtm.sh` consumes the same graph and emits
`docs/rtm.md` — the Requirements Traceability Matrix as a byproduct
of the gate, not a document anyone writes by hand.

## 6. Self-Improvement Boundary

The curator (`scripts/curator.sh`) may propose new derivation skills.
A learned skill is only promoted into `skills/` if `verify.sh` —
including `run_traceability_checks` — passes against the sample
engagement under `requirements/sample/`. Learning is allowed to make
derivation faster. It is never allowed to manufacture a requirement,
because every artifact a learned skill emits still needs a
`parent_ids` link that resolves through the gate.

## 7. Why This Schema, Not Free Prose

The blog post's claim is that "no artifact at layer N+1 may persist
unless it carries a verified link to a parent at layer N." A human can
write that sentence into any document; an agent can write it into a
thousand. Only a machine-checkable schema turns it into a precondition
for existence. Frontmatter is that schema.
