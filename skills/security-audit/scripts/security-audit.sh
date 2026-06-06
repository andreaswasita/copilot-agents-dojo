#!/usr/bin/env bash
# Copilot Agents Dojo — Security Audit (thin wrapper)
#
# Heuristic security scanner. Thin pass-through wrapper around security_audit.py
# (the single source of scan logic, shared with the .ps1 mirror).
#
# Usage:
#   bash skills/security-audit/scripts/security-audit.sh . --format md --suggest
#   bash skills/security-audit/scripts/security-audit.sh src --fail-on medium
#
# Exit codes: 0 = clean (below --fail-on), 1 = findings at/above it, 2 = usage.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

PY="${PYTHON:-python3}"
if ! command -v "$PY" >/dev/null 2>&1; then
  PY="python"
fi

exec "$PY" "$SCRIPT_DIR/security_audit.py" "$@"
