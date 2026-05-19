# Known Pitfalls — Dojo Contributors

A living register of mistakes that have bitten contributors (or are obvious traps). Imperative `DO NOT` format. Add an entry every time a postmortem produces one.

When you fix a bug rooted in any item below, add a regression check to `scripts/verify.sh` (or `dojo-enforce.yml`) so the next contributor can't repeat it.

---

## Spec & Skill Authoring

### DO NOT exceed 60 chars in a skill `description`
Long descriptions bloat the index and dilute model attention when many skills are loaded. `verify.sh` rejects them. State the capability, not the implementation.

### DO NOT use marketing words in `description` or intros
Banned (and grep-checked): `powerful`, `comprehensive`, `seamless`, `advanced`, `robust`, `cutting-edge`, `intelligent`, `revolutionary`. They convey zero information.

### DO NOT repeat the skill name in the description
`name: plan-before-code` + `description: Plan before coding…` is redundant. Drop the echo.

### DO NOT reference bare shell utilities in SKILL.md prose
The agent has wrappers: `view` (not `cat`), `grep` (not shell `grep`/`rg`/`findstr`), `glob` (not `find`/`ls`), `edit`/`create` (not `sed`/`awk`/heredocs), `web_fetch` (not `curl`). Inside `scripts/`, anything goes — the rule is about prose the model reads as instructions.

### DO NOT skip the required section order
`# Title` → 2–3 sentence intro → `When to Use` → `Prerequisites` → `How to Run` → `Quick Reference` → `Procedure` → `Pitfalls` → `Verification`. `verify.sh` checks ordering.

### DO NOT declare `platforms:` you can't back up
If the skill's scripts import `fcntl`, hardcode `/tmp`, or shell out to `osascript`/`apt`/`systemctl`, you don't support Windows. Default posture: fix it cross-platform first (use `pathlib`, `tempfile.gettempdir()`, `psutil`), narrow the platform list only when the dependency is genuinely platform-bound.

### DO NOT credit `Copilot` as the lead author
Human contributor first: `Real Name (@github-handle)`. Even if Copilot drafted the skill, replace any auto-attribution with your own name.

---

## Repository Hygiene

### DO NOT hardcode `.github/`, `tasks/`, `skills/` paths in scripts
Use `${DOJO_ROOT:-$PWD}` so the dojo can live under a monorepo subproject. Hardcoding breaks profile/multi-instance use. (Mirrors the lesson the `hermes-agent` project learned from PR #3575.)

### DO NOT hand-edit `skills.md`
It's generated from frontmatter by `scripts/regen-skills-index.sh`. Edit the frontmatter; regenerate. `verify.sh --check` fails on drift.

### DO NOT modify files under `skills/` from inside a skill's own scripts
Skills are content, not self-mutating code. Self-improvement amendments go through `scripts/lesson-updater.sh`, which is cache-aware.

### DO NOT wire in dead code without an E2E test
Unused modules were unused for a reason. Before referencing one from a live code path, E2E test the real resolution chain against a temp `DOJO_ROOT`.

### DO NOT squash-merge from a stale branch
A stale branch's version of an unrelated file silently overwrites recent fixes on `main` when squashed. Rebase or merge `main` into the branch first. Verify with `git diff HEAD~1..HEAD` after the merge — unexpected deletions are a red flag.

---

## Tests & CI

### DO NOT write change-detector tests
A test that snapshots current data (skill count, version literal, list contents) fails every time that data legitimately changes. Write **invariants** instead.

| Reject | Accept |
|---|---|
| `assert len(skills) == 24` | `assert len(skills) >= 1` |
| `assert 'plan-before-code' in core_skills` | `assert all(s.tier in {'core','practical','optional'} for s in skills)` |
| `assert version == "1.2.0"` | `assert version == DEFAULT_CONFIG['version']` |

The rule: if the test reads like a snapshot of current data, delete it. If it reads like a contract about how two pieces of data must relate, keep it.

### DO NOT call `pytest` directly when running skill tests
Use `scripts/verify.sh tests` (or `scripts/run-checks.ps1 tests`). The wrapper sets `TZ=UTC`, `LANG=C.UTF-8`, and unsets credential env vars so local runs match CI.

### DO NOT write to `~/.dojo/` or repo root from tests
Tests must use the temp dir provided by the fixture. Hardcoded home-relative paths break CI isolation and pollute the developer's real config.

---

## Supply Chain

### DO NOT use floating `uses:` versions in GitHub Actions
Pin every Action to a commit SHA with a version comment:

```yaml
- uses: actions/checkout@<40-char-sha>  # v4
```

Floating tags (`@v4`, `@main`) are an unmitigated supply-chain risk (cf. tj-actions/changed-files, the litellm compromise, the Shai-Hulud worm). `dojo-enforce.yml` greps for unpinned `uses:` and fails the build.

### DO NOT add a new dependency without an upper bound
For the optional Python CLI: `>=floor,<next_major`. Bare `>=X.Y.Z` is rejected. Same policy hermes adopted after the litellm incident.

---

## Self-Improvement Loop

### DO NOT invalidate Copilot's prompt cache without `--now`
`lesson-updater.sh` defaults to **deferred** invalidation — the amendment takes effect next session, preserving in-flight caching. Pass `--now` only when correctness requires immediate effect. Cache misses are expensive.

### DO NOT delete skills, even agent-created ones
The curator archives to `skills/.archive/` and is restorable. Pinned skills are exempt from every auto-transition. `skill_manage delete` refuses pinned skills.

### DO NOT touch `created_by: human` skills with the curator
The curator only manages skills with `created_by: agent`. Human-authored skills are off-limits unless explicitly pinned/unpinned.

---

## Multi-Agent / Delegation

### DO NOT use delegation for work that must outlive the turn
Delegation (sub-agents via the `task` tool) is **not durable** — if the parent is interrupted, the child is cancelled. For long-running or scheduled work, use the durable board (`scripts/board.sh`) or a GitHub Action.

### DO NOT spawn unbounded sub-agent depth
Default `max_spawn_depth: 2`, `max_concurrent_children: 3`. An orchestrator that spawns orchestrators that spawn orchestrators is how context windows die.

---

## When You Discover a New Pitfall

1. Add the imperative `DO NOT` entry here.
2. Add the postmortem (1–2 sentences) explaining the bite.
3. If it's machine-checkable, add a check to `scripts/verify.sh`.
4. Reference the entry from the relevant SKILL.md's `Pitfalls` section.
