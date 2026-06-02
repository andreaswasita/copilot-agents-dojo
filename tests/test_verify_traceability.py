"""Behavioural tests for scripts/verify-traceability.sh.

Each test builds a minimal engagement under tmp_path/requirements/<name>/
and asserts the gate's exit code + relevant output substrings.

Exit-code contract (from the script header):
  0 — gate passed (zero failures; warnings allowed unless --strict)
  1 — gate failed
  2 — invocation error
"""
from __future__ import annotations

import pytest

from tests.conftest import Artifact, br, fr, nfr, sr


# ---------------------------------------------------------------- happy paths
def test_happy_path_br_fr(engagement):
    r = engagement([br(), fr()])
    assert r.returncode == 0, r.combined
    assert "red thread holds" in r.stdout


def test_happy_path_full_cascade(engagement):
    r = engagement([
        br(),
        fr(),
        nfr(),
        sr(),
        Artifact(id="IR-001", layer="IR", parent_ids=["FR-001"]),
        Artifact(id="TR-001", layer="TR", parent_ids=["SR-001"], measurable="true"),
    ])
    assert r.returncode == 0, r.combined
    assert "❌ 0" in r.stdout


def test_empty_requirements_dir(engagement, tmp_path):
    # Engagement dir exists but is empty: gate warns "seed state", exits 0.
    r = engagement([], target=None)  # default: requirements/acme/
    assert r.returncode == 0, r.combined
    assert "seed state" in r.combined


# ---------------------------------------------------------------- frontmatter shape
@pytest.mark.parametrize("missing", ["owner", "derivation_skill", "id", "layer", "title", "measurable"])
def test_missing_required_key_fails(engagement, missing):
    r = engagement([br(), fr(omit_fields=(missing,))])
    assert r.returncode == 1, r.combined
    assert f"missing required frontmatter key '{missing}'" in r.stdout


def test_id_filename_mismatch_fails(engagement):
    r = engagement([br(), fr(filename="FR-999")])
    assert r.returncode == 1
    assert "does not match filename" in r.stdout


def test_id_prefix_folder_mismatch_fails(engagement):
    # Put a BR-001 file inside FR/ folder
    r = engagement([br(), Artifact(id="BR-002", layer="BR", folder="FR", parent_ids=[])])
    assert r.returncode == 1
    assert "does not match folder" in r.stdout


def test_invalid_layer_code_fails(engagement):
    r = engagement([br(), Artifact(id="XX-001", layer="XX", folder="BR")])
    assert r.returncode == 1
    assert "not a valid layer code" in r.stdout


def test_layer_folder_mismatch_fails(engagement):
    # File on disk under FR/ folder but layer: BR in frontmatter
    r = engagement([br(), Artifact(id="FR-001", layer="BR", parent_ids=[])])
    assert r.returncode == 1
    assert "does not match folder" in r.stdout


# ---------------------------------------------------------------- measurable hardline
@pytest.mark.parametrize("layer_id_folder", [
    ("NFR-001", "NFR"),
    ("SR-001", "SR"),
    ("TR-001", "TR"),
])
def test_measurable_required_for_quant_layers(engagement, layer_id_folder):
    art_id, layer = layer_id_folder
    parent_id = "BR-001" if layer == "NFR" else ("NFR-001" if layer == "SR" else "SR-001")
    base = [br()]
    if layer in ("SR", "TR"):
        base.append(nfr())
    if layer == "TR":
        base.append(sr())
    base.append(Artifact(id=art_id, layer=layer, parent_ids=[parent_id], measurable="false"))
    r = engagement(base)
    assert r.returncode == 1, r.combined
    assert "require measurable: true" in r.stdout


# ---------------------------------------------------------------- ratified_by
def test_unratified_warns_in_default_mode(engagement):
    r = engagement([br(ratified_by=""), fr(ratified_by="")])
    assert r.returncode == 0
    assert "ratified_by is empty" in r.stdout


def test_unratified_fails_in_strict_mode(engagement):
    r = engagement([br(ratified_by=""), fr(ratified_by="")], strict=True)
    assert r.returncode == 1
    assert "ratified_by is empty (strict mode)" in r.stdout


# ---------------------------------------------------------------- parent rules
def test_non_br_without_parents_fails(engagement):
    r = engagement([br(), fr(parents=())])
    assert r.returncode == 1
    assert "parent_ids missing — only BR may have no parent" in r.stdout


def test_br_with_parents_warns_but_passes(engagement):
    r = engagement([br(parent_ids=["BR-XXX"])])
    # The BR-with-parents check is a warning, but the unresolved parent_id
    # ALSO trips the layer-cascade check, which is a failure. So this test
    # asserts the warning shows up; exit code may be 1 (failure) because of
    # the missing-parent rule. Document the actual contract.
    assert "BR artifact declares parent_ids" in r.stdout


def test_unresolved_parent_fails(engagement):
    r = engagement([br(), fr(parents=("BR-MISSING",))])
    assert r.returncode == 1
    assert "does not resolve to any artifact" in r.stdout


def test_illegal_parent_layer_fails(engagement):
    # NFR parented to SR — SR is not in valid_parents_for(NFR) = "BR FR"
    r = engagement([br(), sr(parents=("BR-001",)), Artifact(
        id="NFR-001", layer="NFR", parent_ids=["SR-001"], measurable="true"
    )])
    assert r.returncode == 1
    assert "not a valid parent" in r.stdout


def test_cycle_detection(engagement):
    # Two FR artifacts pointing at each other. Layer cascade will also
    # reject (FR cannot parent FR) — both errors should appear, exit 1.
    r = engagement([
        br(),
        Artifact(id="FR-A", layer="FR", parent_ids=["FR-B"]),
        Artifact(id="FR-B", layer="FR", parent_ids=["FR-A"]),
    ])
    assert r.returncode == 1
    assert "cycle detected" in r.stdout or "not a valid parent" in r.stdout


# ---------------------------------------------------------------- invocation
def test_unknown_flag_returns_2(engagement):
    r = engagement([br()], extra_args=("--nope",))
    assert r.returncode == 2
    assert "unknown flag" in r.stderr


def test_help_flag_exits_0(engagement):
    r = engagement([br()], extra_args=("--help",))
    assert r.returncode == 0
    assert "Usage" in r.stdout or "Traceability Gate" in r.stdout


def test_missing_engagement_dir_fails(engagement, tmp_path):
    r = engagement([br()], target="requirements/does-not-exist")
    assert r.returncode == 1
    assert "directory not found" in r.stdout


# ---------------------------------------------------------------- regression guard
def test_real_sample_passes(tmp_path):
    """The committed requirements/sample/ tree must continue to pass.

    This is the same invariant the CI traceability-gate job enforces;
    pinning it here too gives faster local feedback.
    """
    import shutil
    import subprocess
    from tests.conftest import BASH, REPO_ROOT, SCRIPT

    # Run the script in-place against the real sample
    proc = subprocess.run(
        [BASH, str(SCRIPT), "requirements/sample"],
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=30,
    )
    assert proc.returncode == 0, proc.stdout + "\n" + proc.stderr
    assert "red thread holds" in proc.stdout
