#!/usr/bin/env bash
# Copilot Agents Dojo — One-command pipeline orchestrator (G8).
#
# A single entry point that drives the mandatory 8-step workflow
#   BRAINSTORM -> WORKTREE -> PLAN -> EXECUTE -> TEST -> REVIEW -> FINISH -> LEARN
# by composing the existing skills and scripts. The cognitive steps (brainstorm,
# plan, execute, review) are walked by the agent via the /dojo-sprint slash
# command; this script handles the deterministic bookends (scaffold, gate,
# finish) so a human or an agent can run them directly.
#
# The phase->skill map lives in scripts/pipeline.tsv (single source of truth).
#
# Usage:
#   bash scripts/sprint.sh steps                    # print the phase->skill map
#   bash scripts/sprint.sh start "<goal>" [--swarm] [--dry-run]
#   bash scripts/sprint.sh gate [verify args...]    # run the single gate
#   bash scripts/sprint.sh finish [verify args...]  # gate + merge/learn guidance
#   bash scripts/sprint.sh -h | --help
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOJO_ROOT="${DOJO_ROOT:-$(dirname "$SCRIPT_DIR")}"
export DOJO_ROOT
cd "$DOJO_ROOT"

PIPELINE="scripts/pipeline.tsv"

# Stream the pipeline rows (skip comments and blanks).
pipeline_rows() { grep -vE '^[[:space:]]*#|^[[:space:]]*$' "$PIPELINE"; }

print_steps() {
  local n=0 phase skill what
  while IFS=$'\t' read -r phase skill what; do
    n=$((n + 1))
    printf '  %d. %-10s  %-32s  %s\n' "$n" "$phase" "skills/$skill/SKILL.md" "$what"
  done < <(pipeline_rows)
}

cmd_steps() {
  echo "🥋 The mandatory pipeline (from $PIPELINE):"
  print_steps
}

cmd_start() {
  local goal="" swarm=0 dry=0
  for arg in "$@"; do
    case "$arg" in
      --swarm)   swarm=1 ;;
      --dry-run) dry=1 ;;
      -*) echo "❌ unknown flag: $arg" >&2; exit 2 ;;
      *) if [ -z "$goal" ]; then goal="$arg"; else goal="$goal $arg"; fi ;;
    esac
  done
  [ -n "$goal" ] || { echo "❌ usage: sprint.sh start \"<goal>\" [--swarm] [--dry-run]" >&2; exit 2; }

  local mode="sprint"; [ "$swarm" -eq 1 ] && mode="swarm"
  echo "🥋 Sprint start — mode: $mode"
  echo "   Goal: $goal"
  echo ""

  if [ "$dry" -eq 1 ]; then
    echo "   (dry run — no files written)"
    echo "   Would scaffold tasks/ and open a durable board task, then walk:"
    print_steps
    return 0
  fi

  # ISOLATE + PLAN scaffold (the mechanical bookend).
  bash "$SCRIPT_DIR/init.sh" >/dev/null
  echo "  ✅ tasks/ ready"
  if [ -f "tasks/board/000-template.md" ]; then
    bash "$SCRIPT_DIR/board.sh" new "$goal" | sed 's/^/  /'
  else
    echo "  ℹ️  tasks/board/ not scaffolded — skipping durable task (seed tasks/todo.md manually)"
  fi

  echo ""
  echo "  Now walk the pipeline, one phase at a time:"
  print_steps
  if [ "$swarm" -eq 1 ]; then
    echo ""
    echo "  Swarm: keep BRAINSTORM/WORKTREE/PLAN sequential, split EXECUTE+TEST"
    echo "  into one board task per sub-agent (no two touch the same files),"
    echo "  fan in at REVIEW, then run a single central 'sprint.sh finish'."
  fi
  echo ""
  echo "  When done: bash scripts/sprint.sh finish"
}

cmd_gate() {
  echo "🛡  Running the single gate (scripts/verify.sh ${*:-})…"
  bash "$SCRIPT_DIR/verify.sh" "$@"
}

cmd_finish() {
  cmd_gate "$@"
  local rc=$?
  echo ""
  echo "🏁 FINISH — read skills/finishing-a-development-branch/SKILL.md:"
  echo "   • Gate is green above — review the full diff once more."
  echo "   • Decide the merge (PR-first; squash unless history matters)."
  echo "   • Delete the worktree/branch after merge."
  echo "🧠 LEARN — read skills/self-improvement/SKILL.md:"
  echo "   • Log any correction in tasks/lessons.md; promote 3x patterns."
  return $rc
}

verb="${1:-}"
shift || true
case "$verb" in
  steps)        cmd_steps ;;
  start)        cmd_start "$@" ;;
  gate)         cmd_gate "$@" ;;
  finish)       cmd_finish "$@" ;;
  -h|--help)    sed -n '2,25p' "$0" ;;
  "")           echo "❌ usage: sprint.sh {steps|start|gate|finish} (try --help)" >&2; exit 2 ;;
  *)            echo "❌ unknown command: $verb (try --help)" >&2; exit 2 ;;
esac
