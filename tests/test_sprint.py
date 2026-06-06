"""Invariant tests for the G8 pipeline orchestrator (scripts/sprint.sh).

These assert behaviour, not snapshots: `steps` reflects the canonical
pipeline.tsv, `start --dry-run` writes nothing, real `start` scaffolds into an
isolated DOJO_ROOT (never the repo), and `--help` works.

CI runs the bash orchestrator via `pytest -q tests/`; locally set DOJO_BASH to a
bash on PATH (e.g. Git Bash on Windows).
"""
from __future__ import annotations

import os
import shutil
import subprocess
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
BASH = os.environ.get("DOJO_BASH", "bash")
SPRINT = REPO_ROOT / "scripts" / "sprint.sh"
PIPELINE = REPO_ROOT / "scripts" / "pipeline.tsv"


def _posix(p: Path) -> str:
    return str(p).replace("\\", "/")


def _rows() -> list[tuple[str, str]]:
    out = []
    for line in PIPELINE.read_text(encoding="utf-8").splitlines():
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        cols = line.split("\t")
        out.append((cols[0].strip(), cols[1].strip()))
    return out


def _run(args: list[str], env: dict | None = None) -> subprocess.CompletedProcess:
    full_env = {**os.environ, **(env or {})}
    return subprocess.run(
        [BASH, _posix(SPRINT), *args],
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=120,
        env=full_env,
    )


def test_steps_lists_every_phase_and_skill() -> None:
    result = _run(["steps"])
    assert result.returncode == 0, result.stderr
    for phase, skill in _rows():
        assert phase in result.stdout, f"steps missing phase {phase}"
        assert f"skills/{skill}/SKILL.md" in result.stdout, f"steps missing skill {skill}"


def test_start_dry_run_writes_nothing(tmp_path: Path) -> None:
    dojo = tmp_path / "dojo"
    (dojo / "tasks").mkdir(parents=True)
    result = _run(
        ["start", "Some example goal", "--dry-run"],
        env={"DOJO_ROOT": _posix(dojo)},
    )
    assert result.returncode == 0, result.stderr
    assert "dry run" in result.stdout
    # No files created anywhere under the isolated root.
    assert list((dojo / "tasks").iterdir()) == []


def test_start_scaffolds_into_isolated_root(tmp_path: Path) -> None:
    dojo = tmp_path / "dojo"
    board = dojo / "tasks" / "board"
    board.mkdir(parents=True)
    shutil.copy(REPO_ROOT / "tasks" / "board" / "000-template.md", board / "000-template.md")

    result = _run(["start", "Wire up the widget"], env={"DOJO_ROOT": _posix(dojo)})
    assert result.returncode == 0, result.stderr

    assert (dojo / "tasks" / "todo.md").is_file(), "start did not seed tasks/todo.md"
    created = list(board.glob("*-wire-up-the-widget.md"))
    assert created, f"start did not open a durable board task: {list(board.iterdir())}"
    # The repo's own tasks/board must be untouched (isolation held).
    repo_stray = list((REPO_ROOT / "tasks" / "board").glob("*-wire-up-the-widget.md"))
    assert not repo_stray, f"start leaked into the repo: {repo_stray}"


def test_help_runs() -> None:
    result = _run(["--help"])
    assert result.returncode == 0
    assert "pipeline orchestrator" in result.stdout.lower()
