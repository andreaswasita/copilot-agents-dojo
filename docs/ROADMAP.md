# Copilot Agents Dojo — Product Roadmap

> Status: **DRAFT — pending board approval.** Nothing below is committed work until the board approves. Sequencing and scope are proposals, not promises.
>
> Owner: CTO · Last updated: 2026-06-05 · Horizon model: **Now / Next / Later**

---

## 1. Where the product is today

The dojo is a **discipline framework for GitHub Copilot agents** — drop `skills/` + `optional-skills/` + `.github/copilot-instructions.md` into any repo and Copilot agents auto-discover an index and follow a mandatory workflow, gated by a single `scripts/verify.sh`.

Current surface area (source of truth is the filesystem, not these counts):

| Asset | State | Notes |
|---|---|---|
| **Skills** | 25 core/practical + 4 optional = **29** | Verified by spec gate; `skills.md` is generated and drift-checked |
| **Personas** | **8** | architect + 3 TOGAF specialists + security / software / TPM / test engineers; `agents/registry.yaml` drift-checked |
| **Workflow** | BRAINSTORM → WORKTREE → PLAN → EXECUTE → TEST → REVIEW → FINISH → LEARN | Enforced via skills + `.github/copilot-instructions.md` |
| **Verification gate** | `scripts/verify.sh` (+ `run-checks.ps1`) | `spec` mode green: skills/personas/paths/curator all pass, 0 warnings |
| **Curator / self-improvement** | State machine `active → stale → archived`, backups, idle trigger, audit trail | Three-layer provenance guard; never deletes |
| **CLI** | `cli/dojo_cli/` (marketplace + scanner), `npx copilot-dojo init` v0.1 | Convenience layer, never a hard dependency |
| **Control plane** | `control-plane/packages/` = db, server, ui, installer, mcp-memory | TypeScript/pnpm monorepo; earlier-stage than the skill core |
| **MCP** | `mcp/registry.yaml` + servers + memory server | Any MCP-capable agent can read/write the memory vault |
| **Installer** | One-command `install.sh` / `install.ps1` (#30) | Idempotent, provenance-aware, health-gated |
| **CI required checks** | Plan sanity, Traceability, Installer tests, MCP memory tests | Promoted to required over PRs #20–#30 |

**Recent trajectory (last ~10 PRs):** one-command bootstrap installer (#30), tag-driven npm publish (#29), MCP-memory smoke suite promoted to required (#27/#28), Plan-sanity + Traceability + Installer checks promoted to required (#23/#24/#26), self-improvement verification rewritten as observable checks (#25), `npx copilot-dojo init` v0.1 (#22). **Theme:** the project is hardening its enforcement spine and lowering adoption friction.

**Health snapshot:** `scripts/verify.sh spec` → 5 passed / 0 failed / 0 warnings (29 manifest entries, registry in sync). Full `verify.sh` (tests) not run for this roadmap; recommended as a Now-tier baseline (see Theme A).

---

## 2. Strategic themes

1. **Adoption & onboarding** — make first-run trivial and the value obvious in <5 minutes.
2. **Trust & enforcement** — the gate is the product's spine; broaden machine-checkable invariants and supply-chain hardening.
3. **Self-improvement loop** — close the curator/telemetry loop so the dojo measurably gets better with use.
4. **Control plane & distribution** — graduate the TS control plane and CLI marketplace from convenience to a coherent, supported distribution channel.
5. **Authoring ergonomics** — make skills/personas faster to write correctly the first time.

---

## 3. Now (0–4 weeks) — *harden what exists, remove adoption friction*

| # | Initiative | Theme | Rationale | Success metric |
|---|---|---|---|---|
| N1 | **Green full `verify.sh` baseline** (tests + spec + plan) and publish the command + expected output in README | Trust | Roadmap only ran `spec`; need a documented all-green baseline before building on the gate | `verify.sh` (full) green in CI on `main`; documented run in README |
| N2 | **Ship `docs/ROADMAP.md` + link from README/wiki** | Adoption | No public roadmap exists today | Roadmap merged, board-approved, linked from README + wiki Home |
| N3 | **First-run "golden path" doc + asciinema/gif** from `install.sh` → first verified PR | Adoption | Installer exists (#30) but the end-to-end story isn't shown | New user reaches a passing `verify.sh` in <5 min following one doc |
| N4 | **Supply-chain audit pass** — confirm all `uses:` SHA-pinned, all deps have ceilings, lockfiles committed | Trust | AGENTS.md mandates it; verify it holds across recent PRs | `dojo-enforce.yml` passes; zero unpinned actions / uncapped deps |
| N5 | **Curator dry-run on real telemetry** + documented operator runbook | Self-improvement | State machine shipped (1.1) but needs a proven operational story | One documented `curator-tick` dry-run report committed to docs |

**Exit criteria for Now:** full gate green and documented, roadmap approved & published, one-command golden path demonstrable, supply-chain policy verified.

---

## 4. Next (1–3 months) — *close the self-improvement loop, mature distribution*

| # | Initiative | Theme | Rationale | Success metric |
|---|---|---|---|---|
| X1 | **CLI command registry** (`COMMAND_REGISTRY` in `cli/dojo_cli/registry.py`) | Distribution | AGENTS.md already references it as the intended pattern ("Phase 5"); collapses app/help/marketplace/completion to one source | Adding a command = one registry entry; `--help` + completion derive from it |
| X2 | **Skill marketplace v1** — browse/install optional skills via CLI with provenance + integrity checks | Distribution / Trust | `optional-skills/` + scanner exist; turn them into a real install channel | `dojo skill install <name>` works with checksum verification |
| X3 | **Telemetry → curator feedback** — surface skill-usage analytics (most/least used, stale candidates) | Self-improvement | `.dojo/skill-usage.json` is collected but under-exploited | A `dojo skill stats` view + curator recommendations from real data |
| X4 | **Control-plane MVP graduation** — pick the one package (likely `mcp-memory` or `server`) that delivers standalone value and document its supported surface | Control plane | Monorepo has 5 packages at mixed maturity; needs focus | One package documented, tested, and labeled "supported" vs "experimental" |
| X5 | **Authoring linter** — `dojo skill new` scaffolds + pre-validates frontmatter/section-order before `verify.sh` | Authoring | Reduces review round-trips against the HARDLINE spec | New skills pass `verify.sh spec` on first try in >80% of attempts |
| X6 | **Persona expansion review** — assess gaps (e.g., data/ML, SRE, product) and add only with registry + drift checks | Adoption | 8 personas cover core eng; user demand should drive additions | Any new persona ships with registry entry + green drift check |

**Dependencies:** X2/X3/X5 depend on N1 (green gate) and X1 (registry as the CLI backbone). X4 is largely independent but should not divert focus from the skill core.

---

## 5. Later (3–6+ months) — *scale, integrate, differentiate*

| # | Initiative | Theme | Rationale | Success metric |
|---|---|---|---|---|
| L1 | **Multi-repo / org rollout** — profiles, `DOJO_ROOT` multi-instance, org-level policy bundles | Distribution | Profile support exists in scripts; productize for teams | One org runs the dojo across ≥3 repos from a shared policy bundle |
| L2 | **Hosted control plane** (optional) — dashboards for skill usage, gate pass rates, curator activity across repos | Control plane | Natural extension of telemetry once X3 lands | Read-only dashboard over real multi-repo telemetry |
| L3 | **Cross-agent interop** — broaden MCP memory + skills so non-Copilot agents (hermes-agent et al.) consume the same vault/spec | Self-improvement | MCP memory server already targets "any MCP-capable agent" | A second agent runtime reads/writes the vault end-to-end |
| L4 | **Spec v2** — incorporate lessons from real authoring; only after authoring linter (X5) surfaces recurring friction | Authoring | Avoid premature spec churn; let data drive it | Spec v2 RFC backed by ≥10 documented authoring lessons |
| L5 | **Marketplace network effects** — community-contributed skills with signed provenance + curation queue | Distribution / Trust | Extends X2 once integrity story is proven | External contributor lands a signed skill via the marketplace |

---

## 6. Sequencing & dependency map

```
Now:  N1 ─┬─> X1 ─┬─> X2 ─┬─> L1 ─> L2
          │       ├─> X3 ─┘        └─> L3
N2/N3 ────┘       ├─> X5 ─> L4
N4 ───────────────┘
N5 ───────────────> X3
                  X4 (parallel) ─> L2
                  X6 (demand-driven, parallel)
```

Critical path: **N1 (green gate) → X1 (CLI registry) → X2/X3/X5 → L-tier scale-out.** Everything downstream of distribution assumes a trustworthy gate and a single CLI backbone.

---

## 7. Risks & constraints

- **Supply chain (load-bearing).** AGENTS.md adopted strict pinning after the litellm and Shai-Hulud incidents: GitHub Actions pinned to commit SHA + version comment; PyPI/npm deps `>=floor,<next_major` with committed lockfiles; `dojo-enforce.yml` fails on unpinned `uses:`. **Every roadmap item that touches CI or deps must honor this — no exceptions.**
- **Canonical scaffold integrity.** `tasks/todo.md` must stay in scaffold form in this repo (Plan-sanity required check). No roadmap item may replace it with a working plan. This roadmap lives in `docs/ROADMAP.md`, not in the task scaffold.
- **Cache-aware mutations.** Mutating skills / `skills.md` / `copilot-instructions.md` mid-session invalidates Copilot's prompt cache and raises cost. Authoring/curator work must default to **deferred** invalidation.
- **No change-detector tests.** New verification must assert invariants, not snapshot counts/versions — or it fails on every legitimate change.
- **Control-plane scope creep.** 5 TS packages at mixed maturity are a distraction risk. Deliberately constrained to one graduated package (X4) before any hosted ambition (L2).
- **Curator must never delete.** Max destructive action is archive; every mutating run backs up first. Any self-improvement automation inherits this invariant.
- **CLI is convenience, never a hard dependency.** The skills + gate must remain fully usable with zero Python.

---

## 8. Success metrics (rollup)

- **Adoption:** time-to-first-verified-PR < 5 min via one-command install; roadmap + golden-path docs live.
- **Trust:** full `verify.sh` green on `main`; 100% supply-chain policy compliance; required-check set stable.
- **Self-improvement:** curator runs on real telemetry with documented reports; `skill stats` surfaces actionable signal.
- **Distribution:** CLI command registry live; marketplace install with integrity checks; one supported control-plane package.
- **Authoring:** >80% of new skills pass `verify.sh spec` on first attempt after the scaffold/linter lands.

---

## 9. Approval

This roadmap is a **proposal**. Per the issue scope and AGENTS.md workflow (BRAINSTORM → PLAN → … with board approval before committed work), **no item is committed until the board approves.** On approval, Now-tier items (N1–N5) become candidate issues; Next/Later remain directional until pulled forward.

**Board decision requested:** approve Now/Next/Later framing and the N1–N5 Now-tier slate, or redirect priorities.
