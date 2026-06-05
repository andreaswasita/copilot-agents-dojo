#!/usr/bin/env bash
# Copilot Agents Dojo — Memory Recall (thin wrapper)
#
# Surfaces prior decisions, patterns, and recent sessions relevant to a planning
# topic. Call BEFORE writing a plan so past knowledge compounds.
#
# This is a thin wrapper around scripts/memory_recall.py (the single source of
# recall logic, shared with the .ps1 mirror) to avoid three-way logic drift.
#
# Usage:
#   bash scripts/memory-recall.sh --topic "postgres migration" --language typescript
#   bash scripts/memory-recall.sh            # active decisions + recent context
#
# Honors DOJO_ROOT (defaults to the repo root inferred from this script).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOJO_ROOT="${DOJO_ROOT:-$(dirname "$SCRIPT_DIR")}"
export DOJO_ROOT

PY="${PYTHON:-python3}"
if ! command -v "$PY" >/dev/null 2>&1; then
  PY="python"
fi

exec "$PY" "$SCRIPT_DIR/memory_recall.py" "$@"
