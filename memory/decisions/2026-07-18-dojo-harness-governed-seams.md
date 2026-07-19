---
type: decision
date: 2026-07-18
status: proposed  # proposed | accepted | superseded | deprecated
tags: [harness, governance, security, architecture, enforcement]
superseded-by: null
---

# The Dojo Harness — governed seams for agent actions

## Context

The dojo trains agents with **discipline**, but it does not yet **harness** them.

Today, enforcement is two things:

1. **Guidance** — skills (`privacy`, `secret-scanning`, `pii-detection`, `risk`,
   `verify-before-done`) that *ask* the agent to behave.
2. **A post-hoc gate** — `scripts/verify.sh`, run in CI or pre-PR, that checks the
   result *after* the work is done.

Both are real, and both leave the same hole: **nothing intercepts the agent at the
moment its intent becomes a real action.** A skill is an instruction the agent can
reason its way around; `verify.sh` fires after the branch already exists. Between
"the agent decided" and "the world changed" there is no seam for a decision to live
in — the *naked line*. An agent that force-pushes over a colleague's work, deletes a
worktree with uncommitted changes, or pastes a secret into a commit has already done
it before any gate runs.

A harness closes that gap by putting a decision **at the seam** — every place where an
agent's intent turns into an irreversible, real-world action.

### What the dojo can actually enforce

Honesty first, because it bounds the whole design. A Markdown/shell/TS framework can
only *structurally* enforce the seams it **owns as a process**:

| Seam | Owned? | Mechanism available |
|---|---|---|
| Git operations (commit, push, branch delete, worktree remove) | ✅ owned | git hooks |
| CI / pre-PR | ✅ owned | `verify.sh` + GitHub Actions |
| MCP memory writes (the vault) | ✅ owned | the MCP server (`memory/`) |
| Filesystem / shell inside a user's IDE | ❌ advisory only | skills (guidance) |
| Model calls inside the agent runtime | ❌ advisory only | skills (guidance) |

The harness must be **loud about this line**. It hardens the owned seams for real and
keeps everything else as explicit advisory discipline — it must never *claim* a
universal runtime wrapper it cannot deliver.

### Prior art, and how the dojo's shape differs from it

This design is not speculative: it ports the constructs of a proven **in-process**
agent harness (internal prior art, `agentry`) to the seams the dojo owns. The
divergence is the whole point and must be stated outright:

- **In-process harness** — governs **eight lifecycle points** (`agent_startup`,
  `input`, `pre/post_model_call`, `pre/post_tool_call`, `output`, `agent_shutdown`)
  because it *owns the process*. It can intercept every model call and tool call.
- **The Dojo Harness** — does **not** own the agent's process, so it can only
  structurally guard the **three out-of-process seams it owns** (git, CI, vault),
  and is advisory everywhere else.

So the same four attachments apply, but the dojo's honesty line is *more* critical,
not less: the in-process harness can afford to wrap everything; the dojo cannot, and
must say so. Treat the owned/advisory boundary as a deliberate design stance, not an
omission.

## Decision

Introduce a **Harness layer** — a fourth architectural layer beneath skills, agents,
and fleet — that attaches **four things** at every dojo-owned seam, with a
**fail-closed** default (`deny` when anything is uncertain, errors, or is unowned but
dangerous).

The four attachments (the same anatomy the discipline skills gesture at, now made
structural):

1. **Verdict** — a five-way decision at the seam: `allow · warn · deny · escalate ·
   redact`, not a boolean. An error in the check resolves to `deny`, never `allow`.
   The policy is **manifest-driven**, not hand-coded at the call-site: the guard reads
   a declarative ruleset so the vocabulary stays stable while the engine behind it can
   change (see H2). At git seams, `redact` has a concrete meaning — strip the offending
   secret from the staged diff rather than block the whole action.
2. **Grounding** — a decision or claim cites a source in the memory vault, or is
   stamped `UNGROUNDED`. An ungrounded destructive action does not proceed.
3. **Receipt** — every verdict is written to an **append-only, HMAC-keyed hash-chained**
   ledger that a `verify()` walk can prove was not tampered with. Plain SHA-256 chaining
   lets anyone who can rewrite the file recompute valid hashes; keying the chain to a
   secret closes that. Each record carries not just `decision`/`reason` but the
   `rule_id` that fired and a `snapshot_digest` of the governed state, so the ledger can
   say *which* policy decided and *over what*. The receipt is mandatory; its delivery is
   best-effort (logging trouble must never halt the agent).
4. **Gate** — irreversible actions require a **single-use** human approval whose token is
   **HMAC-bound to the exact artifact fingerprint** (the diff / the command), not a
   standing "this agent may push". A maker/checker split means the identity that
   proposes the action is not the one that confirms it.

```mermaid
flowchart LR
  I["Agent intent"] --> V{"Verdict<br/>5-way, fail closed"}
  V -->|deny| X["blocked + receipt"]
  V -->|escalate| G["Gate<br/>single-use human yes<br/>keyed to the artifact"]
  V -->|allow / warn| Gr["Grounding<br/>cite vault or UNGROUNDED"]
  G -->|approved| Gr
  Gr --> A["Action runs<br/>(git / CI / vault write)"]
  A --> R[("Receipt<br/>append-only<br/>hash-chained ledger")]
  V -. always .-> R
  G -. always .-> R
```

**Read it as:** a skill is a *what*, an agent is a *who*, the fleet is a *team* — and
the **harness is the seam** that stands between any of them and an irreversible act.

### Where it lives

- **Verdict + Gate** — git hooks (`pre-commit`, `pre-push`) plus a small guard command
  in `control-plane` that the hooks and CI call. The guard owns the five-way policy and
  reads it from a **declarative manifest** (so the ruleset can later swap to an external
  engine without touching call-sites).
- **Grounding** — enforced in the finishing/verify skills and the MCP memory-write
  path: a vault write or a "done" claim must carry a citation or an explicit
  `UNGROUNDED` stamp.
- **Receipt** — an HMAC-keyed, hash-chained ledger under `memory/` (upgrading the
  curator's existing per-run audit trail), with a `verify()` walk wired into
  `verify.sh`. Because git hooks can run **concurrently across worktrees**, the ledger
  needs explicit **cross-process** serialization (a file lock), not just in-process
  locking.
- **Gate** — a durable, single-use approval queue whose token is HMAC-bound to the
  artifact fingerprint; the `escalate` verdict is what routes into it.

### Phasing (kata order — each wave shippable alone)

| Wave | Item | Owned seam |
|---|---|---|
| **H1** | HMAC-keyed, hash-chained **Receipt** ledger (`rule_id` + `snapshot_digest` fields, cross-process lock) + `verify()` in `verify.sh` | audit |
| **H2** | **Verdict** guard (five-way, fail-closed, **manifest-driven**) behind git `pre-push`/`pre-commit` | git ops |
| **H3** | **Gate** — single-use, **artifact-HMAC-bound** approval (maker/checker) routed from `escalate` | irreversible git ops |
| **H4** | **Grounding** — cite-or-`UNGROUNDED` on vault writes + "done" claims | MCP memory |
| **H5** | Advisory harness skill documenting the un-owned seams honestly | guidance |

## Alternatives Considered

- **Keep guidance-only (status quo)** — rejected: instructions and a post-hoc gate
  cannot stop an irreversible action *before* it happens; the naked line stays open.
- **Claim a universal runtime wrapper over every agent action** — rejected: the dojo
  does not own the agent's process inside a user's IDE or model runtime. Promising
  enforcement there would be dishonest and unenforceable.
- **Adopt an external policy engine (e.g. OPA/Rego) up front** — deferred *as the
  engine*, but the **manifest indirection it requires is adopted in H2** so the swap
  stays free. The guard reads a declarative ruleset from day one; whether a hand-written
  evaluator or OPA sits behind it is an implementation detail that never touches the
  call-sites. This is stronger than "hand-code now, revisit later".
- **Rely on branch protection / CODEOWNERS alone** — rejected as *sufficient*: those
  gate the PR, not the local irreversible act (force-push, worktree wipe, secret in a
  commit), and they leave no tamper-evident receipt.

## Consequences

- **Positive:**
  - Irreversible, dojo-owned actions become **decidable, attributable, and
    reversible-or-blocked by construction** — not by the agent's good behaviour.
  - The discipline skills stop being purely advisory for the seams the harness owns.
  - A tamper-evident receipt makes every session auditable; `verify.sh` gains teeth.
  - The dojo starts *practising* the harness thesis it teaches, on itself.
- **Negative:**
  - New friction: git hooks and a guard step on every push; contributors must install
    the hooks (or the guard degrades to advisory, which must be signalled loudly).
  - The harness is never "done" — every new dangerous action is a new seam to wrap.
- **Risks:**
  - **Enforcement theatre** — if the guard is trivially bypassable (`--no-verify`),
    the receipt must at least record the bypass so it is visible, never silent.
  - **Scope creep** into the un-owned seams; the owned/advisory line must stay explicit.
  - **Concurrent ledger writes** — git hooks across multiple worktrees can append to the
    receipt at once; without a cross-process file lock the hash chain corrupts. H1 must
    ship the lock, not defer it.
  - Local hooks are opt-in; CI (`verify.sh`) must be the backstop that re-checks the
    receipt so a skipped local hook cannot pass unnoticed.

## Backlinks

<!-- Auto-generated by scripts/link-index.sh -->
_No backlinks yet._
