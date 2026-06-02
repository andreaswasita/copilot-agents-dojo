# copilot-dojo

Zero-install bootstrap for the **Copilot Agents Dojo** — a skills &
discipline framework for GitHub Copilot agents.

> **Status:** v0.1 (early access). Not yet published to npm. Run from a
> local build or via `npx github:andreaswasita/copilot-agents-dojo` once
> the publish workflow lands.

## What it does

Picks a preset bundle (lean, TDD-focus, code-review-focus, onboarding,
requirements-first, or full-dojo), fetches the matching skills and
agents from this repo, and writes:

- `skills/<id>/SKILL.md` — one folder per selected skill
- `agents/<id>.md` — one file per selected agent persona
- `spec/copilot-skills-spec.md` and `template/SKILL.md` — contract docs
- `.github/copilot-instructions.md` — the entry point Copilot loads
- `.dojo-profile.yml` — pinning your selection for repeatable installs

Any file the installer would overwrite is first snapshotted under
`.dojo/installer-backups/<utc-ts>/` so re-runs are reversible.

## Usage

```bash
# In the project you want to bootstrap
npx copilot-dojo init                # interactive
npx copilot-dojo init --preset lean  # one-shot
npx copilot-dojo init --preset tdd-focus --ref v1.0.0
npx copilot-dojo init --dry-run      # show what would happen
```

| Flag | Default | Notes |
|---|---|---|
| `[target]` | `.` | Target directory; relative paths resolved against `cwd`. |
| `--preset <id>` | *(prompt)* | One of `full-dojo`, `lean`, `tdd-focus`, `code-review-focus`, `onboarding`, `requirements-first`. `custom` is reserved for v2. |
| `--ref <git-ref>` | `main` | Branch, tag, or commit SHA on `andreaswasita/copilot-agents-dojo`. Pin to a tag for reproducible installs. |
| `-y, --yes` | off | Skip confirmation prompts; default preset becomes `lean`. |
| `--dry-run` | off | Print plan; exit before touching disk. |

## Presets

| ID | What's included |
|---|---|
| `full-dojo` | 22 skills, 5 agents — the whole catalogue |
| `lean` | 8 skills, 1 agent — the daily-driver minimum |
| `tdd-focus` | 6 skills, 2 agents — test-first discipline |
| `code-review-focus` | 7 skills, 2 agents — review & PR workflow |
| `onboarding` | 5 skills, 2 agents — fast codebase ramp-up |
| `requirements-first` | 5 skills, 2 agents — TPM/architect elicitation flow |

## Local development

```bash
# From the repo root
cd control-plane
pnpm install
pnpm --filter copilot-dojo build
pnpm --filter copilot-dojo test

# Run the freshly built CLI against a scratch dir
mkdir /tmp/dojo-demo
node packages/installer/dist/cli.js init /tmp/dojo-demo --preset lean -y
```

## Offline / CI fetch

The installer pulls a GitHub tarball at `codeload.github.com`. Override
the source via `DOJO_TARBALL_URL` (accepts `file://` URLs) for hermetic
tests or air-gapped installs. The bundled vitest suite uses this hook to
run with no network.

## Roadmap

| Theme | Description |
|---|---|
| `custom` preset picker | Interactive multi-select over the live skill catalogue (currently rejected with a TODO error). |
| Skill *removal* on update | Today re-runs only add/refresh. |
| Conflict resolution | Detect hand-edited skills and prompt before clobber. |
| npm publish workflow | `.github/workflows/publish-installer.yml` — gated on tag pushes. |
| `dojo doctor` command | Audit an installed project for drift vs the pinned profile. |

Issues and PRs: <https://github.com/andreaswasita/copilot-agents-dojo>
