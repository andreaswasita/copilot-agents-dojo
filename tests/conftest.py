"""Fixtures for the verify-traceability.sh pytest harness.

The harness invokes the real shell script as a subprocess inside an
isolated tmp_path so we never mutate the repo's own requirements/ tree.
"""
from __future__ import annotations

import os
import shutil
import subprocess
from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterable

import pytest

REPO_ROOT = Path(__file__).resolve().parents[1]
SCRIPT = REPO_ROOT / "scripts" / "verify-traceability.sh"
BASH = os.environ.get("DOJO_BASH", "bash")


@dataclass
class Artifact:
    """One requirements artifact written under requirements/<eng>/<LAYER>/<id>.md."""
    id: str
    layer: str
    title: str = "Test artifact"
    parent_ids: list[str] = field(default_factory=list)
    owner: str = "tester@example.com"
    measurable: str = "true"           # string so we can also pass invalid values
    ratified_by: str = "arb-2026-01-01"
    derivation_skill: str = "requirements-elicitation"
    extra_fields: dict[str, str] = field(default_factory=dict)
    omit_fields: tuple[str, ...] = ()
    body: str = "## Context\nFixture artifact."

    # The folder this file lands in. Defaults to self.layer but can be
    # overridden to deliberately mismatch (for the layer/folder test).
    folder: str | None = None
    # Filename stem. Defaults to self.id but can mismatch.
    filename: str | None = None

    def frontmatter(self) -> str:
        parents = "[" + ", ".join(self.parent_ids) + "]"
        candidates = [
            ("id", self.id),
            ("layer", self.layer),
            ("title", self.title),
            ("parent_ids", parents),
            ("owner", self.owner),
            ("measurable", self.measurable),
            ("ratified_by", self.ratified_by),
            ("derivation_skill", self.derivation_skill),
        ]
        lines = ["---"]
        for k, v in candidates:
            if k in self.omit_fields:
                continue
            lines.append(f"{k}: {v}")
        for k, v in self.extra_fields.items():
            lines.append(f"{k}: {v}")
        lines.append("---")
        return "\n".join(lines)

    def write(self, engagement_root: Path) -> Path:
        folder = self.folder if self.folder is not None else self.layer
        stem = self.filename if self.filename is not None else self.id
        target = engagement_root / folder / f"{stem}.md"
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(self.frontmatter() + "\n\n" + self.body + "\n", encoding="utf-8")
        return target


@dataclass
class GateResult:
    returncode: int
    stdout: str
    stderr: str

    @property
    def combined(self) -> str:
        return self.stdout + "\n" + self.stderr


@pytest.fixture
def engagement(tmp_path: Path):
    """Factory: build an isolated engagement dir and run verify-traceability.sh.

    Returns a function(artifacts, *, name="acme", strict=False,
    target=None, extra_args=()) that writes the artifacts and runs the
    script with cwd=tmp_path (so DOJO_ROOT resolves correctly).
    """
    def _build(
        artifacts: Iterable[Artifact],
        *,
        name: str = "acme",
        strict: bool = False,
        target: str | None = None,
        extra_args: tuple[str, ...] = (),
    ) -> GateResult:
        eng_root = tmp_path / "requirements" / name
        eng_root.mkdir(parents=True, exist_ok=True)
        for art in artifacts:
            art.write(eng_root)

        # Stage scripts/ inside tmp_path so DOJO_ROOT (computed as
        # dirname(SCRIPT_DIR)) resolves to tmp_path.
        scripts_dir = tmp_path / "scripts"
        scripts_dir.mkdir(exist_ok=True)
        staged_script = scripts_dir / "verify-traceability.sh"
        if not staged_script.exists():
            shutil.copy2(SCRIPT, staged_script)
            staged_script.chmod(0o755)

        argv = [BASH, str(staged_script)]
        if strict:
            argv.append("--strict")
        argv.extend(extra_args)
        if target == "":
            pass  # explicit empty: run with no positional → walk all engagements
        elif target is not None:
            argv.append(target)
        elif not extra_args:
            argv.append(f"requirements/{name}")

        proc = subprocess.run(
            argv,
            cwd=tmp_path,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=30,
        )
        return GateResult(proc.returncode, proc.stdout, proc.stderr)

    return _build


# Convenience builders for the canonical happy-path tree -----------------

def br(id_: str = "BR-001", parent_ids: list[str] | None = None, **kw) -> Artifact:
    return Artifact(id=id_, layer="BR", parent_ids=parent_ids or [], **kw)


def fr(id_: str = "FR-001", parents: tuple[str, ...] = ("BR-001",), **kw) -> Artifact:
    return Artifact(id=id_, layer="FR", parent_ids=list(parents), **kw)


def nfr(id_: str = "NFR-001", parents: tuple[str, ...] = ("BR-001",), **kw) -> Artifact:
    return Artifact(id=id_, layer="NFR", parent_ids=list(parents), measurable="true", **kw)


def sr(id_: str = "SR-001", parents: tuple[str, ...] = ("NFR-001",), **kw) -> Artifact:
    return Artifact(id=id_, layer="SR", parent_ids=list(parents), measurable="true", **kw)
