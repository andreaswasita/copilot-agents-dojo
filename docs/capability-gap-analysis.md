# Capability Gap Analysis & Parity Roadmap

> **Status:** DRAFT — analysis for prioritization, not a plan of record. Items
> below become tracked work only after they are accepted and converted to
> issues/PRs following the repo workflow (plan → branch → verify).
>
> **Owner:** CTO (agent) · **Last updated:** 2026-06-05 · **Compared against:**
> a leading peer agentic starter kit (a one-command Copilot agent installer with
> a plugin marketplace and a telemetry-driven learning loop).
>
> This document maps the gaps onto the existing product themes (T1–T5) defined
> in [`ROADMAP.md`](./ROADMAP.md). It does **not** modify `tasks/todo.md`
> (canonical scaffold per `AGENTS.md` → Task Plan Policy).

---

## 1. Why this comparison

The peer kit and this Dojo solve overlapping problems from opposite ends:

- **The peer kit** optimizes for **distribution and developer experience** — a
  one-command, zero-dependency installer that wires several upstream pillars
  into a complete agentic coding environment, with a marketplace, a guided TUI,
  lifecycle management, and a telemetry-driven learning loop.
- **The Dojo** optimizes for **governance rigor** — a formal skill spec, a
  single verification gate, TOGAF traceability, a control plane, and
  supply-chain enforcement as required CI.

The two are complementary (we have already contributed the Dojo's anti-drift
spec gate upstream to the peer ecosystem). This analysis captures **where the
peer kit is ahead**, so we can close the distribution/UX/lifecycle gap without
giving up the governance lead.

---

## 2. Side-by-side snapshot

| Dimension | Peer kit | Copilot Agents Dojo (this repo) |
|---|---|---|
| Primary CLI | Compiled **single binary** (cross-platform release pipeline) | **Python** CLI (`pip install -e`) |
| Install entry | One `npx … init` command (downloads platform binary, no toolchain) | `install.sh`/`install.ps1` + `npx copilot-dojo init` (newer/thinner) |
| Installer UX | **Guided TUI** — wizard, presets, multi-stack selection | Non-interactive scripts |
| Lifecycle | Install manifest + **drift detection** + doctor + update + preserve-modified uninstall | **None** (no manifest, drift, or uninstall) |
| Marketplace | Tiered plugins (everything / agents / packs / per-skill) across multiple runtimes, drift-validated | Minimal; `plugin.json`/`marketplace.json` not on `main` |
| Learning loop | Observer hooks → observation log → instincts (confidence) → promote into skills | Curator lifecycle + manual lessons (no tool-use capture, no confidence promotion) |
| Security skill | One-pass audit — config rules + OWASP Top-10 + STRIDE, deterministic+LLM, persisted reports, `fix` mode | `derive-security-from-risk` (requirements-side only — no scanner) |
| Browser/QA | Bundled browser-automation + live QA / benchmark commands | None |
| Pipeline orchestration | Single command chains the full sprint, plus a parallel swarm variant | Discrete workflow skills, no single orchestrator |
| Surface | 45+ skills / 51 agents as slash commands + generated prompt shims | 26 skills / 8 personas, no slash/prompt-shim layer |
| Onboarding | External **guided training quest** (gamified) | README + docs |
| **Spec/governance gate** | Adopted (via our upstream contribution) | **Formal spec + `verify.sh` invariant gate** ✅ lead |
| **Traceability** | None | **Red-thread TOGAF cascade + RTM** ✅ lead |
| **Control plane** | None | **TS monorepo: Postgres + API + React UI + MCP-memory** ✅ lead |
| **Supply chain** | SHA-pin workflow | SHA-pin + **required CI gate** ✅ lead |

---

## 3. Gaps (what the peer kit has that we lack)

Each gap is tagged with its target theme and a rough effort (S/M/L).

| # | Gap | Theme | Effort | Why it matters |
|---|---|---|---|---|
| G1 | **Zero-dependency binary distribution** — ship a single self-contained CLI installable with no Python/Node toolchain | T1 | L | Python `pip install -e` is the #1 adoption friction; the "no toolchain" `npx` path is the peer kit's biggest DX advantage |
| G2 | **Install manifest + drift detection + clean uninstall** — checksummed manifest, drift/doctor command, preserve-modified uninstall | T1 | M | We can install but cannot *update, diagnose, or remove* cleanly; this is table stakes for trust |
| G3 | **Guided TUI installer** — interactive wizard with presets and multi-stack selection | T1 | M | Lowers the barrier for first-run; pairs with G1 |
| G4 | **Tiered plugin marketplace** — everything / agents / category packs / per-skill, generated from templates and drift-validated | T1/T4 | M | Granular adoption; we already started this on an unmerged branch — finish and land it |
| G5 | **Telemetry-driven learning loop** — observer hooks → observations → confidence-scored instincts → graduate into skills | T3 | L | Our self-improvement is manual; the peer loop makes the repo measurably smarter per session |
| G6 | **Real security-audit skill** — config rules + OWASP + STRIDE, deterministic+LLM tiers, persisted idempotent reports, `fix` mode | T2/T5 | M | We derive security *requirements* but cannot *audit* a repo; high-value, governance-aligned |
| G7 | **Browser automation / live QA skills** — drive a real browser for QA, screenshots, benchmarks | T2 | M | Whole test surface the peer kit covers and we don't |
| G8 | **One-command pipeline orchestration** — a command chaining plan→…→review→test→learn, plus a parallel variant | T2 | M | We have the steps but no single "run the sprint" entry point |
| G9 | **Slash-command + prompt-shim surface** — expose skills/personas as discoverable slash commands with generated shims | T2/T1 | M | Discoverability and activation; the peer kit's primary UX |
| G10 | **Autonomous metric hill-climbing** — an experiment loop on a dedicated branch with a results log | T3 | L | Differentiated capability for measurable tasks (perf, bundle size, pass rate) |
| G11 | **Gamified guided onboarding** — a training quest / first-run tour | T1 | S | Onboarding polish; cheapest win on the list |
| G12 | **Knowledge-compounding retrieval into planning** — a `learnings-researcher`-style agent that auto-searches prior decisions/solutions at plan time | T3 | M | We *store* memory (vault + MCP) but don't *retrieve* it into planning automatically; closes the loop on assets we already have |
| G13 | **Safety-guardrail skills** — discrete invokable guards that flag and gate destructive commands (`rm -rf`, force-push) via a non-zero exit code (a heuristic speed bump, not a sandbox) and freeze/guard a working tree | T5 | S | We have safety *rules* in instructions, but not enforced as discoverable skills/hooks; governance-aligned, cheap |
| G14 | **Stack auto-detection** — detect the repo's stack(s) and pre-select relevant skill packs | T1 | M | Removes manual selection; feeds the guided TUI (G3) and presets (G15) |
| G15 | **Install presets (Starter / Pro / Full)** — tiered install depth | T1 | S | Lets first-runs pick a footprint; pairs with the TUI (G3) |
| G16 | **Deploy / canary / production-verification skills** — extend past PR into merge→deploy→verify→monitor | T2 | L | Our workflow stops at PR; the peer kit covers the post-merge lifecycle |
| G17 | **Cross-model review** — adjudicate a second, independent model's review of a change | T2 | M | Independent second-model review catches what one model misses |
| G18 | **Explicit behavioral-foundation skill** — surface our discipline as a discoverable, installed skill (not just instructions) | T2 | S | The peer kit ships its behavioral guardrails as a skill; ours lives only in instructions, so it isn't independently discoverable/portable |

---

## 3.1 Memory: peer model vs ours

The peer kit's memory is **plain-file, git-committed, local-first — no database,
no vector store, no MCP server.** Its power is not storage but a *capture →
promote → propagate* loop wired into the workflow:

| Layer | Where | Timescale |
|---|---|---|
| Observations | `.<kit>/observations.jsonl` | per-session, gitignored, ephemeral |
| Instincts (confidence-scored) | `.<kit>/instincts/project.yaml` | grows each session, **committed** |
| Evolved skills | `.github/skills/learned-*/` | permanent |
| Institutional knowledge | `docs/solutions/*.md` | permanent |
| Design decisions | `docs/brainstorms/*.md` | permanent |
| Plans | `docs/plans/*.md` | per-feature |
| Install manifest | install-manifest (checksums) | per-install |

Three reinforcing cycles:
- **Knowledge compounding** (per-PR): a "compound" step saves solved problems →
  a researcher agent auto-finds them on the next plan → fewer repeated mistakes.
- **Pattern learning** (per-session): observer hooks → a `learn` step →
  confidence-scored instincts → an `evolve` step graduates mature ones (>0.8)
  into permanent skills.
- **Team propagation** (per-commit): instincts are committed, so the whole team
  inherits learned conventions without a style guide.

**Where we stand by contrast.** Our memory is *infrastructure-richer* — an
Obsidian-compatible vault (`memory/` with decisions/patterns/preferences/
sessions, a link graph, `scripts/memory-query.sh`), an `@dojo/mcp-memory` MCP
server, and the control plane's Postgres-backed Memory Browser + Time Machine —
but it is **populated manually**. We lack the automatic *capture* (tool-use
observations) and *promotion-by-confidence* (instincts → skills) that make the
peer's memory compound on its own. The gap is the **loop, not the store**:
G5 (capture → promote) and G12 (retrieve into planning) together close it on top
of memory infrastructure we already have.

---

## 4. Prioritization (Now / Next / Later)

Sequenced by leverage and dependency. Effort and theme carried from §3.

### NOW — close the trust + adoption floor
- **G2 · Install manifest + drift + uninstall** *(M)* — highest trust ROI; unblocks any serious distribution. No external dependency.
- **G4 · Finish & land the tiered marketplace** *(M)* — work already started on a branch; consolidating it removes an in-flight loose end and gives granular adoption today.
- **G6 · Security-audit skill** *(M)* — directly governance-aligned (plays to our strength), self-contained, immediately useful in any repo.
- **G13 · Safety-guardrail skills** *(S)* — cheap, governance-aligned, high safety value; no dependency.
- **G18 · Behavioral-foundation skill** *(S)* — surface existing discipline as a discoverable skill; near-zero cost.

### NEXT — lower the install barrier + close the test surface
- **G1 · Binary distribution** *(L)* — the big DX unlock; depends on G2's manifest format being settled first.
- **G3 · Guided TUI** *(M)* — rides on G1/G2.
- **G14 · Stack auto-detection** *(M)* + **G15 · Install presets** *(S)* — feed the TUI; do alongside G3.
- **G8 · Pipeline orchestrator** *(M)* — compose existing skills; depends on G9 for clean command surface.
- **G9 · Slash-command + prompt shims** *(M)* — discoverability layer that G8 and the marketplace both benefit from.
- **G12 · Knowledge-compounding retrieval into planning** *(M)* — wire a researcher step over our existing vault/MCP memory.
- **G7 · Browser/QA skills** *(M)* — independent; schedule when test-surface parity is the priority.

### LATER — differentiated, validate first
- **G5 · Telemetry-driven learning loop** *(L)* — powerful but must stay cache-aware (per `AGENTS.md` → Cache-Aware Mutations) and privacy-preserving (local-first, opt-in). Pairs with G12 to close the memory loop.
- **G10 · Autonomous metric hill-climbing** *(L)* — spike on a real measurable task before committing.
- **G16 · Deploy / canary / production-verification skills** *(L)* — needs real deploy targets; validate demand first.
- **G17 · Cross-model review** *(M)* — opportunistic; depends on a second model being available.
- **G11 · Gamified onboarding** *(S)* — polish; do opportunistically once G1/G3 exist.

```
NOW   G2 manifest/drift/uninstall ──► NEXT G1 binary dist ──► NEXT G3 guided TUI ──► LATER G11 onboarding
                                                              ▲   G14 detect + G15 presets
NOW   G4 marketplace ───────────────► NEXT G9 slash/shims ──► NEXT G8 orchestrator
NOW   G6 security audit ; G13 guards ; G18 foundation skill
                                      NEXT G12 retrieve-into-plan ─► LATER G5 learning loop ; G10 metric hill-climb
                                      NEXT G7 browser/QA
                                      LATER G16 deploy/canary ; G17 cross-model review
```

Critical path: **G2 → G1**. The manifest schema designed in G2 is the
foundation the binary installer (G1), TUI (G3), drift/doctor, and uninstall all
build on.

---

## 5. What we deliberately are NOT copying

- **Bundling external upstream pillars wholesale** — that is the peer kit's
  product identity, not ours. We adopt the *capabilities* (QA, orchestration,
  learning) natively where they fit the governance model, rather than vendoring
  external runtimes.
- **A third-party plugin-marketplace format** as the primary surface — we target
  Copilot first; multi-runtime is a `ROADMAP.md` LATER item (L2), gated on a
  second validated runtime.
- **Anything that weakens the spec/verify gate or traceability** — the
  governance lead is the moat; new capabilities must pass `verify.sh`.

---

## 6. Where we already lead (do not regress)

Formal skill spec + `verify.sh` invariant gate (anti-drift) · red-thread TOGAF
traceability + RTM · the control plane (Postgres + API + React UI + Time Machine
+ MCP-memory) · persona registry as single source · Obsidian memory vault ·
supply-chain enforcement as **required** CI checks.

The peer kit is ahead on distribution, installer UX, lifecycle, marketplace,
telemetry learning, and ready-made security/QA/orchestration skills. We are
ahead on governance rigor, traceability, and the control plane. This roadmap
closes the former without conceding the latter.
