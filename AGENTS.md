# Copilot Agents Dojo — Contributor Guide

Authoritative reference for humans (and AI assistants) **modifying** the dojo itself. If you're just *using* the dojo in your own repo, start with [`README.md`](README.md). If you're inside an agent session running on the dojo, the runtime prompt is [`.github/copilot-instructions.md`](.github/copilot-instructions.md).

This file is load-bearing. Reviewers may reject PRs that violate the rules below.

---

## Project Structure

File counts shift constantly — don't treat the tree below as exhaustive. The canonical source is the filesystem.

```
copilot-agents-dojo/
├── AGENTS.md                          # this file — contributor reference
├── README.md                          # user-facing onboarding
├── SOUL.md                            # agent identity charter (who / how / limits)
├── skills.md                          # GENERATED — skills index grouped by tier
├── spec/
│   └── copilot-skills-spec.md         # the HARDLINE skill spec (v1)
├── template/
│   └── SKILL.md                       # canonical starter for new skills
├── skills/                            # core + practical skills (always discoverable)
│   ├── plan-before-code/SKILL.md      # tier: core
│   ├── code-review/SKILL.md           # tier: practical
│   └── …
├── optional-skills/                   # heavy / niche skills (installed explicitly)
├── scripts/
│   ├── init.sh                        # scaffold tasks/{todo,lessons}.md
│   ├── verify.sh                      # the lint/test/invariant gate
│   ├── run-checks.ps1                 # Windows parity for verify.sh
│   ├── regen-skills-index.sh          # rebuilds skills.md from frontmatter
│   ├── lesson-updater.sh              # cache-aware skill amendments
│   └── curator.sh                     # skill lifecycle (pin/archive/restore)
├── tasks/
│   ├── todo.md                        # current plan (rollup of tasks/board/)
│   ├── lessons.md                     # postmortem log
│   └── board/                         # durable per-task markdown files
├── agents/                            # persona briefs (architect, TPM, etc.)
├── mcp/
│   ├── registry.yaml                  # MCP server catalog
│   ├── servers/                       # per-server JSON manifests
│   └── scripts/                       # mcp-subprocess wrappers
├── cli/
│   └── dojo_cli/                      # optional Python CLI (marketplace + scanner)
├── .github/
│   ├── copilot-instructions.md        # runtime prompt for sessions in this repo
│   ├── known-pitfalls.md              # imperative DO NOT register
│   └── workflows/dojo-enforce.yml     # PR enforcement
└── .dojo/                             # per-clone state (telemetry, profiles); gitignored
    └── skill-usage.json               # curator telemetry sidecar
```

---

## Adding a Skill

1. Copy `template/SKILL.md` to `skills/<name>/SKILL.md` (or `optional-skills/<name>/` for heavyweight skills).
2. Fill in **all required frontmatter** — see [`spec/copilot-skills-spec.md`](spec/copilot-skills-spec.md) §1.
3. Write the body in the **required section order** — spec §2.
4. Reference real Copilot tools in backticks (`view`, `edit`, `grep`, `glob`, `powershell`, `web_fetch`, `task`). NOT bare shell utilities — spec §3.
5. If the skill needs deterministic logic, add `scripts/` (ship `.sh` + `.ps1` for cross-platform) and `tests/`.
6. Run `scripts/verify.sh` locally. It must pass.
7. Open the PR. Reviewer checks against `.github/known-pitfalls.md` + the spec.

The full reviewer checklist lives in `.github/known-pitfalls.md`.

---

## Adding a CLI Command

The optional Python CLI lives in `cli/dojo_cli/`. Commands are centralized in `cli/dojo_cli/registry.py` (see Phase 5 of the roadmap) — adding a command is one entry in `COMMAND_REGISTRY`. `app.py`, `--help`, `marketplace.py`, and shell completion all derive from it.

Until that registry exists, follow the per-file pattern in `app.py` but keep new commands tiny and dependency-free — the CLI is a convenience, never a hard dependency.

---

## Testing

**Always use `scripts/verify.sh`** (or `scripts/run-checks.ps1` on Windows). The wrapper enforces hermetic env parity with CI:

| | Without wrapper | With wrapper |
|---|---|---|
| Credentials | Whatever is in your env | All `*_TOKEN` / `*_API_KEY` unset |
| Timezone | Local | UTC |
| Locale | Local | C.UTF-8 |
| `DOJO_ROOT` | Inherited | Temp dir per skill test |

Direct `pytest` calls on a developer machine diverge from CI in ways that have caused "works locally, fails in CI" incidents in other projects.

```bash
scripts/verify.sh                       # full gate
scripts/verify.sh tests                 # only the pytest suite
scripts/verify.sh spec                  # only the spec/frontmatter invariants
scripts/verify.sh --check               # CI mode: fail on any drift
```

### Test Discipline — No Change-Detector Tests

A test that snapshots current data (skill count, list contents, version literal) fails every time the data legitimately changes. Write **invariants** instead. Concrete examples in [`.github/known-pitfalls.md`](.github/known-pitfalls.md#do-not-write-change-detector-tests).

---

## Supply Chain Policy

Adopted after the litellm and Shai-Hulud incidents to limit attack surface on PR builds.

| Source | Treatment | Example |
|---|---|---|
| GitHub Actions | Commit SHA + version comment | `uses: actions/checkout@<sha>  # v4` |
| PyPI (CLI deps) | `>=floor,<next_major` | `httpx>=0.28.1,<1` |
| npm (any tooling) | `>=floor,<next_major`, lockfile committed | — |
| Shell binaries | Document expected version in `Prerequisites` | — |

`.github/workflows/dojo-enforce.yml` greps for unpinned `uses:` lines and fails the build. Bare `>=X.Y.Z` without a ceiling is rejected at review.

---

## Task Plan Policy

`tasks/todo.md` in this repository is a **canonical scaffold template**, not a working plan for the dojo's own development. Downstream consumers (anyone who runs `bash scripts/init.sh` against their own project) fill it in for their actual work; the version that ships in this repo must stay in its scaffold form.

Rules:

- **PRs to this repo MUST NOT replace `tasks/todo.md` with a real plan.** Branch protection enforces this via the `Plan sanity` required check, which runs `scripts/verify.sh plan` in canonical-repo mode.
- **Working plans for dojo PRs live elsewhere:** the agent's session folder (`~/.copilot/session-state/<session-id>/plan.md`), a scratch branch outside the canonical scaffold, or PR descriptions/issues. Not in `tasks/todo.md`.
- **`tasks/lessons.md` IS expected to evolve** in this repo — it's the dojo's own learning log. The plan check only asserts presence, not content.

`scripts/verify.sh` detects canonical-repo mode by the presence of `spec/copilot-skills-spec.md`, `skills/`, and `scripts/init.sh` together. In any other repo (a downstream consumer's clone), the same script inverts the assertion: the scaffold template warns, a real plan passes.

---

## Cache-Aware Mutations

Copilot caches the prompt — including the skills it loads at session start. Anything that mutates a skill, the `skills.md` index, or `.github/copilot-instructions.md` mid-session invalidates that cache and dramatically increases cost.

**Rule:** skill amendments default to **deferred** invalidation. The change is written to disk now; it takes effect on the next Copilot session.

`scripts/lesson-updater.sh` honors this by default. Pass `--now` only when correctness requires immediate effect — the script prints a warning about the cache-invalidation cost when you do.

This mirrors the equivalent policy in `hermes-agent` (`/skills install --now` is the canonical pattern there).

---

## Curator (Skill Lifecycle)

Agent-created skills (those with `created_by: agent` in frontmatter) flow through a **state machine** managed by `scripts/curator.sh`:

```
active  ──(no use for STALE_DAYS, default 30)──▶  stale
stale   ──(no use for ARCHIVE_DAYS, default 90)─▶ archived  → skills/.archive/<name>/
```

State is stored per-entry in `.dojo/skill-usage.json`. Any `record`/`view` resets state to `active`.

**Three-layer provenance guard.** A skill is exempt from every auto-transition if any of these is true:

1. Frontmatter `created_by: human` (legacy guard).
2. Folder name appears in `.dojo/bundled-manifest.txt` — regenerated by `scripts/regen-skills-index.sh` from `skills/` + `optional-skills/`. This is the source of truth for "ships with the dojo."
3. `pinned: true` in the usage sidecar.

Invariants (all enforced by `scripts/curator.sh`):

- The curator NEVER deletes — max destructive action is archive to `skills/.archive/`.
- Every mutating run takes a tarball backup to `.dojo/curator-backups/<UTC>/skills.tgz` first (keeps last 5; tunable via `DOJO_CURATOR_BACKUP_KEEP`). `rollback` is reversible — it backs up the *current* state before restoring.
- Every transition run writes a per-run report to `.dojo/logs/curator/<UTC>-transition/REPORT.md` + `run.json` (keeps last 20).

**Verbs:** `status`, `record`, `pin`, `unpin`, `archive`, `restore`, `transition` (alias: `prune`), `backup`, `rollback`, `report`. Full lifecycle docs live in `skills/self-improvement/SKILL.md`.

**Idle-based trigger** (the hermes pattern). Don't run the curator on every prompt — let it fire only when the agent is quiet for a while:

```bash
bash scripts/curator-tick.sh                     # gated: 168h interval, 2h idle defaults
bash scripts/curator-tick.sh --force --dry-run   # preview without gates
pwsh scripts/curator-tick.ps1                    # Windows wrapper
```

Wire it into one of: shell rc (`zsh-defer`/PowerShell `$PROFILE`), a `pre-commit` hook, `cron`/`launchd`, or Windows Task Scheduler. Per-environment overrides go in `.dojo/curator.env` (sourced if present): `DOJO_CURATOR_STALE_DAYS`, `DOJO_CURATOR_ARCHIVE_DAYS`, `DOJO_CURATOR_INTERVAL_HOURS`, `DOJO_CURATOR_MIN_IDLE_HOURS`, `DOJO_CURATOR_BACKUP_KEEP`, `DOJO_CURATOR_REPORT_KEEP`.

**Prerequisite:** `jq` must be on `PATH`.
- macOS: `brew install jq`
- Linux (apt): `sudo apt install jq`
- Windows: `winget install jqlang.jq` (or `scoop install jq`)

The Windows wrappers (`scripts/curator.ps1`, `scripts/curator-tick.ps1`) add the WinGet shim directory to `PATH` automatically; for direct `bash` use on Windows, ensure `jq` resolves in git-bash.

---

## Delegation & Durability

The dojo distinguishes three execution scopes. **Pick the right one.**

| Scope | Tool | Durable across turn? | Use when |
|---|---|---|---|
| Sub-agent | `task` (Copilot's built-in) | **No** — cancelled if parent interrupted | Focused research / parallel reads inside this turn |
| Durable board | `scripts/board.sh` + `tasks/board/` | Yes, survives session | Work assigned to another agent or resumed later |
| Scheduled | GitHub Actions workflow | Yes, survives everything | Recurring or time-based work |

Default sub-agent limits: `max_spawn_depth: 2`, `max_concurrent_children: 3`. Don't exceed without justification. See `skills/subagent-strategy/SKILL.md` and `skills/durable-work/SKILL.md`.

---

## Profile / Multi-Instance Support

The dojo can live anywhere — not just at the repo root. All scripts and the CLI resolve paths from `${DOJO_ROOT:-$PWD}`. Use the env var when running multiple dojo instances side-by-side (e.g., one per monorepo subproject):

```bash
DOJO_ROOT=apps/backend  scripts/verify.sh
DOJO_ROOT=apps/frontend scripts/verify.sh
```

The CLI accepts `--profile <name>` as syntactic sugar for `DOJO_ROOT=~/.dojo/profiles/<name>`.

### Rules for profile-safe code

1. NEVER hardcode `.github/`, `tasks/`, `skills/` in scripts. Use `${DOJO_ROOT:-$PWD}/…`.
2. Tests must isolate to a temp `DOJO_ROOT`.
3. User-facing messages reference `${DOJO_ROOT}/…` so the output is correct for the active profile.

---

## Known Pitfalls

The complete imperative `DO NOT` register lives in [`.github/known-pitfalls.md`](.github/known-pitfalls.md). Skim it before any non-trivial PR.

When you discover a new pitfall:

1. Add an entry there.
2. Add a regression check in `scripts/verify.sh` if it's machine-checkable.
3. Reference it from the relevant `SKILL.md`'s `Pitfalls` section.

---

## Related Files

- [`README.md`](README.md) — user-facing onboarding
- [`spec/copilot-skills-spec.md`](spec/copilot-skills-spec.md) — the HARDLINE skill spec
- [`template/SKILL.md`](template/SKILL.md) — starter for new skills
- [`.github/copilot-instructions.md`](.github/copilot-instructions.md) — runtime prompt
- [`.github/known-pitfalls.md`](.github/known-pitfalls.md) — DO NOT register
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — PR mechanics (branch naming, signoff, etc.)
