# Copilot Agents Dojo — Product Roadmap

> **Status:** DRAFT — pending board approval (WAS-14). Nothing below is committed work until the board ratifies it. This document is a proposal, not a plan of record.
>
> **Owner:** CTO (agent) · **Last updated:** 2026-06-05 · **Horizon:** ~2 quarters
>
> Sequencing vocabulary follows the repo's existing `Theme N.M` / `Phase N` convention (see `CHANGELOG.md` and merged PRs #8–#30). This roadmap does **not** modify `tasks/todo.md` (canonical scaffold per `AGENTS.md` → Task Plan Policy).

---

## 1. Where We Are Today (Assessment)

The dojo is a **skills & discipline framework for GitHub Copilot agents** — a drop-in tree of markdown skills, a mandatory workflow, a single verification gate, and a self-improvement loop. It has matured through three numbered releases (v1.0 "Hardened", v1.1 "Self-Improving") and is currently accumulating an `[Unreleased]` distribution layer.

### Product surface (as of this writing)

| Area | State | Evidence |
|---|---|---|
| **Skills** | 29 total — 25 core/practical (`skills/`) + 4 optional (`optional-skills/`), tier-tagged, spec-conformant | `skills.md`, `spec/copilot-skills-spec.md` |
| **Personas** | 8 persona briefs + `agents/registry.yaml` as single source (architect, business/solution/platform/security, software/test engineer, TPM) | `agents/` |
| **Mandatory workflow** | `BRAINSTORM → WORKTREE → PLAN → EXECUTE → TEST → REVIEW → FINISH → LEARN`, each arrow backed by a flow skill | `skills.md` |
| **Verification gate** | `scripts/verify.sh` (+ `run-checks.ps1`) — spec/plan/tests/all modes; drift detection for `skills.md`, persona registry, `DOJO_ROOT` hygiene | `AGENTS.md` → Testing |
| **Self-improvement** | Curator state machine (`active → stale → archived`), durable backups, per-run audit, 3-layer provenance, idle-tick trigger | CHANGELOG v1.1 |
| **CLI** (`cli/dojo_cli`) | Optional Python CLI: registry-driven commands, marketplace, scanner, profiles, generator | `cli/dojo_cli/registry.py` |
| **Control plane** | TS monorepo (Drizzle/Postgres + Hono API + React UI + `mcp-memory` stdio server); Memory Browser, Time Machine, Time Slider | `control-plane/README.md` |
| **Memory** | `memory/` Obsidian-compatible vault; MCP memory server wired via Install flow | `docs/memory-mcp.md` |
| **MCP** | `mcp/registry.yaml` + 8 server manifests (azure, fetch, filesystem, git, github, ms-graph, playwright, postgres) | `mcp/servers/` |
| **Traceability (red-thread)** | TOGAF requirement cascade (BR→FR/NFR→IR/TR/SR), derivation skills, traceability gate, RTM | PR #8 |
| **Distribution** | One-command bootstrap (`install.sh`/`install.ps1`), `npx copilot-dojo init` v0.1, tag-driven npm publish | PRs #22, #29, #30 |
| **CI enforcement** | `dojo-enforce.yml` split into gradable jobs; Spec/Installer/Traceability/Plan/MCP-memory promoted to **required** checks | PRs #15–#28 |

### Recent momentum (last ~25 PRs)

Four clear streams are already in flight, which the roadmap below formalizes rather than invents:

1. **Distribution & onboarding** — installers, npx initializer, npm publish pipeline.
2. **Self-improvement hardening** — gate-aware curator promotion, traceability test harness.
3. **Control-plane / memory** — MCP memory server promoted to a required CI check.
4. **CI as product contract** — incrementally promoting jobs from informational → required.

### Honest gaps & risks (today)

- **In-flight branches not yet merged:** `feat/cli-plugin-marketplace`, `feat/one-command-installer`, `feature/red-thread`, plus an untracked `linkedin/` + `.github/plugin/` + `plugin.json` working set. Direction is real but unconsolidated.
- **Two stories straddle "platform" boundaries** (CLI marketplace vs. control-plane UI install) with overlapping install responsibilities — risk of two install paths drifting.
- **Supply-chain surface grows with every new dependency** (control-plane TS deps, CLI PyPI deps, npm publish). Policy exists (`AGENTS.md` → Supply Chain) but must scale with distribution.
- **No published adoption/efficacy metrics** — we ship discipline but cannot yet show it changes agent behavior.
- **Windows/bash parity** is a recurring tax (jq prereq, PowerShell wrappers) that every new script must pay.

---

## 2. Product Themes

Five durable themes carry the roadmap. Each "Now/Next/Later" initiative maps to exactly one.

- **T1 · Distribution & Adoption** — make the dojo trivial to install, update, and trust in any repo.
- **T2 · Skill Quality & Coverage** — keep the 29-skill catalog sharp, fill real gaps, retire dead weight.
- **T3 · Self-Improvement & Telemetry** — close the loop from lessons → skills → measurable behavior change.
- **T4 · Control Plane & Memory** — the visual + MCP surface for browsing, installing, and remembering.
- **T5 · Trust, Security & Supply Chain** — keep the attack surface small as distribution widens.

---

## 3. Roadmap — Now / Next / Later

### NOW (current cycle — finish what's in flight)

- **N1 · T1 · Consolidate the distribution story.** Land/merge the in-flight installer + npx + npm-publish work behind one documented "Enter the Dojo" path; deprecate or clearly subordinate the secondary path. Resolve the untracked `plugin.json` / `.github/plugin/` working set into a real branch + PR or remove it.
  - *Success:* one canonical install command in README; `install.sh`, `install.ps1`, and `npx copilot-dojo init` all land the same bundle and pass `verify.sh spec`; zero untracked product files on `main`.
  - *Depends on:* nothing external; needs branch hygiene.
- **N2 · T5 · Lock the supply-chain gate to match distribution.** Extend `dojo-enforce.yml` to enforce the `AGENTS.md` Supply Chain table on **all three** ecosystems (Actions SHA-pinning, PyPI ceilings, npm lockfile) now that we publish to npm.
  - *Success:* CI fails on any unpinned `uses:`, any bare `>=X.Y.Z`, or a missing/uncommitted lockfile; documented in `SECURITY.md`.
  - *Depends on:* N1 (publish pipeline must exist to guard).
- **N3 · T2 · Catalog audit pass.** Run the curator in `--dry-run` across all 29 skills; confirm each maps to a required body section and a `verify.sh` check; flag any "should" without a verifiable assertion (spec invariant).
  - *Success:* `verify.sh --check` green; an audit note in `tasks/lessons.md` listing any skills that need amendment.
  - *Depends on:* nothing.
- **N4 · T4 · Control-plane "first-run" hardening.** Make `docker compose up` → `pnpm dev` work from a clean clone with documented prereqs; ensure `mcp-memory` build + the required CI check stay green.
  - *Success:* a fresh-clone smoke script brings up API+UI+MCP and the install flow writes a valid `.mcp.json`.
  - *Depends on:* nothing.

### NEXT (following cycle — extend the platform)

- **X1 · T1 · Versioned releases + upgrade path.** Cut a tagged `v1.2` that bundles the distribution layer; ship `dojo upgrade` (or installer re-run) with a documented, provenance-aware diff so users on v1.0/v1.1 can move forward safely.
  - *Success:* `CHANGELOG.md` v1.2 section; idempotent upgrade preserves `tasks/`, `memory/`, and user-authored skills (already a design goal of `install.sh`).
  - *Depends on:* N1.
- **X2 · T2 · Fill the highest-value skill gaps.** Prioritize candidate skills the workflow implies but doesn't yet cover (e.g., incident/rollback discipline, dependency-update review, observability-by-default). Author 2–4 via `optional-skills/writing-skills`.
  - *Success:* each new skill ships with `scripts/` + `tests/` where it has deterministic logic and passes the gate; net catalog count is documented in the generated index, not hardcoded.
  - *Depends on:* N3 audit.
- **X3 · T3 · Efficacy telemetry (opt-in, local-first).** Extend `.dojo/skill-usage.json` telemetry into a privacy-preserving local report: which skills load, which workflow arrows fire, where agents skip the pipeline. No network egress by default.
  - *Success:* `scripts/curator.sh report` (or a new `metrics` verb) emits a per-clone behavior summary; documented opt-in only.
  - *Depends on:* existing curator telemetry.
- **X4 · T4 · Marketplace ↔ control-plane unification.** Make the CLI marketplace and the control-plane Install page share one install contract (one manifest, one provenance record) so the two surfaces never drift.
  - *Success:* a single documented install spec consumed by both `cli/dojo_cli/marketplace.py` and the UI; conformance test in CI.
  - *Depends on:* N1.
- **X5 · T5 · Threat model doc.** Write `docs/threat-model.md` covering the installer (remote `curl|bash`), MCP servers, and control-plane DB — referencing the litellm/Shai-Hulud rationale already in `AGENTS.md`.
  - *Success:* documented trust boundaries + mitigations; linked from `SECURITY.md`.
  - *Depends on:* N2 gate.

### LATER (exploratory — validate before committing)

- **L1 · T3 · Lesson → skill auto-promotion (assisted).** Move beyond deferred amendments toward a reviewed pipeline where recurring `tasks/lessons.md` patterns are proposed as skill diffs for human/board approval. Cache-aware by default (per `AGENTS.md` → Cache-Aware Mutations).
- **L2 · T1 · Multi-agent-platform reach.** Evaluate whether the skill spec can target runtimes beyond Copilot (the dojo already cites the hermes-agent reference build). Spike a portability layer; do **not** commit until a second runtime is validated.
- **L3 · T4 · Hosted/shared control plane.** Explore a team-shared deployment (auth, multi-repo, shared memory vault) — gated on X5 threat model and a real demand signal.
- **L4 · T2 · Persona expansion + skill bundles per persona.** Richer `default_skills` bundles tied to each of the 8 personas, validated against the registry as the single source of truth.

---

## 4. Sequencing & Dependencies (at a glance)

```
NOW   N1 consolidate distribution ─┬─► NEXT X1 versioned release ──► LATER L2 multi-runtime
                                   ├─► NEXT X4 install unification ─► LATER L3 hosted control plane
NOW   N2 supply-chain gate ────────┴─► NEXT X5 threat model
NOW   N3 catalog audit ────────────────► NEXT X2 fill gaps ────────► LATER L4 persona bundles
NOW   N4 control-plane first-run
                                       NEXT X3 efficacy telemetry ─► LATER L1 lesson auto-promote
```

Critical path: **N1 distribution** unblocks the most downstream work. N2/T5 (security) is a hard gate that rides alongside every distribution step, not after it.

---

## 5. Success Metrics

Tracked per-theme; all observable from the repo, CI, or local telemetry (no analytics SaaS required).

| Theme | Leading metric | Target signal |
|---|---|---|
| T1 | # of documented install paths; fresh-clone install success | Exactly 1 canonical path; clean `verify.sh spec` from `npx` + both installers |
| T2 | % skills with a verifiable `verify.sh` assertion per "should" | 100%; `verify.sh --check` green on every PR |
| T3 | Workflow-arrow fire rate from telemetry | Pipeline followed on ≥ baseline% of multi-step tasks |
| T4 | Install-contract parity (CLI vs UI) | Single shared manifest; conformance test passes |
| T5 | Unpinned deps / missing lockfiles caught by CI | 0 escape past required checks; threat model published |

> All targets are **directional until the board sets baselines.** The first job of X3 is to establish honest baselines before claiming improvement.

---

## 6. Risks & Constraints

- **Supply chain (highest).** Distribution widens attack surface; the `curl|bash` installer is itself a trust decision. Mitigation: enforce the `AGENTS.md` Supply Chain table in CI across Actions/PyPI/npm, publish a threat model, keep the dojo dependency-light (the CLI is "a convenience, never a hard dependency").
- **Two install surfaces drifting** (CLI marketplace vs. control-plane UI). Mitigation: X4 unification with a single install contract + conformance test.
- **Cache-invalidation cost.** Any mid-session skill/index mutation invalidates Copilot's prompt cache. Mitigation: keep deferred-by-default amendments (`scripts/lesson-updater.sh`); L1 auto-promotion must stay cache-aware.
- **Canonical scaffold integrity.** `tasks/todo.md` must remain a scaffold in this repo. Mitigation: the `Plan sanity` required check already guards it; this roadmap lives in `docs/`, not in the scaffold.
- **Windows/bash parity tax.** Every new script needs a `.ps1` mirror and must honor `DOJO_ROOT`. Mitigation: treat parity + path hygiene as part of the `verify.sh` gate (already enforced).
- **Metric honesty.** Shipping "discipline" without efficacy data is a credibility risk. Mitigation: X3 telemetry establishes baselines before any improvement claim.

---

## 7. Approval Request

This is a **draft for board ratification (WAS-14).** Requesting approval to:

1. Adopt the five themes (T1–T5) as the dojo's product spine.
2. Commit the **NOW** column (N1–N5) as the active cycle.
3. Treat **NEXT/LATER** as directional, re-reviewed each cycle.

No item here is committed work until the board approves. On approval, NOW initiatives convert to tracked issues following the repo workflow (plan → branch → verify), and this doc becomes the roadmap of record.
