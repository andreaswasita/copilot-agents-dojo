#!/usr/bin/env bash
# Copilot Agents Dojo — Durable Task Board
#
# Manages tasks/board/ — the durable, cross-session complement to todo.md.
#
# Usage:
#   bash scripts/board.sh new "Task title here"   # create NNN-slug.md from template
#   bash scripts/board.sh assign <id> <owner>     # set owner + flip status to in_progress
#   bash scripts/board.sh list                    # group all tasks by status
#   bash scripts/board.sh status                  # one-line summary (running + assignees)
#   bash scripts/board.sh roll-up                 # regenerate tasks/todo.md from board/

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOJO_ROOT="${DOJO_ROOT:-$(dirname "$SCRIPT_DIR")}"
cd "$DOJO_ROOT"

BOARD="tasks/board"
TEMPLATE="$BOARD/000-template.md"
TODO="tasks/todo.md"

[ -d "$BOARD" ] || { echo "❌ $BOARD missing — re-init the dojo" >&2; exit 1; }
[ -f "$TEMPLATE" ] || { echo "❌ $TEMPLATE missing" >&2; exit 1; }

fm_get() {
  local file="$1" key="$2"
  awk -v key="$key" '
    /^---$/ { c++; next }
    c == 1 && $0 ~ "^"key":" {
      sub("^"key":[[:space:]]*", "")
      sub(/^"/, ""); sub(/"$/, "")
      print
      exit
    }
  ' "$file"
}

# Set (replace) a front-matter key in place. Only touches the first YAML block.
fm_set() {
  local file="$1" key="$2" val="$3"
  local tmp; tmp=$(mktemp)
  awk -v key="$key" -v val="$val" '
    /^---$/ { c++; print; next }
    c == 1 && $0 ~ "^"key":" && !done {
      print key ": " val
      done = 1
      next
    }
    { print }
  ' "$file" > "$tmp" && mv "$tmp" "$file"
}

slugify() {
  echo "$1" | tr '[:upper:]' '[:lower:]' \
            | sed -E 's/[^a-z0-9]+/-/g; s/^-+|-+$//g' \
            | cut -c1-40
}

next_ordinal() {
  local max=0
  while IFS= read -r f; do
    [ -z "$f" ] && continue
    local n
    n=$(basename "$f" | grep -oE '^[0-9]+' || echo 0)
    [ "$n" -gt "$max" ] && max=$n
  done < <(find "$BOARD" -maxdepth 1 -name '[0-9]*-*.md' 2>/dev/null)
  printf "%03d" $((max + 1))
}

verb_new() {
  local title="${1:-}"
  [ -z "$title" ] && { echo "❌ usage: board.sh new \"Task title\"" >&2; exit 2; }
  local slug; slug=$(slugify "$title")
  local ord;  ord=$(next_ordinal)
  local id="${ord}-${slug}"
  local out="$BOARD/${id}.md"
  local today; today=$(date -u +%Y-%m-%d)

  # Render template with substitutions
  awk -v id="$id" -v title="$title" -v today="$today" '
    /^id: / { print "id: " id; next }
    /^title: / { print "title: " title; next }
    /^created: / { print "created: " today; next }
    /^updated: / { print "updated: " today; next }
    /^> Copy this/ { skip = 1; next }
    skip && /^> ordinal/ { next }
    skip && /^$/ { skip = 0; next }
    skip { next }
    { print }
  ' "$TEMPLATE" > "$out"

  echo "✅ created $out"
  echo "ℹ️  edit it, then run: bash scripts/board.sh roll-up"
}

# Assign a task to an owner. Resolves <id> by ordinal prefix or substring,
# sets owner, and flips status to in_progress so a worker can pick it up.
verb_assign() {
  local id="${1:-}" owner="${2:-}"
  [ -z "$id" ] || [ -z "$owner" ] && { echo "❌ usage: board.sh assign <id> <owner>" >&2; exit 2; }
  local file
  file=$(find "$BOARD" -maxdepth 1 -name "${id}-*.md" | head -n1)
  [ -z "$file" ] && file=$(find "$BOARD" -maxdepth 1 -name "*${id}*.md" ! -name '000-template.md' ! -name 'README.md' | head -n1)
  [ -z "$file" ] && { echo "❌ no board task matching '$id'" >&2; exit 1; }
  fm_set "$file" owner "$owner"
  fm_set "$file" status in_progress
  fm_set "$file" updated "$(date -u +%Y-%m-%d)"
  echo "✅ assigned $(basename "$file") → $owner (status: in_progress)"
  echo "ℹ️  a worker can now pick it up; refresh the plan with: bash scripts/board.sh roll-up"
}

verb_list() {
  echo "📋 Board status"
  echo ""
  for status in in_progress pending blocked done; do
    local matches=0
    while IFS= read -r f; do
      [ -z "$f" ] && continue
      [ "$(basename "$f")" = "000-template.md" ] && continue
      [ "$(basename "$f")" = "README.md" ] && continue
      local s; s=$(fm_get "$f" status)
      if [ "$s" = "$status" ]; then
        if [ "$matches" -eq 0 ]; then echo "## ${status}"; fi
        matches=$((matches + 1))
        local id title owner
        id=$(fm_get "$f" id)
        title=$(fm_get "$f" title)
        owner=$(fm_get "$f" owner)
        printf "  - %s — %s [owner: %s]\n" "$id" "$title" "$owner"
      fi
    done < <(find "$BOARD" -maxdepth 1 -name '*.md' | sort)
    [ "$matches" -gt 0 ] && echo ""
  done
}

verb_status() {
  local total=0 done=0 progress=0 blocked=0 pending=0
  local assignees=""
  while IFS= read -r f; do
    [ -z "$f" ] && continue
    [ "$(basename "$f")" = "000-template.md" ] && continue
    [ "$(basename "$f")" = "README.md" ] && continue
    total=$((total + 1))
    case "$(fm_get "$f" status)" in
      done)        done=$((done + 1)) ;;
      in_progress)
        progress=$((progress + 1))
        local o; o=$(fm_get "$f" owner)
        if [ -n "$o" ] && [ "$o" != "TBD" ]; then
          case ",$assignees," in
            *",$o,"*) : ;;                                  # already listed
            *) assignees="${assignees:+$assignees,}$o" ;;
          esac
        fi
        ;;
      blocked)     blocked=$((blocked + 1)) ;;
      pending)     pending=$((pending + 1)) ;;
    esac
  done < <(find "$BOARD" -maxdepth 1 -name '*.md')
  local who="none"; [ -n "$assignees" ] && who="$assignees"
  echo "board: total=$total done=$done running=$progress blocked=$blocked pending=$pending assignees=$who"
}

verb_rollup() {
  local now; now=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  {
    echo "# Task Plan"
    echo ""
    echo "> Auto-generated by \`scripts/board.sh roll-up\` on $now."
    echo "> The board (\`tasks/board/\`) is the source of truth — edit task files there, not here."
    echo ""
    for status in in_progress blocked pending done; do
      local count=0
      local section=""
      while IFS= read -r f; do
        [ -z "$f" ] && continue
        [ "$(basename "$f")" = "000-template.md" ] && continue
        [ "$(basename "$f")" = "README.md" ] && continue
        local s; s=$(fm_get "$f" status)
        if [ "$s" = "$status" ]; then
          local id title
          id=$(fm_get "$f" id)
          title=$(fm_get "$f" title)
          local mark="[ ]"
          [ "$status" = "done" ] && mark="[x]"
          section="${section}- ${mark} **${id}** — ${title}"$'\n'
          count=$((count + 1))
        fi
      done < <(find "$BOARD" -maxdepth 1 -name '*.md' | sort)
      if [ "$count" -gt 0 ]; then
        printf "## %s (%d)\n\n%s\n" "$status" "$count" "$section"
      fi
    done
    echo "## Review"
    echo ""
    echo "<!-- Add review notes when all tasks are done. -->"
  } > "$TODO"
  echo "✅ rolled up $(verb_status) into $TODO"
}

verb="${1:-status}"; shift || true
case "$verb" in
  new)     verb_new "${1:-}" ;;
  assign)  verb_assign "${1:-}" "${2:-}" ;;
  list)    verb_list ;;
  status)  verb_status ;;
  roll-up|rollup) verb_rollup ;;
  -h|--help) sed -n '1,13p' "$0" ;;
  *) echo "unknown verb: $verb (try --help)" >&2; exit 2 ;;
esac
