"""Preset profiles and profile persistence.

Profiles serve two distinct purposes:

1. **Project profile** — `.dojo-profile.yml` saved in a target project directory,
   selecting which skills/agents/standards are installed.

2. **Multi-instance profile** — `~/.dojo/profiles/<name>/` containing an
   independent dojo state (skills/, agents/, .dojo/, tasks/). Used when one
   user runs several distinct dojo configurations side-by-side without each
   one overwriting the other's `.dojo/` telemetry. Selected via the
   `DOJO_ROOT` env var or the CLI `--profile <name>` flag.

Both keep the dojo source files untouched.
"""

from __future__ import annotations

import os
from pathlib import Path

import yaml


# ── Project-level preset profiles (skill/agent selection) ─────────────────
# Categories mirror cli/dojo_cli/scanner.py CATEGORIES keys.
PRESETS: dict[str, dict] = {
    "full-dojo": {
        "label": "🏯 Full Dojo — all core + practical + optional skills",
        "skills": {
            "core-kata": [
                "plan-before-code",
                "subagent-strategy",
                "self-improvement",
                "verify-before-done",
                "demand-elegance",
                "autonomous-bug-fix",
                "using-superpowers",
                "durable-work",
            ],
            "flow-waza": [
                "brainstorming",
                "using-git-worktrees",
                "executing-plans",
                "requesting-code-review",
                "receiving-code-review",
                "finishing-a-development-branch",
                "dispatching-parallel-agents",
            ],
            "practical-kumite": [
                "code-review",
                "refactoring",
                "test-writing",
                "pr-workflow",
                "debugging",
                "codebase-onboarding",
                "requirements-elicitation",
            ],
            "meta-do": [
                "writing-skills",
                "using-mcp",
                "building-mcp-servers",
                "calling-mcp-tools-via-subprocess",
            ],
        },
        "agents": [
            "software-engineer",
            "architect",
            "security-engineer",
            "test-engineer",
            "technical-program-manager",
        ],
        "instructions": ["typescript", "python", "java", "go", "dotnet"],
    },
    "lean": {
        "label": "⚡ Lean — core kata + essential waza only",
        "skills": {
            "core-kata": [
                "plan-before-code",
                "verify-before-done",
                "self-improvement",
                "autonomous-bug-fix",
                "durable-work",
            ],
            "flow-waza": [
                "brainstorming",
                "executing-plans",
                "finishing-a-development-branch",
            ],
        },
        "agents": ["software-engineer"],
        "instructions": [],
    },
    "tdd-focus": {
        "label": "🧪 TDD Focus — test-driven, plan-first workflow",
        "skills": {
            "core-kata": [
                "plan-before-code",
                "verify-before-done",
                "demand-elegance",
            ],
            "flow-waza": [
                "executing-plans",
            ],
            "practical-kumite": [
                "test-writing",
                "debugging",
            ],
        },
        "agents": ["software-engineer", "test-engineer"],
        "instructions": [],
    },
    "code-review-focus": {
        "label": "🔍 Code Review Focus — review and PR excellence",
        "skills": {
            "core-kata": [
                "demand-elegance",
                "verify-before-done",
            ],
            "flow-waza": [
                "requesting-code-review",
                "receiving-code-review",
            ],
            "practical-kumite": [
                "code-review",
                "pr-workflow",
                "refactoring",
            ],
        },
        "agents": ["software-engineer", "security-engineer"],
        "instructions": [],
    },
    "onboarding": {
        "label": "📖 Onboarding — understand a new codebase fast",
        "skills": {
            "core-kata": [
                "plan-before-code",
                "subagent-strategy",
            ],
            "practical-kumite": [
                "codebase-onboarding",
                "debugging",
                "requirements-elicitation",
            ],
        },
        "agents": ["software-engineer", "architect"],
        "instructions": [],
    },
    "requirements-first": {
        "label": "📋 Requirements First — TPM + Architect with elicitation gate",
        "skills": {
            "core-kata": [
                "plan-before-code",
                "self-improvement",
            ],
            "flow-waza": [
                "brainstorming",
            ],
            "practical-kumite": [
                "requirements-elicitation",
                "codebase-onboarding",
            ],
        },
        "agents": ["technical-program-manager", "architect"],
        "instructions": [],
    },
}

PROFILE_FILENAME = ".dojo-profile.yml"


def load_profile(target_dir: Path) -> dict | None:
    """Load a saved project profile from the target directory."""
    profile_path = target_dir / PROFILE_FILENAME
    if not profile_path.exists():
        return None
    try:
        return yaml.safe_load(profile_path.read_text(encoding="utf-8"))
    except (yaml.YAMLError, OSError):
        return None


def save_profile(target_dir: Path, profile: dict) -> Path:
    """Save a project profile to the target directory."""
    profile_path = target_dir / PROFILE_FILENAME
    profile_path.write_text(
        yaml.dump(profile, default_flow_style=False, sort_keys=False, allow_unicode=True),
        encoding="utf-8",
    )
    return profile_path


# ── Multi-instance profiles (separate dojo roots) ─────────────────────────
INSTANCE_PROFILES_HOME = Path.home() / ".dojo" / "profiles"


def instance_profile_path(name: str) -> Path:
    """Resolve a named multi-instance profile to its dojo root directory."""
    return INSTANCE_PROFILES_HOME / name


def list_instance_profiles() -> list[str]:
    """List the names of every multi-instance profile under ~/.dojo/profiles/."""
    if not INSTANCE_PROFILES_HOME.is_dir():
        return []
    return sorted(
        p.name
        for p in INSTANCE_PROFILES_HOME.iterdir()
        if p.is_dir() and (p / "skills").is_dir()
    )


def activate_instance_profile(name: str) -> Path:
    """Set DOJO_ROOT to the named profile and return its path.

    Raises FileNotFoundError if the profile (or its `skills/` directory)
    doesn't exist. Callers should catch and present a useful message.
    """
    root = instance_profile_path(name)
    if not (root / "skills").is_dir():
        raise FileNotFoundError(
            f"Multi-instance profile '{name}' not found at {root}. "
            f"Create it with: mkdir -p {root} && cp -r <dojo>/* {root}/"
        )
    os.environ["DOJO_ROOT"] = str(root)
    return root


def resolve_dojo_root(profile: str | None = None) -> Path:
    """Resolve the active dojo root using the documented precedence.

    Order:
      1. ``--profile <name>`` argument (activates instance profile).
      2. ``DOJO_ROOT`` env var.
      3. Walk up from CWD looking for ``skills/`` + ``skills.md``.

    Returns the resolved path. Raises FileNotFoundError if none match.
    """
    if profile:
        return activate_instance_profile(profile)
    env = os.environ.get("DOJO_ROOT")
    if env and (Path(env) / "skills").is_dir():
        return Path(env)
    cwd = Path.cwd()
    for parent in [cwd, *cwd.parents]:
        if (parent / "skills").is_dir() and (parent / "skills.md").exists():
            return parent
    raise FileNotFoundError(
        "Could not locate a dojo root. Set DOJO_ROOT, pass --profile <name>, "
        "or run from inside a dojo clone."
    )

