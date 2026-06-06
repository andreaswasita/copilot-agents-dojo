#!/usr/bin/env python3
"""Copilot Agents Dojo — Security Audit (heuristic scanner).

A deterministic, stdlib-only scanner that flags HIGH-CONFIDENCE security risks
in source code: committed secrets, disabled TLS verification, insecure
deserialization, shell injection sinks, and (in the broad profile) a wider set
of lower-confidence smells.

THIS IS A HEURISTIC ASSISTANT, NOT A SAST TOOL OR A PROOF OF SECURITY. It is a
regex line-scanner: it cannot follow data flow, cannot tell whether an `eval`
argument is attacker-controlled, and will miss anything not matching a rule.
Treat its output as triage leads for a human/LLM review, never as assurance.

Determinism / idempotency: the report contains no timestamps, absolute paths,
usernames, or environment data; traversal is sorted; paths are POSIX-relative;
newlines are normalized; JSON is key-sorted. Re-running on unchanged input
produces byte-identical output, so a persisted report diffs cleanly.

Exit codes: 0 = no findings at/above --fail-on; 1 = findings at/above it;
2 = usage error.
"""
from __future__ import annotations

import argparse
import fnmatch
import hashlib
import json
import os
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path

SEVERITY_ORDER = {"low": 0, "medium": 1, "high": 2}

DEFAULT_IGNORE_DIRS = {
    ".git", "node_modules", "dist", "build", "vendor", "venv", ".venv",
    "__pycache__", ".next", ".turbo", ".mypy_cache", ".pytest_cache",
    "coverage", ".coverage", ".idea", ".gradle", "target",
}
DEFAULT_IGNORE_FILES = [
    "*.lock", "package-lock.json", "pnpm-lock.yaml", "yarn.lock",
    "*.min.js", "*.min.css", "*.map", "*.svg", "*.png", "*.jpg", "*.jpeg",
    "*.gif", "*.ico", "*.pdf", "*.woff", "*.woff2", "*.ttf",
]

MAX_FILE_BYTES = 1_000_000
SUPPRESS_RE = re.compile(r"security-audit:\s*ignore\s+([A-Z]+-\d+)", re.IGNORECASE)
# Obvious placeholders that should not count as real secrets.
_PLACEHOLDER_RE = re.compile(
    r"(example|changeme|change_me|placeholder|your[_-]?|xxxx|<[^>]*>|redacted|"
    r"dummy|sample|\*{3,}|\.\.\.|todo|fixme|none|null|test[_-]?secret)",
    re.IGNORECASE,
)


@dataclass(frozen=True)
class Rule:
    id: str
    pattern: re.Pattern[str]
    severity: str       # low | medium | high
    confidence: str     # low | medium | high
    cwe: str
    message: str
    suggestion: str
    owasp: str = ""
    # Optional predicate to reject false positives on a matched line.
    reject: object = None  # Callable[[str], bool] | None


def _assignment(keywords: str) -> re.Pattern[str]:
    return re.compile(
        rf"(?i)\b({keywords})\b\s*[:=]\s*['\"][^'\"]{{8,}}['\"]"
    )


def _looks_placeholder(line: str) -> bool:
    return bool(_PLACEHOLDER_RE.search(line))


# --- Rule catalogue -------------------------------------------------------
# High-confidence rules run in the default profile. Lower-confidence rules run
# only with --profile broad (or --include-low-confidence).
RULES: list[Rule] = [
    Rule("SA-001", re.compile(r"-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----"),
         "high", "high", "CWE-798",
         "Private key material committed to source.",
         "Remove the key, rotate it, and load secrets from a vault or env var.",
         owasp="A07"),
    Rule("SA-002", re.compile(r"\bAKIA[0-9A-Z]{16}\b"),
         "high", "high", "CWE-798",
         "Hardcoded AWS access key ID.",
         "Rotate the key and use an IAM role or a secrets manager.",
         owasp="A07"),
    Rule("SA-003", re.compile(r"\bghp_[0-9A-Za-z]{36}\b|\bgithub_pat_[0-9A-Za-z_]{22,}\b"),
         "high", "high", "CWE-798",
         "Hardcoded GitHub token.",
         "Revoke the token and store it in a secret store.",
         owasp="A07"),
    Rule("SA-004", re.compile(r"\bxox[baprs]-[0-9A-Za-z-]{10,}\b"),
         "high", "high", "CWE-798",
         "Hardcoded Slack token.",
         "Revoke and move to a secret store.",
         owasp="A07"),
    Rule("SA-005", re.compile(r"\bsk_live_[0-9A-Za-z]{16,}\b|\bAIza[0-9A-Za-z_\-]{35}\b"),
         "high", "high", "CWE-798",
         "Hardcoded third-party API key (Stripe/Google).",
         "Revoke and load from a secret store.",
         owasp="A07"),
    Rule("SA-010", re.compile(r"\bverify\s*=\s*False\b"),
         "high", "high", "CWE-295",
         "TLS certificate verification disabled.",
         "Remove verify=False; pin or trust a proper CA bundle instead.",
         owasp="A02"),
    Rule("SA-011", re.compile(r"\bsubprocess\.[A-Za-z_]+\([^)]*shell\s*=\s*True|\bos\.system\s*\("),
         "medium", "high", "CWE-78",
         "Shell execution sink (shell=True / os.system) — review for injection.",
         "Pass an argument list without a shell, or shlex.quote untrusted input.",
         owasp="A03"),
    Rule("SA-012", re.compile(r"\bpickle\.loads?\s*\(|\byaml\.load\s*\((?![^)]*Loader)"),
         "high", "high", "CWE-502",
         "Insecure deserialization of untrusted data.",
         "Use yaml.safe_load / a safe format; never unpickle untrusted bytes.",
         owasp="A08"),
    # --- broad / lower-confidence ---
    Rule("SA-020", re.compile(r"(?<![A-Za-z_])(eval|exec)\s*\("),
         "medium", "low", "CWE-95",
         "Dynamic code execution (eval/exec) — requires review.",
         "Avoid eval/exec on dynamic input; use a safe parser or dispatch table.",
         owasp="A03"),
    Rule("SA-021", _assignment("password|passwd|pwd|secret|api[_-]?key|access[_-]?key|token"),
         "high", "medium", "CWE-798",
         "Possible hardcoded credential in an assignment.",
         "Load the value from an environment variable or secret store.",
         owasp="A07", reject=_looks_placeholder),
    Rule("SA-022", re.compile(r"(?i)\b(hashlib\.)?(md5|sha1)\s*\("),
         "low", "low", "CWE-327",
         "Weak hash algorithm (MD5/SHA1).",
         "Use SHA-256+ for integrity; use bcrypt/argon2 for passwords.",
         owasp="A02"),
    Rule("SA-023", re.compile(r"(?i)\bDEBUG\s*=\s*True\b"),
         "medium", "low", "CWE-489",
         "Debug mode enabled — must be off in production.",
         "Drive DEBUG from an environment variable defaulting to False.",
         owasp="A05"),
    Rule("SA-024", re.compile(r"Access-Control-Allow-Origin['\"]?\s*[:,]\s*['\"]?\*|origin\s*:\s*['\"]\*['\"]"),
         "medium", "low", "CWE-942",
         "Permissive CORS (Allow-Origin: *).",
         "Allow only specific trusted origins.",
         owasp="A05"),
]

RULES_BY_ID = {r.id: r for r in RULES}


@dataclass
class Finding:
    rule_id: str
    severity: str
    confidence: str
    cwe: str
    owasp: str
    path: str        # POSIX-relative
    line: int
    message: str
    suggestion: str

    @property
    def fingerprint(self) -> str:
        h = hashlib.sha256(
            f"{self.rule_id}\n{self.path}\n{self.line}\n{self.message}".encode("utf-8")
        )
        return h.hexdigest()[:16]


@dataclass
class Report:
    findings: list[Finding] = field(default_factory=list)
    suppressed: int = 0
    files_scanned: int = 0


def active_rules(include_low_confidence: bool) -> list[Rule]:
    if include_low_confidence:
        return list(RULES)
    return [r for r in RULES if r.confidence == "high"]


def _is_binary(data: bytes) -> bool:
    return b"\x00" in data


def _ignored(rel_posix: str, name: str, ignore_globs: list[str]) -> bool:
    for pat in ignore_globs:
        if fnmatch.fnmatch(name, pat) or fnmatch.fnmatch(rel_posix, pat):
            return True
    return False


def scan_text(rel_posix: str, text: str, rules: list[Rule]) -> tuple[list[Finding], int]:
    findings: list[Finding] = []
    suppressed = 0
    lines = text.replace("\r\n", "\n").replace("\r", "\n").split("\n")
    for idx, line in enumerate(lines, start=1):
        suppressed_ids = set(m.upper() for m in SUPPRESS_RE.findall(line))
        # Allow suppression on the preceding line too.
        if idx >= 2:
            suppressed_ids |= set(m.upper() for m in SUPPRESS_RE.findall(lines[idx - 2]))
        for rule in rules:
            if not rule.pattern.search(line):
                continue
            if rule.reject is not None and rule.reject(line):
                continue
            if rule.id in suppressed_ids:
                suppressed += 1
                continue
            findings.append(Finding(
                rule_id=rule.id, severity=rule.severity, confidence=rule.confidence,
                cwe=rule.cwe, owasp=rule.owasp, path=rel_posix, line=idx,
                message=rule.message, suggestion=rule.suggestion,
            ))
    return findings, suppressed


def scan_tree(target: Path, ignore_globs: list[str], rules: list[Rule],
              output_abs: Path | None) -> Report:
    report = Report()
    target = target.resolve()
    for root, dirs, files in os.walk(target):
        dirs.sort()
        dirs[:] = [d for d in dirs if d not in DEFAULT_IGNORE_DIRS]
        for name in sorted(files):
            abs_path = Path(root) / name
            if output_abs is not None and abs_path.resolve() == output_abs:
                continue
            rel_posix = abs_path.resolve().relative_to(target).as_posix()
            if _ignored(rel_posix, name, ignore_globs):
                continue
            try:
                raw = abs_path.read_bytes()
            except OSError:
                continue
            if len(raw) > MAX_FILE_BYTES or _is_binary(raw[:4096]):
                continue
            text = raw.decode("utf-8", errors="replace")
            report.files_scanned += 1
            found, suppressed = scan_text(rel_posix, text, rules)
            report.findings.extend(found)
            report.suppressed += suppressed
    report.findings.sort(key=lambda f: (f.path, f.line, f.rule_id))
    return report


def _summary(findings: list[Finding]) -> dict[str, int]:
    out = {"high": 0, "medium": 0, "low": 0}
    for f in findings:
        out[f.severity] += 1
    return out


def render_markdown(report: Report, suggest: bool) -> str:
    counts = _summary(report.findings)
    lines = ["# Security Audit Report", ""]
    lines.append(
        f"Scanned {report.files_scanned} file(s): "
        f"{counts['high']} high, {counts['medium']} medium, {counts['low']} low; "
        f"{report.suppressed} suppressed."
    )
    lines.append("")
    if not report.findings:
        lines.append("No findings.")
        return "\n".join(lines) + "\n"
    for f in report.findings:
        owasp = f" {f.owasp}" if f.owasp else ""
        lines.append(
            f"- [{f.severity}/{f.confidence}] {f.rule_id} ({f.cwe}{owasp}) "
            f"{f.path}:{f.line} — {f.message}"
        )
        if suggest:
            lines.append(f"    fix: {f.suggestion}")
    return "\n".join(lines) + "\n"


def render_json(report: Report) -> str:
    payload = {
        "summary": {
            **_summary(report.findings),
            "suppressed": report.suppressed,
            "files_scanned": report.files_scanned,
        },
        "findings": [
            {
                "fingerprint": f.fingerprint, "rule_id": f.rule_id,
                "severity": f.severity, "confidence": f.confidence,
                "cwe": f.cwe, "owasp": f.owasp, "path": f.path, "line": f.line,
                "message": f.message, "suggestion": f.suggestion,
            }
            for f in report.findings
        ],
    }
    return json.dumps(payload, sort_keys=True, ensure_ascii=False, indent=2) + "\n"


def _fail(report: Report, fail_on: str) -> bool:
    threshold = SEVERITY_ORDER[fail_on]
    return any(SEVERITY_ORDER[f.severity] >= threshold for f in report.findings)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Heuristic security scanner.")
    parser.add_argument("target", nargs="?", default=".", help="Directory to scan")
    parser.add_argument("--format", choices=["md", "json"], default="md")
    parser.add_argument("--output", default=None, help="Write report to this path")
    parser.add_argument("--fail-on", choices=["low", "medium", "high"], default="high")
    parser.add_argument("--ignore", action="append", default=[], help="Extra ignore glob (repeatable)")
    parser.add_argument("--profile", choices=["default", "broad"], default="default")
    parser.add_argument("--include-low-confidence", action="store_true")
    parser.add_argument("--suggest", action="store_true", help="Include remediation text (md)")
    args = parser.parse_args(argv)

    target = Path(args.target)
    if not target.is_dir():
        parser.error(f"target is not a directory: {args.target}")
        return 2

    include_low = args.include_low_confidence or args.profile == "broad"
    rules = active_rules(include_low)
    ignore_globs = DEFAULT_IGNORE_FILES + list(args.ignore)
    output_abs = Path(args.output).resolve() if args.output else None

    report = scan_tree(target, ignore_globs, rules, output_abs)
    rendered = render_json(report) if args.format == "json" else render_markdown(report, args.suggest)

    if args.output:
        Path(args.output).write_text(rendered, encoding="utf-8", newline="\n")
        print(f"Wrote {len(report.findings)} finding(s) to {args.output}")
    else:
        sys.stdout.write(rendered)

    return 1 if _fail(report, args.fail_on) else 0


if __name__ == "__main__":
    sys.exit(main())
