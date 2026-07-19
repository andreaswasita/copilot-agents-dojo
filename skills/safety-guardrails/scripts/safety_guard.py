#!/usr/bin/env python3
"""Copilot Agents Dojo — Safety Guard (heuristic preflight lint).

Two stateless guards an agent runs BEFORE a risky action:

  command  Flag obviously-destructive shell commands (rm -rf /, force-push,
           reset --hard, dd, mkfs, ...) so the agent pauses and confirms.
  tree     Flag an unsafe working-tree state (mass staged deletions, or a
           dirty tree when a clean one is required) before a risky op.

THIS IS A HEURISTIC SPEED BUMP, NOT A SANDBOX. It does not parse shell grammar
and cannot stop execution. It is trivially bypassed by quoting, command
substitution, variable expansion, aliases, or alternate binaries (/bin/rm).
Its only job is to catch the common, obvious footguns and force a human/agent
confirmation. Never rely on it as a security boundary.

Pure stdlib so it runs in any CI. Exit codes:
  0  no concern found (allow)
  1  flagged — the agent must stop and confirm
  2  invocation error
"""
from __future__ import annotations

import argparse
import re
import subprocess
import sys
from dataclasses import dataclass

@dataclass
class Finding:
    severity: str  # "high" | "medium"
    reason: str


# Catastrophic delete targets: filesystem root, home, cwd, glob, or a top-level
# system directory. A specific build path like /tmp/x or ./dist is intentionally
# NOT flagged to keep false positives low.
_DANGER_TARGET = re.compile(
    r"(?:^|\s)(?:"
    r"/|~|~/|\.|\./|\*|/\*|\$HOME|\$\{HOME\}"
    r"|/(?:etc|usr|var|home|bin|sbin|lib|lib64|boot|dev|root|sys|proc|opt)(?:/\S*)?"
    r")(?=\s|$)"
)


def _rm_recursive_force(norm: str) -> bool:
    if not re.search(r"\brm\b", norm):
        return False
    has_r = bool(re.search(r"(?:^|\s)-\w*[rR]\w*(?:\s|$)", norm)) or "--recursive" in norm
    has_f = bool(re.search(r"(?:^|\s)-\w*f\w*(?:\s|$)", norm)) or "--force" in norm
    return has_r and has_f


# Each rule: (compiled pattern, severity, human reason). Patterns run against a
# whitespace-normalized copy of the command.
_RULES: list[tuple[re.Pattern[str], str, str]] = [
    (
        re.compile(r"\bgit\b.*\bpush\b.*(--force\b|--force-with-lease=?\S*\s|(?<!-)\s-f\b|\s\+[\w/]+:)"),
        "high",
        "force-push can overwrite remote history (use a PR; never force-push shared branches)",
    ),
    (
        re.compile(r"\bgit\b.*\breset\b.*--hard"),
        "high",
        "git reset --hard discards uncommitted work irrecoverably",
    ),
    (
        re.compile(r"\bgit\b.*\bclean\b.*-\w*f\w*"),
        "medium",
        "git clean -f deletes untracked files (add -n to preview first)",
    ),
    (
        re.compile(r"\bgit\b.*\b(checkout|restore)\b.*(--\s+\.|\s\.\s*$|--staged\s+\.)"),
        "medium",
        "git checkout/restore '.' discards local changes across the tree",
    ),
    (
        re.compile(r"\bgit\b.*\b(filter-branch|filter-repo)\b|\bgit\b.*\brebase\b.*(-i|--interactive).*\b(main|master)\b"),
        "high",
        "history rewrite on a shared branch is destructive and hard to undo",
    ),
    (
        re.compile(r"\bdd\b.*\bof=/dev/"),
        "high",
        "dd writing to a device node can destroy a disk",
    ),
    (
        re.compile(r"\bmkfs\b|\bmke2fs\b"),
        "high",
        "mkfs reformats a filesystem",
    ),
    (
        re.compile(r">\s*/dev/(sd|nvme|disk|hd)\w*"),
        "high",
        "redirecting output onto a block device corrupts the disk",
    ),
    (
        re.compile(r"\bchmod\b.*(-R\b.*\b777\b|\b777\b.*-R\b)"),
        "medium",
        "chmod -R 777 makes a tree world-writable",
    ),
    (
        re.compile(r"\b(shred|truncate)\b.*(-\w*s?\s*0|\b/)"),
        "medium",
        "shred/truncate can irreversibly wipe file contents",
    ),
    (
        re.compile(r":\s*\(\s*\)\s*\{\s*:\s*\|\s*:\s*&\s*\}\s*;\s*:"),
        "high",
        "fork bomb",
    ),
]


def _normalize(command: str) -> str:
    return re.sub(r"\s+", " ", command.strip())


def classify_command(command: str) -> list[Finding]:
    """Return findings for a single command string. Empty = no concern."""
    norm = _normalize(command)
    if not norm:
        return []
    findings: list[Finding] = []
    seen: set[str] = set()

    def add(severity: str, reason: str) -> None:
        if reason not in seen:
            findings.append(Finding(severity, reason))
            seen.add(reason)

    if _rm_recursive_force(norm):
        if _DANGER_TARGET.search(norm):
            add("high", "recursive force-delete of a dangerous path (rm -rf on /, ~, ., *, or a system dir)")
        if "--no-preserve-root" in norm:
            add("high", "rm with --no-preserve-root removes the root filesystem guard")

    for pattern, severity, reason in _RULES:
        if pattern.search(norm):
            add(severity, reason)
    return findings


def _run_command_guard(command: str) -> int:
    findings = classify_command(command)
    if not findings:
        print(f"OK - no obvious footgun detected in: {command.strip()}")
        print("(Heuristic only - still think before you run it.)")
        return 0
    print(f"RISKY command flagged: {command.strip()}")
    for f in findings:
        print(f"  [{f.severity}] {f.reason}")
    print("STOP. Confirm intent (and prefer a reversible alternative) before running.")
    return 1


def _git_porcelain(cwd: str | None) -> list[str] | None:
    try:
        proc = subprocess.run(
            ["git", "status", "--porcelain"],
            cwd=cwd,
            capture_output=True,
            text=True,
            timeout=15,
        )
    except (OSError, subprocess.SubprocessError):
        return None
    if proc.returncode != 0:
        return None
    return [ln for ln in proc.stdout.splitlines() if ln.strip()]


def evaluate_tree(lines: list[str], max_deletions: int, require_clean: bool) -> list[Finding]:
    """Pure tree-state evaluation over `git status --porcelain` lines."""
    findings: list[Finding] = []
    deletions = sum(1 for ln in lines if "D" in ln[:2])
    if deletions >= max_deletions:
        findings.append(
            Finding("high", f"{deletions} file deletion(s) staged/pending (threshold {max_deletions})")
        )
    if require_clean and lines:
        findings.append(Finding("medium", f"working tree is not clean ({len(lines)} change(s) present)"))
    return findings


def _run_tree_guard(cwd: str | None, max_deletions: int, require_clean: bool) -> int:
    lines = _git_porcelain(cwd)
    if lines is None:
        print("OK - not a git repository (tree guard skipped).")
        return 0
    findings = evaluate_tree(lines, max_deletions, require_clean)
    if not findings:
        print(f"OK - tree state acceptable ({len(lines)} pending change(s)).")
        return 0
    print("Unsafe working-tree state:")
    for f in findings:
        print(f"  [{f.severity}] {f.reason}")
    print("STOP. Commit/stash or review before the risky operation.")
    return 1


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Heuristic safety preflight lint.")
    sub = parser.add_subparsers(dest="mode", required=True)

    p_cmd = sub.add_parser("command", help="Flag a destructive shell command")
    p_cmd.add_argument("command", help="The command string to inspect")

    p_tree = sub.add_parser("tree", help="Flag an unsafe working-tree state")
    p_tree.add_argument("--cwd", default=None, help="Directory to inspect (default: current)")
    p_tree.add_argument("--max-deletions", type=int, default=3, help="Deletion count that trips the guard")
    p_tree.add_argument("--require-clean", action="store_true", help="Also flag any dirty tree")

    args = parser.parse_args(argv)
    if args.mode == "command":
        return _run_command_guard(args.command)
    if args.mode == "tree":
        return _run_tree_guard(args.cwd, args.max_deletions, args.require_clean)
    parser.error("unknown mode")
    return 2


if __name__ == "__main__":
    sys.exit(main())
