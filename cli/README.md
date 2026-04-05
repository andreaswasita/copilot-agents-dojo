# Dojo CLI — Skill Marketplace

Interactive marketplace for browsing, selecting, and installing Copilot Agents Dojo skills into your projects.

## Quick Start

```bash
# From the repo root
cd cli
pip install -e .

# Run the interactive marketplace
dojo

# Or use subcommands
dojo skills          # List all 22 skills
dojo agents          # List all agents
dojo select          # Interactive selection wizard
dojo install ~/proj  # Install selected skills to a project
```

## Commands

| Command | Description |
|---------|-------------|
| `dojo` | Interactive marketplace menu |
| `dojo skills` | Browse all available skills in a table |
| `dojo agents` | Browse all available agents |
| `dojo select` | Step-by-step skill/agent/instruction picker |
| `dojo install [path]` | Copy selected skills + generate `copilot-instructions.md` |
| `dojo preview [path]` | Preview what `copilot-instructions.md` will look like |
| `dojo profile [path]` | View the saved profile for a directory |

## Preset Profiles

Skip individual selection — start with a preset and customize:

| Preset | What's included |
|--------|----------------|
| 🏯 Full Dojo | All 22 skills, all 5 agents, all code standards |
| ⚡ Lean | Core kata + essential waza — minimal but effective |
| 🧪 TDD Focus | Test-driven development skills |
| 🔍 Code Review | Review, PR workflow, and quality skills |
| 📖 Onboarding | Codebase understanding and exploration |

## How It Works

1. **Browse** — See all skills organized by category (Kata, Waza, Kumite, Dō)
2. **Select** — Pick skills, agents, and code standards interactively
3. **Install** — Copies skill folders + generates `.github/copilot-instructions.md`
4. **Profile** — Saves your selections to `.dojo-profile.yml` for sharing/reuse

### What gets installed

```
your-project/
├── .github/
│   └── copilot-instructions.md   ← Generated from your selections
├── skills/
│   ├── plan-before-code/         ← Only selected skills
│   ├── test-writing/
│   └── ...
├── agents/
│   └── software-engineer.md      ← Only selected agents
├── tasks/
│   ├── todo.md
│   └── lessons.md
├── scripts/
│   ├── init.sh
│   ├── verify.sh
│   └── lesson-updater.sh
├── skills.md
└── .dojo-profile.yml             ← Your saved selections
```

## Requirements

- Python 3.10+
- Dependencies: `rich`, `InquirerPy`, `pyyaml`
