"""Discovers skills and agents from the dojo filesystem."""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from pathlib import Path

import yaml


# ── Skill categories mapped to directory names ──────────────────────────
CATEGORIES = {
    "core-kata": {
        "label": "Core Kata — 基本型",
        "icon": "🥋",
        "description": "Behavioral disciplines that govern how agents think",
        "dirs": [
            "plan-before-code",
            "subagent-strategy",
            "self-improvement",
            "verify-before-done",
            "demand-elegance",
            "autonomous-bug-fix",
        ],
    },
    "flow-waza": {
        "label": "Flow Waza — 流れ技",
        "icon": "🔄",
        "description": "Skills that orchestrate the mandatory pipeline",
        "dirs": [
            "brainstorming",
            "using-git-worktrees",
            "executing-plans",
            "requesting-code-review",
            "receiving-code-review",
            "finishing-a-development-branch",
            "dispatching-parallel-agents",
        ],
    },
    "practical-kumite": {
        "label": "Practical Kumite — 実践組手",
        "icon": "⚔️",
        "description": "Task-specific skills for common engineering workflows",
        "dirs": [
            "code-review",
            "refactoring",
            "test-writing",
            "pr-workflow",
            "debugging",
            "codebase-onboarding",
        ],
    },
    "meta-do": {
        "label": "Meta Dō — 道",
        "icon": "道",
        "description": "Framework and meta-skills",
        "dirs": [
            "skill-creator",
            "using-superpowers",
            "writing-skills",
        ],
    },
}


@dataclass
class SkillInfo:
    """Parsed metadata for a single skill."""

    name: str
    slug: str
    description: str
    category: str
    path: Path

    @property
    def display(self) -> str:
        return f"{self.name} — {self.description}"


@dataclass
class AgentInfo:
    """Parsed metadata for a single agent."""

    name: str
    slug: str
    description: str
    agent_type: str
    activation: str
    path: Path
    apply_to: list[str] = field(default_factory=list)

    @property
    def display(self) -> str:
        return f"{self.name} — {self.description}"


def _parse_frontmatter(filepath: Path) -> dict:
    """Extract YAML frontmatter from a markdown file."""
    text = filepath.read_text(encoding="utf-8")
    match = re.match(r"^---\s*\n(.*?)\n---", text, re.DOTALL)
    if not match:
        return {}
    try:
        return yaml.safe_load(match.group(1)) or {}
    except yaml.YAMLError:
        return {}


def _category_for_skill(slug: str) -> str:
    """Return the category key for a given skill slug."""
    for cat_key, cat_info in CATEGORIES.items():
        if slug in cat_info["dirs"]:
            return cat_key
    return "uncategorized"


def scan_skills(dojo_root: Path) -> dict[str, list[SkillInfo]]:
    """Scan the skills/ directory and return skills grouped by category."""
    skills_dir = dojo_root / "skills"
    if not skills_dir.is_dir():
        return {}

    grouped: dict[str, list[SkillInfo]] = {}

    for skill_dir in sorted(skills_dir.iterdir()):
        if not skill_dir.is_dir():
            continue
        skill_md = skill_dir / "SKILL.md"
        if not skill_md.exists():
            continue

        meta = _parse_frontmatter(skill_md)
        slug = skill_dir.name
        category = _category_for_skill(slug)

        info = SkillInfo(
            name=meta.get("name", slug),
            slug=slug,
            description=meta.get("description", "No description"),
            category=category,
            path=skill_md,
        )

        grouped.setdefault(category, []).append(info)

    return grouped


def scan_agents(dojo_root: Path) -> list[AgentInfo]:
    """Scan the agents/ directory and return agent metadata."""
    agents_dir = dojo_root / "agents"
    if not agents_dir.is_dir():
        return []

    agents: list[AgentInfo] = []
    for agent_file in sorted(agents_dir.glob("*.md")):
        meta = _parse_frontmatter(agent_file)
        agents.append(
            AgentInfo(
                name=meta.get("name", agent_file.stem),
                slug=agent_file.stem,
                description=meta.get("description", "No description"),
                agent_type=meta.get("type", "general"),
                activation=meta.get("activation", "manual"),
                path=agent_file,
                apply_to=meta.get("applyTo", []),
            )
        )
    return agents


# ── Instruction sections (code standards) ────────────────────────────────
INSTRUCTION_SECTIONS = [
    {"key": "typescript", "label": "TypeScript", "icon": "🟦"},
    {"key": "python", "label": "Python", "icon": "🐍"},
    {"key": "java", "label": "Java", "icon": "☕"},
    {"key": "go", "label": "Go", "icon": "🐹"},
    {"key": "dotnet", "label": ".NET", "icon": "🟣"},
]
