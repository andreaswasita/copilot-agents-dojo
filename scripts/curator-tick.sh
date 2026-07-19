#!/usr/bin/env bash
# Copilot Agents Dojo — Curator tick.
#
# Lightweight, idempotent runner suitable for cron / git hooks / scheduled tasks.
# Triggers `scripts/curator.sh transition` only when both:
#   1) >= DOJO_CURATOR_INTERVAL_HOURS have elapsed since last transition run.
#   2) >= DOJO_CURATOR_MIN_IDLE_HOURS have elapsed since the last skill use.
#
# Defaults: interval 168h (7d), idle 2h — mirrors hermes.
# Override via env or .dojo/curator.env (sourced if present).
#
# Usage:
#   bash scripts/curator-tick.sh            # honor defaults
#   bash scripts/curator-tick.sh --force    # skip both gates
#   bash scripts/curator-tick.sh --dry-run  # forward to curator.sh transition --dry-run

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOJO_ROOT="${DOJO_ROOT:-$(dirname "$SCRIPT_DIR")}"
cd "$DOJO_ROOT"

[ -f .dojo/curator.env ] && . .dojo/curator.env

INTERVAL_HOURS="${DOJO_CURATOR_INTERVAL_HOURS:-168}"
MIN_IDLE_HOURS="${DOJO_CURATOR_MIN_IDLE_HOURS:-2}"
USAGE_FILE=".dojo/skill-usage.json"

force=false
dry=""
for a in "$@"; do
  case "$a" in
    --force)   force=true ;;
    --dry-run) dry="--dry-run" ;;
    -h|--help) sed -n '1,18p' "$0"; exit 0 ;;
    *) echo "tick: unknown flag $a" >&2; exit 2 ;;
  esac
done

[ -f "$USAGE_FILE" ] || {
  echo "tick: no $USAGE_FILE yet — nothing to do" >&2
  exit 0
}

command -v jq >/dev/null 2>&1 || {
  echo "❌ tick requires 'jq'" >&2
  exit 2
}

now_epoch() { date -u +%s; }
iso_to_epoch() {
  local s="$1"
  date -u -d "$s" +%s 2>/dev/null \
    || date -u -jf "%Y-%m-%dT%H:%M:%SZ" "$s" +%s 2>/dev/null \
    || echo 0
}

now=$(now_epoch)
interval_s=$((INTERVAL_HOURS * 3600))
idle_s=$((MIN_IDLE_HOURS * 3600))

last_run=$(jq -r '.last_run_at // ""' "$USAGE_FILE")
last_use=$(jq -r '[.skills[].last_used // empty] | sort | last // ""' "$USAGE_FILE")

if ! $force; then
  if [ -n "$last_run" ]; then
    diff=$(( now - $(iso_to_epoch "$last_run") ))
    if [ "$diff" -lt "$interval_s" ]; then
      echo "tick: skipped — last run was $((diff / 3600))h ago (< ${INTERVAL_HOURS}h)"
      exit 0
    fi
  fi
  if [ -n "$last_use" ]; then
    diff=$(( now - $(iso_to_epoch "$last_use") ))
    if [ "$diff" -lt "$idle_s" ]; then
      echo "tick: skipped — last skill use was $((diff / 60))m ago (< ${MIN_IDLE_HOURS}h)"
      exit 0
    fi
  fi
fi

echo "tick: gates passed — invoking curator transition $dry"
exec bash scripts/curator.sh transition $dry
