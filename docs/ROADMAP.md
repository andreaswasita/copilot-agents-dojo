# Product Roadmap — Copilot Agents Dojo

> **Status:** Draft for board approval · **Owner:** CTO · **Horizon:** rolling 2-quarter
> **Baseline:** `main` @ PR #30 (one-command installer) · **Version:** v1.1
> **Last updated:** 2026-06-05

This is the **product** roadmap — the strategic Now / Next / Later view for the board.
It complements, and does not replace, the engineering-level
[Roadmap & Gaps](https://github.com/andreaswasita/copilot-agents-dojo/wiki/Roadmap-and-Gaps)
wiki page, which tracks fine-grained gaps and good-first-issues. Where the two overlap,
the wiki is the task-level source of truth; this doc is the prioritized narrative.

---

## 1. Where the Product Is Today (v1.1)

Ground truth from the filesystem on `main`:

- **29 skills** across three tiers — 25 always-discoverable in `skills/` + 4 opt-in in `optional-skills/`
  (Core Kata, Flow Waza, Practical Kumite, Red-Thread/TOGAF, Meta Dō).
- **8 agent personas** — generalist `architect`, three TOGAF specialists
  (`business-architect`, `solution-architect`, `platform-architect`), plus
  `security-engineer`, `software-engineer`, `technical-program-manager`, `test-engineer`.
  Single source of truth in `agents/registry.yaml`; `verify.sh` blocks drift.
- **Mandatory workflow** — `BRAINSTORM → WORKTREE → PLAN → EXECUTE → TEST → REVIEW → FINISH → LEARN`,
  each arrow enforced by a flow skill.
- **Single gate** — `scripts/verify.sh` (`spec / plan / tests / all` modes), Windows parity via `run-checks.ps1`.
- **11 required CI checks** on `main` via `.github/workflows/dojo-enforce.yml`
  (CodeQL, spec invariants, traceability, installer tests, MCP-memory tests, plan sanity, Action SHA-pinning, …).
- **Self-improving curator** — `active → stale → archived` state machine, tar.gz backups with reversible rollback,
  idle-gated trigger, three-layer provenance guard.
- **Memory layer** — Obsidian-compatible Memory Vault + `@dojo/mcp-memory` MCP server + Time Machine.
- **CLI marketplace** (`cli/dojo_cli/`) — interactive picker, profiles, generator, scanner.
- **Control plane** (`control-plane/`) — web UI + API to browse/search/install skills & agents (packages: `db`, `installer`, `mcp-memory`, `server`, `ui`).
- **Distribution** — `npx copilot-dojo init` zero-install bootstrap (6 presets) + tag-driven npm publish workflow with sigstore provenance (wired, awaiting first tag/`NPM_TOKEN`).

**Maturity read:** this is a working v1.1 framework, not a prototype. The remaining work is about
**distribution reach, discoverability, and closing the verify loop beyond unit tests** — not core mechanics.

---

## 2. Strategic Themes

| # | Theme | Why it matters | Primary horizon |
|---|-------|----------------|-----------------|
| T1 | **Distribution & frictionless adoption** | A framework only compounds if it spreads. The installer + publish pipeline exist; the first registry release (`copilot-dojo` 0.1.0) shipped — `npx copilot-dojo init` now works without a `github:` ref. | Now |
| T2 | **Discoverability of skills** | Auto-activation is elegant but invisible; users can't list/invoke skills. Hurts trust and adoption. | Next |
| T3 | **Closing the verify loop** | `verify-before-done` stops at unit tests; real verification needs browser/E2E/production smoke. | Next |
| T4 | **Compounding knowledge cross-repo** | In-repo memory loop is closed; lessons don't yet travel between repos. | Later |
| T5 | **Governance & supply-chain hardening** | The framework's credibility *is* its discipline. Keep the gate and supply-chain posture ahead of adoption. | Continuous |

---

## 3. Now / Next / Later

### 🟢 NOW — current cycle (commit-ready, low risk)

| Initiative | Theme | Deliverable | Depends on | Effort |
|---|---|---|---|---|
| **N4. Triage dependabot PR #21** | T5 | Decide pytest `8.3.3 → 9.0.3`; merge or pin with rationale | CI green | S |
| **N5. Doc & badge hygiene** | T1 | README skill/persona badges match reality; fix stale cross-links; reference generated index instead of hardcoded counts | none | S |

**Now exit criteria:** ~~registry release live~~ ✅; ~~`verify.sh --check` fully green~~ ✅; dependabot triaged; docs accurate.

### 🟡 NEXT — following cycle (1–2 sprints out)

| Initiative | Theme | Deliverable | Depends on | Effort |
|---|---|---|---|---|
| **X1. Slash-command surface for skills** | T2 | `slash:` frontmatter field → generated `.github/prompts/*.prompt.md`; `/dojo-help` listing | spec bump | M |
| **X2. Stack auto-detection in installer/CLI** | T1/T2 | Detect `package.json`/`pyproject.toml`/`pom.xml`/`go.mod`/`*.csproj` → emit stack-specific `copilot-instructions.md` | scanner heuristics | M |
| **X3. `browser-verify` skill + `scripts/browser-check.sh`** | T3 | Playwright-backed verification step, optional gate in `verify.sh`, screenshot + `tasks/verify-report.md` | Playwright pin (supply-chain review) | M |
| **X4. In-repo skill catalog** | T2 | Auto-generated `docs/skills/` per-skill pages from SKILL.md frontmatter | X1 frontmatter | M |
| **X5. `scripts/wiki-sync.sh` drift check** | T5 | CI fails when repo state and wiki drift (counts/links) | none | S |

**Next exit criteria:** skills are listable/invokable; installer adapts to the host stack; the verify loop covers a browser path; wiki drift is caught by CI.

### 🔵 LATER — strategic bets (validate before committing)

| Initiative | Theme | Deliverable | Risk to retire first |
|---|---|---|---|
| **L1. Cross-repo lesson sharing** | T4 | `dojo lessons publish/subscribe`; anonymised portable lesson schema | Privacy/PII leakage; schema portability |
| **L2. Effectiveness scoring** | T4 | Per-rule pre/post error metrics; auto-revise low-value rules | Signal quality; measurement overhead |
| **L3. Automated lesson harvesting** | T4 | Agent auto-appends candidate lessons on correction; `lessons.md` → queryable graph | Noise/false positives; context cost |
| **L4. `e2e-test-writing` + `production-smoke-check` skills** | T3 | E2E discipline + post-deploy 2xx/timing smoke | Overlap with X3; environment access |
| **L5. VS Code extension** | T2 | Sidebar of active skills, one-click load | Maintenance surface vs. value |
| **L6. New personas & stacks** | T2 | `devops-engineer`, `sre`, `data-engineer`, `ml-engineer`, …; Rust/Ruby/Kotlin/Swift examples | Demand-driven; keep registry lean |

---

## 4. Sequencing & Dependencies

```
NOW    N2 ✅┐
       N3 ✅┼─► verify.sh --check GREEN ✅ ──► (unblocks confident releases)
       N1 ✅┘            │
       N4 ───────────────┘
       N5 (parallel, no deps)

NEXT   X1 ─► X4 (catalog needs slash/frontmatter)
       X2 (parallel)
       X3 ─► L4 (e2e/smoke extend browser-verify)
       X5 (parallel; pairs with WAS-13 wiki sync)

LATER  L1 ─ L2 ─ L3  (knowledge-graph cluster, sequence after T4 schema lands)
       L5, L6 demand-gated
```

**Critical path to a credible public launch:** ~~N1 (npm release)~~ ✅ → ~~N2/N3 (green gate)~~ ✅ → X1 (discoverability) → X3 (verify loop). Everything else is parallelizable or demand-gated.

---

## 5. Success Metrics

| Theme | Leading indicator | Target (this horizon) |
|---|---|---|
| T1 Distribution | npm weekly installs; `init` runs | First release live; >0 external installs |
| T1 Distribution | Time-to-first-green-PR in a fresh repo | < 30 min from `init` |
| T2 Discoverability | % skills invokable via slash command | 100% of core/practical tier |
| T2 Discoverability | `/dojo-help` usage in sessions | Adopted in onboarding docs |
| T3 Verify loop | Skills with a browser/E2E verification path | ≥ 1 shipped (`browser-verify`) |
| T4 Knowledge | Lessons shared cross-repo | Schema + 1 publish/subscribe round-trip |
| T5 Governance | Required CI checks green on `main` | 11/11, `verify.sh --check` clean |
| T5 Governance | Unpinned Actions / unbounded deps | 0 (enforced by gate) |

---

## 6. Risks & Constraints

**Supply-chain policy (from `AGENTS.md`, adopted after the litellm & Shai-Hulud incidents) is binding on every roadmap item:**

- **GitHub Actions** — pin to commit SHA + version comment (`uses: actions/checkout@<sha>  # v4`). `dojo-enforce.yml` fails the build on unpinned `uses:`.
- **PyPI / npm deps** — `>=floor,<next_major`; bare `>=X.Y.Z` without a ceiling is rejected at review. Lockfiles committed.
- **Shell binaries** — document expected version in Prerequisites.
- New surfaces (Playwright for X3, any npm publish tooling) must clear this policy **before** landing.

**Other constraints & risks:**

- **Canonical scaffold guard** — `tasks/todo.md` must stay in scaffold form; the `Plan sanity` required check blocks PRs that replace it with a real plan. Roadmap work plans live in PR descriptions / issues, never in `tasks/todo.md`.
- **Cache-aware mutations** — changes to skills, `skills.md`, or `copilot-instructions.md` invalidate Copilot's prompt cache; default to deferred invalidation (`--now` only when correctness requires it).
- **Distribution gating (N1)** — ~~first npm release needs `NPM_TOKEN` or trusted publishing~~ ✅ shipped: `copilot-dojo` 0.1.0 published to npm with sigstore provenance (tag `copilot-dojo-v0.1.0`).
- **Scope creep on personas/stacks (L6)** — keep `agents/registry.yaml` lean; add personas on demonstrated demand, not speculatively.
- **Verify-loop overlap (X3 ↔ L4)** — sequence E2E/smoke after `browser-verify` to avoid duplicate Playwright surfaces.

---

## 7. Governance

- This roadmap is a **proposal pending board approval** (per WAS-14). No item below NOW is committed work until the board approves.
- On approval, the project lead decomposes NOW initiatives into tracked issues and delegates to CTO / Architect / specialist personas.
- Revisited each cycle; "Recently Closed" items graduate to the wiki's history table.
