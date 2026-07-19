#!/usr/bin/env bash
# Copilot Agents Dojo — Safety Guard (thin wrapper)
#
# Heuristic preflight lint. Thin wrapper around safety_guard.py (the single
# source of guard logic, shared with the .ps1 mirror) to avoid logic drift.
#
# Usage:
#   bash scripts/safety-guard.sh command "rm -rf /"
#   bash scripts/safety-guard.sh tree --require-clean
#
# Exit codes: 0 = no concern, 1 = flagged (stop and confirm), 2 = usage error.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

PY="${PYTHON:-python3}"
if ! command -v "$PY" >/dev/null 2>&1; then
  PY="python"
fi

exec "$PY" "$SCRIPT_DIR/safety_guard.py" "$@"
