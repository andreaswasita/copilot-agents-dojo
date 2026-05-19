"""Centralized command registry — single source of truth for CLI commands.

`main()`, the interactive menu, and `--help` all derive from this registry.
Adding a command means adding one entry here — no other file changes needed.

A handler receives `(dojo_root, args)` and returns `int | None` (exit code).
"""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Callable, Optional


@dataclass(frozen=True)
class Command:
    """One CLI command."""

    name: str                           # primary command name, e.g. "skills"
    summary: str                        # one-line description for --help
    handler: Callable[[Path, list[str]], Optional[int]]
    aliases: tuple[str, ...] = ()       # alternative names (e.g. "menu" → "marketplace")
    menu_label: Optional[str] = None    # label in interactive menu; None = not in menu
    menu_value: Optional[str] = None    # value returned by menu select; defaults to name
    menu_icon: str = "▫️"
    menu_order: int = 100               # lower = higher in menu
    help_visible: bool = True           # show in `dojo help` table
    usage: str = ""                     # short usage string, e.g. "dojo install [path]"
    examples: tuple[str, ...] = ()      # extra examples for --help

    def matches(self, token: str) -> bool:
        return token == self.name or token in self.aliases


# ── handler imports kept lazy to avoid circular imports at module load ─────
def _h_skills(dojo_root: Path, args: list[str]) -> None:
    from dojo_cli.app import cmd_skills
    cmd_skills(dojo_root)


def _h_agents(dojo_root: Path, args: list[str]) -> None:
    from dojo_cli.app import cmd_agents
    cmd_agents(dojo_root)


def _h_select(dojo_root: Path, args: list[str]) -> None:
    from dojo_cli.app import cmd_select
    from dojo_cli.marketplace import confirm_action, console, show_current_profile
    from dojo_cli.profiles import save_profile

    profile = cmd_select(dojo_root)
    show_current_profile(profile)
    if confirm_action("Save this profile?"):
        target = Path(args[0]) if args else Path.cwd()
        save_profile(target, profile)
        console.print(f"[green]✓ Profile saved to {target / '.dojo-profile.yml'}[/green]")


def _h_install(dojo_root: Path, args: list[str]) -> None:
    from dojo_cli.app import cmd_install, cmd_select
    from dojo_cli.marketplace import console
    from dojo_cli.profiles import load_profile

    target = Path(args[0]) if args else Path.cwd()
    profile = load_profile(target) or load_profile(Path.cwd())
    if not profile:
        console.print("[yellow]No profile found. Run `dojo select` first or use interactive mode.[/yellow]")
        profile = cmd_select(dojo_root)
    cmd_install(dojo_root, target, profile)


def _h_preview(dojo_root: Path, args: list[str]) -> None:
    from dojo_cli.app import cmd_preview, cmd_select
    from dojo_cli.marketplace import console
    from dojo_cli.profiles import load_profile

    target = Path(args[0]) if args else Path.cwd()
    profile = load_profile(target) or load_profile(Path.cwd())
    if not profile:
        console.print("[yellow]No profile found. Starting selection...[/yellow]\n")
        profile = cmd_select(dojo_root)
    cmd_preview(dojo_root, profile)


def _h_profile(dojo_root: Path, args: list[str]) -> None:
    from dojo_cli.marketplace import console, show_current_profile
    from dojo_cli.profiles import load_profile

    target = Path(args[0]) if args else Path.cwd()
    profile = load_profile(target)
    if profile:
        show_current_profile(profile)
    else:
        console.print("[dim]No profile found. Run `dojo select` to create one.[/dim]")


def _h_marketplace(dojo_root: Path, args: list[str]) -> None:
    from dojo_cli.app import _interactive_menu
    _interactive_menu(dojo_root)


def _h_help(dojo_root: Path, args: list[str]) -> None:
    from dojo_cli.app import _show_help
    _show_help()


# ── The registry ──────────────────────────────────────────────────────────
COMMAND_REGISTRY: tuple[Command, ...] = (
    Command(
        name="marketplace",
        aliases=("menu",),
        summary="Interactive marketplace menu (default)",
        handler=_h_marketplace,
        usage="dojo",
        menu_label=None,  # the menu launches it; don't list itself
        help_visible=False,  # default action; documented as the bare command
    ),
    Command(
        name="skills",
        summary="List all available skills",
        handler=_h_skills,
        usage="dojo skills",
        menu_label="Browse Skills",
        menu_icon="🛒",
        menu_order=10,
    ),
    Command(
        name="agents",
        summary="List all available agents",
        handler=_h_agents,
        usage="dojo agents",
        menu_label="Browse Agents",
        menu_icon="👤",
        menu_order=20,
    ),
    Command(
        name="select",
        summary="Interactive skill/agent selection flow",
        handler=_h_select,
        usage="dojo select",
        menu_label="Select for project",
        menu_icon="✏️",
        menu_order=30,
    ),
    Command(
        name="install",
        summary="Install selected skills/agents to a project",
        handler=_h_install,
        usage="dojo install [path]",
        menu_label="Install to project",
        menu_icon="🚀",
        menu_order=40,
        examples=("dojo install ~/my-project",),
    ),
    Command(
        name="preview",
        summary="Preview generated copilot-instructions.md",
        handler=_h_preview,
        usage="dojo preview [path]",
        menu_label="Preview instructions",
        menu_icon="👁️",
        menu_order=50,
    ),
    Command(
        name="profile",
        summary="View saved profile for a project",
        handler=_h_profile,
        usage="dojo profile [path]",
        menu_label="View profile",
        menu_icon="📋",
        menu_order=60,
    ),
    Command(
        name="help",
        aliases=("--help", "-h"),
        summary="Show this help",
        handler=_h_help,
        usage="dojo help",
        menu_label=None,
        help_visible=True,
    ),
)


# ── lookup helpers ─────────────────────────────────────────────────────────
def find_command(token: str) -> Optional[Command]:
    """Return the Command matching `token` (name or alias), else None."""
    for cmd in COMMAND_REGISTRY:
        if cmd.matches(token):
            return cmd
    return None


def help_commands() -> list[Command]:
    """Commands exposed in `dojo help`."""
    return [c for c in COMMAND_REGISTRY if c.help_visible]


def menu_commands() -> list[Command]:
    """Commands surfaced in the interactive marketplace menu, in display order."""
    return sorted(
        (c for c in COMMAND_REGISTRY if c.menu_label),
        key=lambda c: c.menu_order,
    )
