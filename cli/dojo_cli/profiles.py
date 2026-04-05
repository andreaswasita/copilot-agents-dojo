"""Preset profiles and profile persistence."""

from __future__ import annotations

from pathlib import Path

import yaml


PRESETS: dict[str, dict] = {
    "full-dojo": {
        "label": "🏯 Full Dojo — All 22 skills, all agents",
        "skills": {
            "core-kata": [
                "plan-before-code",
                "subagent-strategy",
                "self-improvement",
                "verify-before-done",
                "demand-elegance",
                "autonomous-bug-fix",
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
            ],
            "meta-do": [
                "skill-creator",
                "using-superpowers",
                "writing-skills",
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
        "label": "⚡ Lean — Core kata + essential waza only",
        "skills": {
            "core-kata": [
                "plan-before-code",
                "verify-before-done",
                "self-improvement",
                "autonomous-bug-fix",
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
        "label": "🧪 TDD Focus — Test-driven, plan-first workflow",
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
        "label": "🔍 Code Review Focus — Review and PR excellence",
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
        "label": "📖 Onboarding — Understand a new codebase fast",
        "skills": {
            "core-kata": [
                "plan-before-code",
                "subagent-strategy",
            ],
            "practical-kumite": [
                "codebase-onboarding",
                "debugging",
            ],
        },
        "agents": ["software-engineer", "architect"],
        "instructions": [],
    },
}

PROFILE_FILENAME = ".dojo-profile.yml"


def load_profile(target_dir: Path) -> dict | None:
    """Load a saved profile from the target directory."""
    profile_path = target_dir / PROFILE_FILENAME
    if not profile_path.exists():
        return None
    try:
        return yaml.safe_load(profile_path.read_text(encoding="utf-8"))
    except (yaml.YAMLError, OSError):
        return None


def save_profile(target_dir: Path, profile: dict) -> Path:
    """Save a profile to the target directory."""
    profile_path = target_dir / PROFILE_FILENAME
    profile_path.write_text(
        yaml.dump(profile, default_flow_style=False, sort_keys=False, allow_unicode=True),
        encoding="utf-8",
    )
    return profile_path
