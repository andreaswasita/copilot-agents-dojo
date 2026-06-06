---
name: security-audit
description: Detects high-confidence security risks in code.
tier: practical
category: review
created_by: human
platforms: [windows, macos, linux]
tags: [security, audit, secrets, review]
author: Andreas Wasita (@andreaswasita)
---

# Security Audit Skill

Runs a deterministic heuristic scan over a codebase to flag high-confidence security risks — committed secrets, disabled TLS verification, insecure deserialization, and shell-injection sinks — then optionally layers LLM reasoning (OWASP/STRIDE) on top of the machine findings. This is a **lightweight heuristic audit assistant, not a pentest, a SAST replacement, or a proof of security**: it is a regex line-scanner that cannot follow data flow and will miss anything outside its rules. Treat its output as triage leads for human review, never as assurance.

## When to Use

- Before opening a PR that touches auth, secrets handling, deserialization, or external calls.
- As a fast pre-commit sweep for accidentally committed credentials.
- When reviewing an unfamiliar contribution and you want a cheap first pass.
- To produce a persisted, idempotent report that diffs cleanly across runs.
- Paired with `derive-security-from-risk` (which works forward, producing requirements) — this skill is the reverse, scanning existing code.
- NOT as the only security gate, and NOT as evidence that code is secure (see Pitfalls).

## Prerequisites

- The `powershell` Copilot tool to invoke the scanner.
- Python 3 on `PATH` (the scan logic is one stdlib core; the `.sh`/`.ps1` are thin wrappers).
- Read access to the target tree.

## How to Run

Use the `powershell` tool to scan a directory and review the findings:

```bash
# High-confidence sweep of the repo (exit 1 = findings at/above --fail-on)
bash skills/security-audit/scripts/security-audit.sh . --suggest

# Broader (noisier) profile, fail only on medium-or-higher
bash skills/security-audit/scripts/security-audit.sh src --profile broad --fail-on medium

# Persist a deterministic JSON report for diffing
bash skills/security-audit/scripts/security-audit.sh . --format json --output audit.json
```

On Windows, call the parity wrapper `security-audit.ps1` with the same arguments. Exit codes: `0` clean (below `--fail-on`), `1` findings at/above it, `2` usage error.

## Quick Reference

| Rule | Flags | Confidence |
|---|---|---|
| SA-001..005 | private keys, AWS/GitHub/Slack/Stripe/Google tokens | high |
| SA-010 | TLS verification disabled (`verify=False`) | high |
| SA-011 | shell sink (`shell=True`, `os.system`) | high |
| SA-012 | insecure deserialization (`pickle.loads`, `yaml.load`) | high |
| SA-020..024 | eval/exec, generic creds, weak hash, DEBUG, CORS `*` | low (broad only) |

| Flag | Effect |
|---|---|
| `--profile broad` / `--include-low-confidence` | enable low-confidence rules |
| `--fail-on low\|medium\|high` | exit-1 threshold (default high) |
| `--format md\|json` | report shape (default md) |
| `--output PATH` | persist report (excluded from its own scan) |
| `--ignore GLOB` | extra path to skip (repeatable) |
| `--suggest` | include remediation text |

## Procedure

### Step 1: Scan

Run the default (high-confidence) profile over the target with the `powershell` tool. Start narrow — the default rules are tuned to minimize false positives, so an exit `1` here usually means a real issue.

### Step 2: Triage

Read each finding's rule id, severity, confidence, CWE, and location. Confirm whether it is a true positive. For a genuine non-issue, add an inline `# security-audit: ignore SA-0NN reason=...` on the matched or preceding line; the report then counts it as suppressed rather than dropping it silently.

### Step 3: Reason (LLM tier)

For findings that need judgement, layer OWASP/STRIDE reasoning on the machine output: is the `eval` argument attacker-reachable, is the disabled TLS check on an internal or external call, what is the blast radius. The scanner finds candidates; you decide exploitability.

### Step 4: Persist

Write a report with `--output` (and `--format json` for machine diffing). The report carries no timestamps, absolute paths, or environment data, so re-running on unchanged code produces byte-identical output and a noise-free diff.

### Step 5: Remediate and Re-audit

Apply fixes guided by the `--suggest` remediation text. The scanner never edits code — suggestions only, by design. After fixing, re-run and confirm the findings clear (and that no new ones appeared).

### Step 6: Extend the Rules

Rules live in `skills/security-audit/scripts/security_audit.py` as one shared core. Add a rule there with a matching case in `tests/test_security_audit.py` (generate any secret-shaped fixture at runtime — never commit a token-shaped literal), so the `.sh` and `.ps1` wrappers stay in parity.

## Pitfalls

- **DO NOT** treat a clean scan as "secure". A pass is the absence of a matched pattern, not a proof of safety — the scanner cannot follow data flow or reason about exploitability.
- **DO NOT** commit real token-shaped fixtures to tests; generate them at runtime by concatenation, or push protection and secret scanners will block them.
- **DO NOT** auto-apply suggestions blindly. They are remediation hints; review each in context.
- **DO NOT** widen the default profile until every `eval` trips it — false positives train reviewers to ignore the tool. Keep noisy rules behind `--profile broad`.
- **DO NOT** edit only one wrapper. The logic lives in the Python core; the `.sh`/`.ps1` are thin and must stay that way.

## Verification

- [ ] The scanner was run on the target and its exit code observed.
- [ ] Each finding was triaged as true/false positive; false positives carry an inline ignore with a reason.
- [ ] A persisted report was produced where one was needed, and re-runs are byte-identical.
- [ ] Remediated findings were confirmed cleared on a re-audit, with no new findings introduced.
- [ ] New or changed rules have matching cases in `tests/test_security_audit.py`.
