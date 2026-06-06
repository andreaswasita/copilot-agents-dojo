"""Behavioural tests for the safety-guardrails skill's safety_guard core.

The classifier and tree evaluator are pure functions, so most tests import and
call them directly (no shell needed — fully portable on CI). One subprocess
smoke test exercises the actual CLI via ``sys.executable`` to prove wiring.

These are invariant tests, not change-detectors: they assert behaviour
(this command is risky / this one is not), never snapshots of repo data.
"""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parents[1]
GUARD_DIR = REPO_ROOT / "skills" / "safety-guardrails" / "scripts"
GUARD_PY = GUARD_DIR / "safety_guard.py"

sys.path.insert(0, str(GUARD_DIR))
import safety_guard as sg  # noqa: E402


# --------------------------------------------------------------- command guard
RISKY = [
    "rm -rf /",
    "rm -rf ~",
    "rm  -rf  .",
    "rm -fr *",
    "rm -Rf /usr",
    "sudo rm -rf --no-preserve-root /",
    "git push --force origin main",
    "git push -f",
    "git push --force-with-lease origin main",
    "git reset --hard HEAD~3",
    "git clean -fdx",
    "git checkout -- .",
    "git restore .",
    "dd if=/dev/zero of=/dev/sda",
    "mkfs.ext4 /dev/sdb1",
    "chmod -R 777 .",
]

SAFE = [
    "ls -la",
    "npm install",
    "git commit -m 'msg'",
    "git push origin feature/x",
    "rm file.txt",
    "rm -r build",          # recursive but no force
    "rm -rf /tmp/mybuild",  # forced+recursive but a safe build path
    "rm -rf ./dist",
    "git status",
    "cat README.md",
]


@pytest.mark.parametrize("cmd", RISKY)
def test_risky_commands_are_flagged(cmd):
    findings = sg.classify_command(cmd)
    assert findings, f"expected a finding for: {cmd}"


@pytest.mark.parametrize("cmd", SAFE)
def test_safe_commands_are_not_flagged(cmd):
    findings = sg.classify_command(cmd)
    assert not findings, f"unexpected finding for {cmd!r}: {[f.reason for f in findings]}"


def test_blank_command_is_safe():
    assert sg.classify_command("") == []
    assert sg.classify_command("   ") == []


def test_extra_whitespace_does_not_hide_a_footgun():
    assert sg.classify_command("rm    -rf     /")


def test_force_push_reason_mentions_history():
    findings = sg.classify_command("git push --force")
    assert any("history" in f.reason for f in findings)


# ------------------------------------------------------------------ tree guard
def test_tree_flags_mass_deletions():
    lines = ["D  a.py", "D  b.py", " D c.py", "D  d.py"]
    findings = sg.evaluate_tree(lines, max_deletions=3, require_clean=False)
    assert any("deletion" in f.reason for f in findings)


def test_tree_below_threshold_is_clean():
    lines = ["D  a.py", " M b.py"]
    findings = sg.evaluate_tree(lines, max_deletions=3, require_clean=False)
    assert findings == []


def test_tree_require_clean_flags_dirty_tree():
    lines = [" M only-a-modification.py"]
    findings = sg.evaluate_tree(lines, max_deletions=99, require_clean=True)
    assert any("not clean" in f.reason for f in findings)


def test_tree_require_clean_passes_on_empty():
    assert sg.evaluate_tree([], max_deletions=3, require_clean=True) == []


# ------------------------------------------------------------------ CLI wiring
def test_cli_command_exit_codes():
    risky = subprocess.run(
        [sys.executable, str(GUARD_PY), "command", "rm -rf /"],
        capture_output=True, text=True, timeout=30,
    )
    assert risky.returncode == 1
    assert "RISKY" in risky.stdout

    safe = subprocess.run(
        [sys.executable, str(GUARD_PY), "command", "ls -la"],
        capture_output=True, text=True, timeout=30,
    )
    assert safe.returncode == 0
    assert "OK" in safe.stdout
