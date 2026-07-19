"""Main CLI application — entry point for `dojo` command."""

from __future__ import annotations

import sys
from pathlib import Path

from rich.console import Console
from rich.panel import Panel
from rich.table import Table

from dojo_cli.generator import apply_to_project, generate_instructions
from dojo_cli.marketplace import (
    confirm_action,
    console,
    select_agents,
    select_all_skills,
    select_instructions,
    select_preset,
    show_banner,
    show_current_profile,
)
from dojo_cli.profiles import PRESETS, load_profile, save_profile
from dojo_cli.scanner import CATEGORIES, scan_agents, scan_skills

# ── Resolve dojo root (the repo root, parent of cli/) ────────────────────
DOJO_ROOT = Path(__file__).resolve().parent.parent.parent


def _find_dojo_root() -> Path:
    """Find the dojo repo root. Prefers DOJO_ROOT env var, then walks up."""
    import os

    env = os.environ.get("DOJO_ROOT")
    if env:
        p = Path(env)
        if (p / "skills").is_dir():
            return p

    # Walk up from script location
    if (DOJO_ROOT / "skills").is_dir():
        return DOJO_ROOT

    # Walk up from cwd
    cwd = Path.cwd()
    for parent in [cwd, *cwd.parents]:
        if (parent / "skills").is_dir() and (parent / "skills.md").exists():
            return parent

    console.print("[red]Could not find dojo root (skills/ directory). "
                  "Run from the dojo repo or set DOJO_ROOT env var.[/red]")
    sys.exit(1)


def cmd_skills(dojo_root: Path) -> None:
    """List all available skills in a table."""
    all_skills = scan_skills(dojo_root)
    table = Table(title="🏯 Available Skills", border_style="cyan", show_lines=True)
    table.add_column("Category", style="bold", width=30)
    table.add_column("Skill", style="green", width=28)
    table.add_column("Description", width=60)

    for cat_key, cat_info in CATEGORIES.items():
        skills = all_skills.get(cat_key, [])
        for i, skill in enumerate(skills):
            cat_label = f"{cat_info['icon']} {cat_info['label']}" if i == 0 else ""
            table.add_row(cat_label, skill.slug, skill.description[:60])

    console.print(table)
    console.print(f"\n[dim]{sum(len(v) for v in all_skills.values())} skills available[/dim]")


def cmd_agents(dojo_root: Path) -> None:
    """List all available agents."""
    agents = scan_agents(dojo_root)
    table = Table(title="👤 Available Agents", border_style="cyan", show_lines=True)
    table.add_column("Agent", style="bold green", width=30)
    table.add_column("Type", style="yellow", width=15)
    table.add_column("Description", width=50)

    for a in agents:
        table.add_row(a.slug, a.agent_type, a.description[:50])

    console.print(table)


def cmd_select(dojo_root: Path) -> dict:
    """Interactive skill/agent/instruction selection flow."""
    console.print("\n[bold cyan]Step 1:[/bold cyan] Choose a starting point\n")

    preset = select_preset()

    if preset:
        profile = {
            "skills": dict(preset["skills"]),
            "agents": list(preset["agents"]),
            "instructions": list(preset["instructions"]),
        }
        console.print("\n[green]✓ Preset loaded.[/green] You can customize further.\n")

        customize = confirm_action("Customize this preset?")
        if not customize:
            return profile

        # Let them refine
        console.print("\n[bold cyan]Refining selections...[/bold cyan]\n")
        profile["skills"] = select_all_skills(dojo_root, profile["skills"])
        profile["agents"] = select_agents(dojo_root, profile["agents"])
        profile["instructions"] = select_instructions(profile["instructions"])
        return profile
    else:
        # Full custom flow
        console.print("\n[bold cyan]Step 2:[/bold cyan] Select skills by category\n")
        skills = select_all_skills(dojo_root)

        console.print("\n[bold cyan]Step 3:[/bold cyan] Select agents\n")
        agents = select_agents(dojo_root)

        console.print("\n[bold cyan]Step 4:[/bold cyan] Select code standards\n")
        instructions = select_instructions()

        return {
            "skills": skills,
            "agents": agents,
            "instructions": instructions,
        }


def cmd_install(dojo_root: Path, target: Path, profile: dict) -> None:
    """Apply the profile to a target project directory."""
    console.print(f"\n[bold]Installing to:[/bold] {target}\n")

    actions = apply_to_project(
        dojo_root,
        target,
        profile.get("skills", {}),
        profile.get("agents", []),
        profile.get("instructions", []),
    )

    console.print("[green]✓ Installed:[/green]")
    for action in actions:
        console.print(f"  [dim]{action}[/dim]")

    # Save profile
    profile_path = save_profile(target, profile)
    console.print(f"\n[dim]Profile saved to {profile_path}[/dim]")


def cmd_preview(dojo_root: Path, profile: dict) -> None:
    """Preview the generated copilot-instructions.md."""
    content = generate_instructions(
        dojo_root,
        profile.get("skills", {}),
        profile.get("agents", []),
        profile.get("instructions", []),
    )
    console.print(Panel(content, title="Generated copilot-instructions.md", border_style="cyan"))


def main() -> None:
    args = sys.argv[1:]

    # ── --profile <name> activates a multi-instance dojo root ────────
    profile_name: str | None = None
    cleaned: list[str] = []
    i = 0
    while i < len(args):
        if args[i] == "--profile" and i + 1 < len(args):
            profile_name = args[i + 1]
            i += 2
            continue
        if args[i].startswith("--profile="):
            profile_name = args[i].split("=", 1)[1]
            i += 1
            continue
        cleaned.append(args[i])
        i += 1
    args = cleaned

    if profile_name:
        from dojo_cli.profiles import resolve_dojo_root
        try:
            dojo_root = resolve_dojo_root(profile_name)
        except FileNotFoundError as e:
            console.print(f"[red]{e}[/red]")
            sys.exit(1)
    else:
        dojo_root = _find_dojo_root()

    show_banner()

    from dojo_cli.registry import find_command

    if not args:
        _interactive_menu(dojo_root)
        return

    cmd = find_command(args[0])
    if cmd is None:
        console.print(f"[red]Unknown command: {args[0]}[/red]\n")
        _show_help()
        return
    cmd.handler(dojo_root, args[1:])


def _interactive_menu(dojo_root: Path) -> None:
    """Full interactive menu loop."""
    from InquirerPy import inquirer

    profile: dict = {"skills": {}, "agents": [], "instructions": []}

    # Check for existing profile in cwd
    existing = load_profile(Path.cwd())
    if existing:
        console.print("\n[dim]Found existing profile in current directory.[/dim]")
        profile = existing

    while True:
        console.print()
        skill_count = sum(len(v) for v in profile.get("skills", {}).values())
        agent_count = len(profile.get("agents", []))

        choice = inquirer.select(
            message="What would you like to do?",
            choices=[
                {"name": f"🛒 Browse & Select Skills          ({skill_count} selected)", "value": "select"},
                {"name": f"👤 Browse & Select Agents          ({agent_count} selected)", "value": "agents"},
                {"name": "📋 Select Code Standards", "value": "instructions"},
                {"name": "📦 Use a Preset Profile", "value": "preset"},
                {"name": "👁️  View Current Selections", "value": "view"},
                {"name": "👁️  Preview copilot-instructions.md", "value": "preview"},
                {"name": "🚀 Install to Project", "value": "install"},
                {"name": "💾 Save Profile", "value": "save"},
                {"name": "❌ Exit", "value": "exit"},
            ],
            pointer="▸",
        ).execute()

        if choice == "select":
            profile["skills"] = select_all_skills(dojo_root, profile.get("skills"))
        elif choice == "agents":
            profile["agents"] = select_agents(dojo_root, profile.get("agents"))
        elif choice == "instructions":
            profile["instructions"] = select_instructions(profile.get("instructions"))
        elif choice == "preset":
            preset = select_preset()
            if preset:
                profile = {
                    "skills": dict(preset["skills"]),
                    "agents": list(preset["agents"]),
                    "instructions": list(preset["instructions"]),
                }
                console.print("[green]✓ Preset loaded.[/green]")
        elif choice == "view":
            show_current_profile(profile)
        elif choice == "preview":
            cmd_preview(dojo_root, profile)
        elif choice == "install":
            target_str = inquirer.text(
                message="Target project directory (Enter for current directory):",
                default=str(Path.cwd()),
            ).execute()
            target = Path(target_str).resolve()
            if confirm_action(f"Install to {target}?"):
                cmd_install(dojo_root, target, profile)
        elif choice == "save":
            target_str = inquirer.text(
                message="Save profile to (Enter for current directory):",
                default=str(Path.cwd()),
            ).execute()
            target = Path(target_str).resolve()
            profile_path = save_profile(target, profile)
            console.print(f"[green]✓ Profile saved to {profile_path}[/green]")
        elif choice == "exit":
            console.print("[dim]Sayōnara. 🥋[/dim]")
            break


def _show_help() -> None:
    from dojo_cli.registry import help_commands

    help_table = Table(title="dojo — Copilot Agents Dojo CLI", border_style="cyan")
    help_table.add_column("Command", style="bold green", width=25)
    help_table.add_column("Description", width=55)

    help_table.add_row("dojo", "Interactive marketplace menu")
    for cmd in help_commands():
        help_table.add_row(cmd.usage or f"dojo {cmd.name}", cmd.summary)

    console.print(help_table)
    console.print("\n[dim]Examples:[/dim]")
    console.print("  [green]dojo[/green]                         # Interactive marketplace")
    console.print("  [green]dojo skills[/green]                  # Browse all skills")
    console.print("  [green]dojo select[/green]                  # Pick skills for your project")
    console.print("  [green]dojo install ~/my-project[/green]    # Install to a project")
    console.print()


if __name__ == "__main__":
    main()
