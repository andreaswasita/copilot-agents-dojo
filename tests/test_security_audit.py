"""Behavioural tests for the security-audit skill's scanner core.

These are invariant tests, not change-detectors: they assert behaviour (this
pattern is a finding, this clean code is not, re-runs are byte-identical),
never snapshots of repo data.

Secret-shaped fixtures are GENERATED AT RUNTIME by concatenation so no real
token-shaped literal is ever committed (which would trip secret scanners /
push protection). The scanner's own regex patterns live in the scanner module.
"""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parents[1]
SCAN_DIR = REPO_ROOT / "skills" / "security-audit" / "scripts"
SCAN_PY = SCAN_DIR / "security_audit.py"

sys.path.insert(0, str(SCAN_DIR))
import security_audit as sa  # noqa: E402


# --- runtime-generated fixtures (never commit token-shaped literals) ---
def _aws_key() -> str:
    return "AKIA" + "A" * 16


def _github_token() -> str:
    return "ghp_" + "b" * 36


def _slack_token() -> str:
    return "xoxb-" + "1" * 20


def _scan(text: str, rules=None):
    rules = rules if rules is not None else sa.active_rules(False)
    return sa.scan_text("f.py", text, rules)


# --- positive detections (default high-confidence profile) ---
@pytest.mark.parametrize("line, rule_id", [
    ("-----BEGIN PRIVATE KEY-----", "SA-001"),
    ("-----BEGIN RSA PRIVATE KEY-----", "SA-001"),
    ("requests.get(url, verify=False)", "SA-010"),
    ("subprocess.run(cmd, shell=True)", "SA-011"),
    ("os.system(user_input)", "SA-011"),
    ("data = pickle.loads(blob)", "SA-012"),
    ("cfg = yaml.load(stream)", "SA-012"),
])
def test_high_confidence_detected(line, rule_id):
    findings, _ = _scan(line)
    assert any(f.rule_id == rule_id for f in findings), f"{rule_id} not found in: {line}"


def test_secret_tokens_detected():
    for token, rule_id in [
        (_aws_key(), "SA-002"),
        (_github_token(), "SA-003"),
        (_slack_token(), "SA-004"),
    ]:
        findings, _ = _scan(f"secret = '{token}'")
        assert any(f.rule_id == rule_id for f in findings), f"{rule_id} missing"


# --- negative: clean code yields nothing ---
@pytest.mark.parametrize("line", [
    "x = 1 + 2",
    "name = 'hello world'",
    "requests.get(url, verify=True)",
    "subprocess.run(['ls', '-la'])",
    "data = json.loads(blob)",
    "cfg = yaml.safe_load(stream)",
])
def test_clean_code_no_findings(line):
    findings, _ = _scan(line)
    assert findings == [], f"unexpected finding on clean line: {line}"


def test_placeholder_credentials_rejected():
    # SA-021 (broad) should skip obvious placeholders.
    rules = sa.active_rules(True)
    for line in [
        "password = 'your_password_here'",
        "api_key = 'changeme123'",
        "token = '<your-token>'",
        "secret = 'example-secret-value'",
    ]:
        findings, _ = sa.scan_text("f.py", line, rules)
        assert not any(f.rule_id == "SA-021" for f in findings), line


# --- profile gating ---
def test_low_confidence_only_in_broad():
    line = "result = eval(expr)"
    default_findings, _ = sa.scan_text("f.py", line, sa.active_rules(False))
    broad_findings, _ = sa.scan_text("f.py", line, sa.active_rules(True))
    assert not any(f.rule_id == "SA-020" for f in default_findings)
    assert any(f.rule_id == "SA-020" for f in broad_findings)


# --- suppression ---
def test_inline_suppression():
    line = "requests.get(u, verify=False)  # security-audit: ignore SA-010"
    findings, suppressed = _scan(line)
    assert findings == []
    assert suppressed == 1


def test_preceding_line_suppression():
    text = "# security-audit: ignore SA-010\nrequests.get(u, verify=False)"
    findings, suppressed = _scan(text)
    assert findings == []
    assert suppressed == 1


# --- fingerprint includes line number ---
def test_fingerprint_distinguishes_lines():
    text = "requests.get(a, verify=False)\nrequests.get(b, verify=False)"
    findings, _ = _scan(text)
    assert len(findings) == 2
    assert findings[0].fingerprint != findings[1].fingerprint


# --- tree scan + idempotency ---
def _write(d: Path, name: str, content: str) -> None:
    (d / name).write_text(content, encoding="utf-8")


def test_scan_tree_and_idempotent(tmp_path):
    _write(tmp_path, "bad.py", f"key = '{_aws_key()}'\nrequests.get(u, verify=False)\n")
    _write(tmp_path, "good.py", "x = 1\n")
    rules = sa.active_rules(False)
    r1 = sa.scan_tree(tmp_path, sa.DEFAULT_IGNORE_FILES, rules, None)
    assert len(r1.findings) == 2
    out1 = sa.render_json(r1)
    r2 = sa.scan_tree(tmp_path, sa.DEFAULT_IGNORE_FILES, rules, None)
    out2 = sa.render_json(r2)
    assert out1 == out2  # byte-identical re-run


def test_ignore_globs(tmp_path):
    _write(tmp_path, "vendored.min.js", f"k='{_aws_key()}'")
    rules = sa.active_rules(False)
    r = sa.scan_tree(tmp_path, sa.DEFAULT_IGNORE_FILES, rules, None)
    assert r.findings == []


def test_ignored_dir_skipped(tmp_path):
    sub = tmp_path / "node_modules"
    sub.mkdir()
    _write(sub, "pkg.py", f"k='{_aws_key()}'")
    rules = sa.active_rules(False)
    r = sa.scan_tree(tmp_path, sa.DEFAULT_IGNORE_FILES, rules, None)
    assert r.findings == []


def test_binary_file_skipped(tmp_path):
    (tmp_path / "blob.bin").write_bytes(b"AKIA" + b"\x00" * 32)
    rules = sa.active_rules(False)
    r = sa.scan_tree(tmp_path, sa.DEFAULT_IGNORE_FILES, rules, None)
    assert r.findings == []


# --- CLI smoke + exit codes (via sys.executable, portable) ---
def _run(args, cwd):
    return subprocess.run(
        [sys.executable, str(SCAN_PY), *args],
        cwd=cwd, capture_output=True, text=True,
        encoding="utf-8", errors="replace", timeout=60,
    )


def test_cli_exit_zero_on_clean(tmp_path):
    _write(tmp_path, "ok.py", "x = 1\n")
    res = _run([str(tmp_path)], tmp_path)
    assert res.returncode == 0, res.stdout + res.stderr


def test_cli_exit_one_on_finding(tmp_path):
    _write(tmp_path, "bad.py", f"k = '{_aws_key()}'\n")
    res = _run([str(tmp_path)], tmp_path)
    assert res.returncode == 1, res.stdout + res.stderr


def test_cli_fail_on_gating(tmp_path):
    # A low-severity broad finding should not fail with default --fail-on high.
    _write(tmp_path, "weak.py", "h = hashlib.md5(b'x')\n")
    res_high = _run([str(tmp_path), "--profile", "broad", "--fail-on", "high"], tmp_path)
    assert res_high.returncode == 0, res_high.stdout
    res_low = _run([str(tmp_path), "--profile", "broad", "--fail-on", "low"], tmp_path)
    assert res_low.returncode == 1, res_low.stdout


def test_cli_json_valid(tmp_path):
    _write(tmp_path, "bad.py", f"k = '{_aws_key()}'\n")
    res = _run([str(tmp_path), "--format", "json"], tmp_path)
    payload = json.loads(res.stdout)
    assert payload["summary"]["high"] >= 1
    assert payload["findings"][0]["rule_id"] == "SA-002"


def test_cli_usage_error(tmp_path):
    res = _run([str(tmp_path / "does-not-exist")], tmp_path)
    assert res.returncode == 2


def test_cli_output_excluded_from_scan(tmp_path):
    _write(tmp_path, "bad.py", f"k = '{_aws_key()}'\n")
    out = tmp_path / "report.json"
    _run([str(tmp_path), "--output", str(out), "--format", "json"], tmp_path)
    # Second run: the previously written report (containing the key text) must
    # not be scanned and double-counted.
    _run([str(tmp_path), "--output", str(out), "--format", "json"], tmp_path)
    payload = json.loads(out.read_text(encoding="utf-8"))
    paths = {f["path"] for f in payload["findings"]}
    assert "report.json" not in paths
    assert payload["summary"]["high"] == 1
