# Changelog

All notable changes to the Copilot Agents Dojo are documented here. Format loosely follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); the project ships markdown skills + bash scripts so we version by *behavioral contract*, not by published API.

## [Unreleased]

_Nothing yet._

## [1.3.0] — 2026-06-28 — "Green-Belt Dojo"

The first release published to the **npm registry**, with the verify gate fully green
end-to-end. Ships `copilot-dojo` 0.1.0 (sigstore provenance), closes the strict-mode
gate gaps (N2/N3), triages the pytest major bump (N4), and reconciles the docs/badges
to the generated skill index (N5). Completes the roadmap **NOW** cycle (N1–N5).

### Added — first npm registry release (`copilot-dojo` 0.1.0)

- **`copilot-dojo` published to npm** with sigstore provenance: `npx copilot-dojo init`
  now works directly from the registry — no `github:` tarball ref required. Closes
  roadmap **N1**.
- Release is tag-driven (`copilot-dojo-v*.*.*` → `release-copilot-dojo.yml`); the
  workflow asserts the tag suffix matches `package.json`'s version before publishing.

### Fixed

- **Installer `bin` path (#67, N1):** dropped the `./` prefix from `bin.copilot-dojo`
  (`./dist/cli.js` → `dist/cli.js`). npm@11's publish normalization silently strips
  `./`-prefixed bin values from the registry manifest, which would have left
  `npx copilot-dojo` unable to resolve its binary despite a valid tarball.
- **Traceability gate strict-mode (#65, N2):** `verify.sh --check` is green again —
  the `requirements/sample/` teaching fixture is exempted from the strict
  `ratified_by` assertion via a `.teaching-fixture` marker (emitted as an info note,
  not a counted warning).
- **Skill smoke-test coverage in the gate (#66, N3):** `verify.sh` now discovers and
  runs the top-level `tests/` suite (previously only globbed `skills/*/tests`, so the
  passing tests false-skipped), with a `python3` interpreter fallback.

### Changed — deps, docs & hygiene

- **Dependabot triage — pytest `8.3.3 → 9.0.3` (#21, #70, N4):** adopted the major
  pytest bump; `tests/requirements-dev.txt` pins `9.0.3` with rationale and the full
  107-test suite passes on it.
- **Doc & badge hygiene (#70, N5):** README and CLI-plugin metadata reconciled to the
  generated `skills.md` (32 skills = 28 core + 4 optional); version/skills badges
  refreshed; broken `--ref v1.1` install examples corrected to the real `v1.0.0` tag.
- **Repo hygiene (#71):** added a repo-root `.gitignore` for Python caches
  (`__pycache__/`, `*.py[cod]`, `.pytest_cache/`, `.DS_Store`) and removed a stray
  committed `.pyc`.

## [1.2.0] — 2026-06-08 — "Open-Door Dojo"

Lowers the barrier to entry and adds a single front door to the workflow: a
zero-toolchain `npx` installer with a real lifecycle, stack-aware presets,
discoverable slash commands, a one-command pipeline orchestrator, and a
ready-made security-audit skill.

### Added — one-command bootstrap installer

- **`install.sh` (bash) + `install.ps1` (PowerShell)** at the repo root: drop the
  entire framework into any repo with `curl … | bash` or `irm … | iex` — no clone,
  no Python, no `pip install`. Downloads a tarball/zip from codeload (or a local
  `--source`/`-Source` checkout for offline use) and merge-copies the dojo-owned
  trees (`skills/ optional-skills/ agents/ scripts/ spec/ template/ mcp/`,
  `skills.md`, and the four committed `.dojo/` files).
- **Idempotent & provenance-aware.** A `.dojo/install-manifest.txt` records what
  the installer owns; genuine collisions (files not from a prior install) are
  backed up under `.dojo/backups/<UTC>/` before overwrite. Re-runs refresh the
  bundle while preserving `tasks/`, the seed-only `memory/` vault, user-authored
  skills, and an edited `.github/copilot-instructions.md` (a differing dojo
  version is written to `.github/copilot-instructions.dojo.md` to merge by hand).
- **Health gate.** Finishes by running `scripts/verify.sh spec` (skippable with
  `--no-verify`/`-NoVerify`); the PowerShell path locates Git-for-Windows bash and
  warns (rather than failing) if it is absent.
- **Flags/env:** `--ref`/`DOJO_REF`, `--dir`/`DOJO_DIR`, `--source`/`DOJO_SRC`,
  `--force`/`DOJO_FORCE`, `--no-verify`/`DOJO_NO_VERIFY` (PowerShell mirrors these
  as params plus env-var fallbacks for the piped `irm | iex` form).
- README "Enter the Dojo" now leads with the one-command path; the manual 9-step
  process is retained below it.

### Added — Copilot CLI plugin marketplace

- **`plugin.json` (repo root) + `.github/plugin/marketplace.json`** turn the repo
  into a [GitHub Copilot CLI](https://docs.github.com/copilot/how-tos/use-copilot-agents/use-copilot-cli)
  plugin marketplace. Users install the dojo's core skills straight into their
  Copilot CLI with `copilot plugin marketplace add andreaswasita/copilot-agents-dojo`
  then `copilot plugin install dojo@copilot-agents-dojo` — no clone, no repo files.
- **Scope is the 25 core skills** (`skills/`). Optional tiers (`optional-skills/`)
  remain opt-in via the installer/manual path, preserving the "core always,
  optional by choice" contract. (Copilot CLI 1.0.x loads only a plugin's default
  `skills/` directory, so this is also the no-duplication path.)
- **No build, no duplication:** the manifest points at the existing `skills/`
  tree; agents and MCP configs are intentionally omitted because the dojo's
  persona briefs are not in the CLI's `.agent.md` format.
- README "Enter the Dojo" gains an "Install as a Copilot CLI plugin" section.

### Added — `npx` installer lifecycle (G2)

- `npx copilot-dojo` installer gains a full lifecycle: `init`, `doctor`, and
  `uninstall`, backed by a checksummed install manifest with atomic writes.
- `doctor` reports drift between the manifest and the working tree; `uninstall`
  preserves user-modified files and prunes only dojo-owned, empty directories.

### Added — stack-aware presets and auto-detection (G14/G15)

- Installer presets (`lean`, `onboarding`, `full-dojo`) tailor the installed
  surface to the project.
- `detect` inspects the repo (languages, frameworks, infra markers, monorepo
  depth) and recommends a preset; detection never throws and surfaces
  non-fatal issues as warnings.

### Added — security-audit skill (G6)

- New `security-audit` skill: a stdlib-only heuristic scanner with
  high-confidence and broad profiles, `--fail-on` gating, deterministic
  idempotent reports (markdown/JSON), inline suppression, and
  suggestions-only remediation.

### Added — slash-command surface (G9)

- Generated `.github/prompts/dojo-*.prompt.md` shims expose every skill as a
  discoverable `/dojo-*` slash command, kept in sync via
  `scripts/regen-prompts.sh` / `.ps1` and drift-checked in CI.

### Added — one-command pipeline orchestrator (G8)

- `scripts/sprint.sh` / `.ps1` chain the mandatory 8-step pipeline
  (BRAINSTORM→WORKTREE→PLAN→EXECUTE→TEST→REVIEW→FINISH→LEARN) from a single
  entry point, with a parallel `swarm` variant and a `gate` that runs
  `verify.sh`. Surfaced as `/dojo-sprint` and `/dojo-swarm`.

## [1.1.0] — 2026-05-20 — "Self-Improving Dojo"

Closes the self-improvement gap with [hermes-agent](https://github.com/andreaswasita/hermes-agent). The curator now has a real state machine, durable backups, per-run audit trail, hardened provenance, and an idle-based trigger — without adding a daemon. Shell + agent, no install.

### Curator state machine

- **`active → stale → archived` lifecycle** stored per-entry in `.dojo/skill-usage.json` (`state` field). Any `record`/`view` snaps state back to `active`. Backfilled automatically for pre-1.1 sidecars.
- **`scripts/curator.sh transition`** — age-based auto-transitions (defaults: 30d → stale, 90d → archived; tunable via `DOJO_CURATOR_STALE_DAYS` / `DOJO_CURATOR_ARCHIVE_DAYS`). Legacy `prune` verb kept as an alias.
- **`--dry-run`** previews without writing.

### Backup & rollback

- **`scripts/curator.sh backup --reason "<why>"`** — tar.gz snapshot of `skills/`, `optional-skills/`, `skill-usage.json`, and `bundled-manifest.txt` to `.dojo/curator-backups/<UTC>/skills.tgz` with a sibling `manifest.json`. Keeps the last 5 (`DOJO_CURATOR_BACKUP_KEEP`).
- **Every mutating curator run takes a backup first.**
- **`scripts/curator.sh rollback <stamp>`** — restores from a backup *and takes a fresh backup of the current state first*, so rollbacks are themselves reversible.
- **`scripts/curator.sh rollback --list`** — shows available backups newest-first.

### Per-run audit trail

- Every `transition` run writes `.dojo/logs/curator/<UTC>-transition/REPORT.md` + `run.json`. Keeps the last 20 (`DOJO_CURATOR_REPORT_KEEP`).
- **`scripts/curator.sh report`** — prints the most recent report.

### Provenance manifest

- **`.dojo/bundled-manifest.txt`** — plain-text list of skill folder names that ship with the dojo. Regenerated whenever `scripts/regen-skills-index.sh` runs (write mode).
- The curator's `is_bundled` check refuses to auto-archive *anything* on the manifest, complementing the existing `created_by: human` guard. Three-layer provenance: frontmatter, manifest, pin.
- **`scripts/verify.sh`** gains a `[curator]` section that warns if the manifest is missing.

### Idle-based trigger

- **`scripts/curator-tick.sh`** + **`scripts/curator-tick.ps1`** — gated runner that invokes `curator.sh transition` only when (a) the last curator run is older than `DOJO_CURATOR_INTERVAL_HOURS` (default 168h) and (b) the most recent skill use is at least `DOJO_CURATOR_MIN_IDLE_HOURS` ago (default 2h). `--force` bypasses gates; `--dry-run` previews.
- Knobs can live in `.dojo/curator.env` (sourced if present).
- Wire into shell rc, pre-commit, cron/launchd, or Windows Task Scheduler — the dojo no longer requires a daemon to stay tidy.

### Migration

Existing v1.0 dojos pick up the new behavior automatically the next time `scripts/regen-skills-index.sh` runs. No data is rewritten beyond backfilling `state: "active"` on existing usage entries.

---

## [1.0.0] — 2026-05-20 — "Hardened Dojo"

The first numbered release. Bakes seven phases of structural work into a single coherent spec, single gate, and single set of sources of truth. The framework is now drop-in for any repo, with backwards-compatible filesystem layout.

### Spec & content

- **Spec v1** (`spec/copilot-skills-spec.md`) — formalized frontmatter (`name`, `description`, `tier`, `category`, `version`), required body sections in fixed order, and the rule that every "should" must map to a verifiable check in `scripts/verify.sh`.
- **Template** (`template/SKILL.md`) — starter aligned to spec v1.
- **Tier reorganization** — every skill now carries `tier: core | practical | optional` frontmatter. Heavyweight / niche skills relocated to `optional-skills/`. The legacy "core kata / flow waza / practical kumite / meta dō" labels are retained as decoration in `skills.md` but the canonical taxonomy is the tier field.
- **New skills:**
  - `skills/durable-work/` (tier: core, category: delegation) — picks the durable board over sub-agents for cross-turn work.
  - `optional-skills/writing-skills/` — meta skill for SKILL.md authoring (relocated from `skills/`).
- **Retired skills:** `skill-creator` (folded into `writing-skills`).
- **Known pitfalls** — `.github/known-pitfalls.md` — imperative DO-NOT register loaded at session start.

### Single sources of truth

- **`skills.md`** — fully generated from `SKILL.md` frontmatter via `scripts/regen-skills-index.sh`. The gate fails if hand edits drift from the filesystem.
- **`agents/registry.yaml`** — single source for all five personas (slug, type, activation, apply_to, tags, default_skills). `scanner.scan_agents()` prefers the registry over per-file frontmatter. `verify.sh` detects drift.
- **`cli/dojo_cli/registry.py`** — single `COMMAND_REGISTRY` tuple drives `main()`, the help table, and the interactive menu. Refactored `app.py.main()` from 40-line `if/elif` to a 6-line registry lookup.
- **`.dojo/delegation.yaml`** — concrete knobs (max_spawn_depth, max_concurrent_children, conflict_resolution, escalate-to-board triggers) cited by `subagent-strategy`.

### Single gate

- **`scripts/verify.sh`** — the only enforcement entry point. Modes: `spec` (default), `plan`, `tests`, `all`. Checks:
  - Skill frontmatter + body invariants per spec v1.
  - `skills.md` matches filesystem.
  - `agents/registry.yaml` matches `agents/*.md`.
  - All `scripts/*.{sh,ps1}` honor `DOJO_ROOT` and avoid hardcoded `../{skills,tasks,agents,…}/` paths.
- **`scripts/run-checks.ps1`** — Windows parity wrapper.

### Durable work + telemetry

- **`tasks/board/`** — durable per-task markdown files (`000-template.md`, `README.md`). Survives across turns and sub-agent handoffs.
- **`scripts/board.sh`** — verbs: `new / list / status / roll-up`. The `roll-up` action regenerates `tasks/todo.md` from board state.
- **`.dojo/`** (gitignored) — per-clone state: `skill-usage.json` telemetry, `.gitignore`, `README.md`.
- **`scripts/curator.sh`** — 8 verbs (`status / record / pin / unpin / archive / restore / prune / report`) over the usage telemetry. PowerShell mirror at `scripts/curator.ps1` auto-adds the `winget` `jq` install dir to `PATH`.

### Cache-aware self-improvement

- **`scripts/lesson-updater.sh`** — defaults to **deferred** mode: proposed amendments are written to `.dojo/pending-amendments.md` so the current Copilot session's prompt cache stays valid. `--now` opt-in applies immediately with a loud warning. Bumps `tasks/lessons.md` metrics either way.

### DOJO_ROOT + multi-instance profiles

- Every shell script and `.ps1` wrapper now resolves the dojo root via `${DOJO_ROOT:-…}` (bash) / `$env:DOJO_ROOT` (PowerShell), with a fallback to the script's parent directory.
- **`cli/dojo_cli/profiles.py`** — six refreshed PRESETS (`full-dojo`, `lean`, `tdd-focus`, `code-review-focus`, `onboarding`, `requirements-first`) aligned to the current 26-skill catalog. Adds `INSTANCE_PROFILES_HOME = ~/.dojo/profiles` and helpers `instance_profile_path()`, `list_instance_profiles()`, `activate_instance_profile()`, `resolve_dojo_root()`.
- **`dojo --profile <name>`** — `app.py` parses `--profile` early and swaps `DOJO_ROOT` so every downstream call operates on the right root.

### Docs

- **`README.md`** — rewritten end-to-end for v1: tier structure, single gate, single sources of truth, curator + telemetry, cache-aware updater, multi-instance profiles, and an honest scripts table.
- **`AGENTS.md`** — contributor guide with the full directory tree, DOJO_ROOT convention, and curator workflow (incl. `jq` prerequisite).
- **`scripts/migrate-v1.sh`** — best-effort migration helper for repos still on the pre-v1 layout.
- **Wiki** — `Home.md` rewritten to mirror the README v1 structure. (Other wiki pages remain as historical references and should be reviewed page-by-page.)

### Compatibility

- The on-disk layout of `skills/` is unchanged for existing skills — they were augmented with `tier:` frontmatter, not moved. Only `skill-creator` (deleted) and `writing-skills` (moved to `optional-skills/`) require attention.
- `skills.md` is now generated; if you previously hand-edited it, the gate will fail. Run `bash scripts/regen-skills-index.sh` once.
- `scripts/verify.sh` is stricter. If you have local scripts that hardcode `../skills/`, either add `${DOJO_ROOT:-…}` resolution or expect the path audit to warn.

### Migration

```bash
# From the repo root of an existing pre-v1 dojo:
bash scripts/migrate-v1.sh
bash scripts/regen-skills-index.sh
bash scripts/verify.sh spec
```

---

## [0.x] — Pre-v1

Historical period. The dojo existed as a flat collection of skills under `skills/`, a generic `skills.md` maintained by hand, ad-hoc enforcement via `.github/workflows/dojo-enforce.yml`, and no concept of tiers, telemetry, durable boards, or registries. Useful as a starting point but lacked the drift detection that makes v1 safe to scale.
