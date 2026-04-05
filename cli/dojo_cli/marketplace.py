"""Interactive marketplace UI using Rich + InquirerPy."""

from __future__ import annotations

from pathlib import Path

from InquirerPy import inquirer
from InquirerPy.separator import Separator
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.text import Text

from dojo_cli.profiles import PRESETS
from dojo_cli.scanner import (
    CATEGORIES,
    INSTRUCTION_SECTIONS,
    AgentInfo,
    SkillInfo,
    scan_agents,
    scan_skills,
)

console = Console()


def show_banner() -> None:
    banner = Text()
    banner.append("🏯 ", style="bold")
    banner.append("Copilot Agents Dojo", style="bold cyan")
    banner.append(" — Skill Marketplace\n", style="dim")
    banner.append("Browse, select, and install skills for your project", style="dim")
    console.print(Panel(banner, border_style="cyan", padding=(1, 2)))


def show_current_profile(profile: dict) -> None:
    """Display the current profile summary."""
    table = Table(title="Current Profile", border_style="cyan", show_lines=True)
    table.add_column("Category", style="bold")
    table.add_column("Selected", style="green")

    skills = profile.get("skills", {})
    for cat_key, cat_info in CATEGORIES.items():
        slugs = skills.get(cat_key, [])
        if slugs:
            table.add_row(
                f"{cat_info['icon']} {cat_info['label']}",
                "\n".join(slugs),
            )

    agents = profile.get("agents", [])
    if agents:
        table.add_row("👤 Agents", "\n".join(agents))

    instructions = profile.get("instructions", [])
    if instructions:
        table.add_row("📋 Code Standards", "\n".join(instructions))

    if table.row_count == 0:
        console.print("[dim]No skills selected yet.[/dim]")
    else:
        console.print(table)


def select_preset() -> dict | None:
    """Let the user pick a preset profile or go custom."""
    choices = [
        {"name": info["label"], "value": key}
        for key, info in PRESETS.items()
    ]
    choices.append(Separator())
    choices.append({"name": "🎨 Custom — Pick your own skills", "value": "custom"})

    result = inquirer.select(
        message="Choose a preset or go custom:",
        choices=choices,
        pointer="▸",
    ).execute()

    if result == "custom":
        return None
    return PRESETS[result]


def select_skills_for_category(
    cat_key: str,
    cat_info: dict,
    available: list[SkillInfo],
    preselected: list[str] | None = None,
) -> list[str]:
    """Interactive checkbox selection for skills in a category."""
    if not available:
        console.print(f"[dim]No skills found for {cat_info['label']}[/dim]")
        return []

    preselected = preselected or []

    choices = [
        {
            "name": f"{s.slug} — {s.description[:80]}",
            "value": s.slug,
            "enabled": s.slug in preselected,
        }
        for s in available
    ]

    result = inquirer.checkbox(
        message=f"{cat_info['icon']} {cat_info['label']} — select skills:",
        choices=choices,
        pointer="▸",
        enabled_symbol="✓",
        disabled_symbol="○",
    ).execute()

    return result


def select_all_skills(
    dojo_root: Path,
    preselected: dict[str, list[str]] | None = None,
) -> dict[str, list[str]]:
    """Walk through each category and let user select skills."""
    all_skills = scan_skills(dojo_root)
    preselected = preselected or {}
    selected: dict[str, list[str]] = {}

    for cat_key, cat_info in CATEGORIES.items():
        available = all_skills.get(cat_key, [])
        if not available:
            continue

        result = select_skills_for_category(
            cat_key, cat_info, available, preselected.get(cat_key)
        )
        if result:
            selected[cat_key] = result

    return selected


def select_agents(dojo_root: Path, preselected: list[str] | None = None) -> list[str]:
    """Interactive checkbox selection for agents."""
    agents = scan_agents(dojo_root)
    if not agents:
        console.print("[dim]No agents found.[/dim]")
        return []

    preselected = preselected or []

    choices = [
        {
            "name": f"{a.slug} — {a.description[:80]}",
            "value": a.slug,
            "enabled": a.slug in preselected,
        }
        for a in agents
    ]

    result = inquirer.checkbox(
        message="👤 Agents — select active agents:",
        choices=choices,
        pointer="▸",
        enabled_symbol="✓",
        disabled_symbol="○",
    ).execute()

    return result


def select_instructions(preselected: list[str] | None = None) -> list[str]:
    """Interactive checkbox for code standard sections."""
    preselected = preselected or []

    choices = [
        {
            "name": f"{s['icon']} {s['label']}",
            "value": s["key"],
            "enabled": s["key"] in preselected,
        }
        for s in INSTRUCTION_SECTIONS
    ]

    result = inquirer.checkbox(
        message="📋 Code Standards — select language standards to include:",
        choices=choices,
        pointer="▸",
        enabled_symbol="✓",
        disabled_symbol="○",
    ).execute()

    return result


def confirm_action(message: str) -> bool:
    return inquirer.confirm(message=message, default=True).execute()
