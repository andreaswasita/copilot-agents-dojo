"""Behavioural tests for scripts/memory-recall.sh (and its memory_recall.py core).

Each test builds an isolated memory vault under tmp_path/memory/ and runs the
real wrapper script as a subprocess with DOJO_ROOT pointed at tmp_path, then
asserts invariants of the planning brief.

These are invariant tests, not change-detectors: they never assert hardcoded
counts of the repo's own seeded data.
"""
from __future__ import annotations

import os
import shutil
import subprocess
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = REPO_ROOT / "scripts"
WRAPPER = SCRIPTS / "memory-recall.sh"
CORE = SCRIPTS / "memory_recall.py"
BASH = os.environ.get("DOJO_BASH", "bash")

MEMORY_FOLDERS = ("decisions", "patterns", "preferences", "sessions")


def _seed(root: Path, rel: str, frontmatter: dict[str, object], body: str) -> None:
    target = root / "memory" / rel
    target.parent.mkdir(parents=True, exist_ok=True)
    lines = ["---"]
    for k, v in frontmatter.items():
        if isinstance(v, list):
            lines.append(f"{k}: [{', '.join(str(x) for x in v)}]")
        else:
            lines.append(f"{k}: {v}")
    lines.append("---")
    target.write_text("\n".join(lines) + "\n\n" + body.strip() + "\n", encoding="utf-8")


@pytest.fixture
def recall(tmp_path: Path):
    """Factory: seed a vault, run memory-recall.sh, return (returncode, stdout)."""
    for folder in MEMORY_FOLDERS:
        (tmp_path / "memory" / folder).mkdir(parents=True, exist_ok=True)

    # Stage the wrapper + core inside tmp_path/scripts so DOJO_ROOT resolves
    # to tmp_path and the wrapper finds its python core next to it.
    staged_scripts = tmp_path / "scripts"
    staged_scripts.mkdir(exist_ok=True)
    shutil.copy2(WRAPPER, staged_scripts / WRAPPER.name)
    shutil.copy2(CORE, staged_scripts / CORE.name)
    (staged_scripts / WRAPPER.name).chmod(0o755)

    def _run(*args: str) -> tuple[int, str]:
        env = dict(os.environ, DOJO_ROOT=str(tmp_path))
        proc = subprocess.run(
            [BASH, str(staged_scripts / WRAPPER.name), *args],
            cwd=tmp_path,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=30,
            env=env,
        )
        return proc.returncode, proc.stdout

    _run.seed = lambda rel, fm, body: _seed(tmp_path, rel, fm, body)  # type: ignore[attr-defined]
    return _run


def test_topic_surfaces_relevant_decision(recall):
    recall.seed(
        "decisions/2026-04-12-postgres.md",
        {"type": "decision", "date": "2026-04-12", "status": "accepted", "tags": ["db"]},
        "# Use Postgres over DynamoDB\n\nSQL semantics needed for joins.",
    )
    rc, out = recall("--topic", "postgres")
    assert rc == 0, out
    assert "decisions/2026-04-12-postgres" in out
    assert "why:" in out


def test_dedup_merges_reasons(recall):
    recall.seed(
        "decisions/2026-04-12-postgres.md",
        {"type": "decision", "date": "2026-04-12", "status": "accepted", "tags": ["db"]},
        "# Use Postgres over DynamoDB\n\nSQL semantics.",
    )
    rc, out = recall("--topic", "postgres")
    assert rc == 0, out
    # The decision appears exactly once, with both signals in one why-line.
    assert out.count("decisions/2026-04-12-postgres") == 1
    assert "active decision" in out and "matched title" in out


def test_blank_topic_returns_active_decisions_not_whole_vault(recall):
    recall.seed(
        "decisions/2026-04-12-postgres.md",
        {"type": "decision", "date": "2026-04-12", "status": "accepted", "tags": []},
        "# Use Postgres\n\nBody.",
    )
    recall.seed(
        "decisions/2026-03-01-old.md",
        {"type": "decision", "date": "2026-03-01", "status": "superseded", "tags": []},
        "# Old queue choice\n\nReplaced.",
    )
    rc, out = recall()
    assert rc == 0, out
    assert "decisions/2026-04-12-postgres" in out
    assert "decisions/2026-03-01-old" not in out


def test_superseded_excluded_on_topic_match(recall):
    recall.seed(
        "decisions/2026-03-01-old.md",
        {"type": "decision", "date": "2026-03-01", "status": "superseded", "tags": ["queue"]},
        "# Use SQS for the queue\n\nReplaced.",
    )
    rc, out = recall("--topic", "queue")
    assert rc == 0, out
    assert "decisions/2026-03-01-old" not in out


def test_context_pattern_surfaced_by_language(recall):
    recall.seed(
        "patterns/retry-with-jitter.md",
        {"type": "pattern", "date": "2026-04-15", "status": "active", "tags": ["typescript"]},
        "# Retry with full jitter\n\nBackoff.",
    )
    rc, out = recall("--topic", "anything", "--language", "typescript")
    assert rc == 0, out
    assert "patterns/retry-with-jitter" in out


def test_empty_vault_is_safe(recall):
    rc, out = recall("--topic", "anything")
    assert rc == 0, out
    assert "No prior memory found" in out
