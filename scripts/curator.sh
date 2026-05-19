#!/usr/bin/env bash
# Copilot Agents Dojo — Curator (skill lifecycle manager)
#
# Reads .dojo/skill-usage.json and manages skill state per the invariants
# documented in AGENTS.md → Curator (Skill Lifecycle):
#
#   - NEVER touches created_by: human skills.
#   - NEVER deletes — max destructive action is archive to skills/.archive/.
#   - Pinned skills are exempt from auto-transitions.
#   - skills/.archive/ is restorable.
#
# Usage:
#   bash scripts/curator.sh status [<skill>]   # report on one or all skills
#   bash scripts/curator.sh record <skill>     # bump uses + last_used
#   bash scripts/curator.sh pin <skill>        # exempt from auto-archive
#   bash scripts/curator.sh unpin <skill>      # re-enable auto-archive
#   bash scripts/curator.sh archive <skill>    # move agent skill to .archive/
#   bash scripts/curator.sh restore <skill>    # move from .archive/ back
#   bash scripts/curator.sh prune [--dry-run]  # auto-archive stale agent skills
#   bash scripts/curator.sh report             # markdown summary to stdout

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOJO_ROOT="${DOJO_ROOT:-$(dirname "$SCRIPT_DIR")}"
cd "$DOJO_ROOT"

USAGE_FILE=".dojo/skill-usage.json"
LOG_FILE=".dojo/curator.log"
ARCHIVE_DIR="skills/.archive"
STALE_DAYS="${DOJO_CURATOR_STALE_DAYS:-30}"

mkdir -p .dojo "$ARCHIVE_DIR"
[ -f "$USAGE_FILE" ] || echo '{"version":1,"generated_at":null,"skills":{}}' > "$USAGE_FILE"

command -v jq >/dev/null 2>&1 || {
  echo "❌ curator requires 'jq'. Install: https://jqlang.github.io/jq/" >&2
  exit 2
}

# --- helpers --------------------------------------------------------------

log() {
  local ts; ts=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  echo "$ts $*" >> "$LOG_FILE"
}

now_iso() { date -u +"%Y-%m-%dT%H:%M:%SZ"; }

# Resolve skill folder (skills/<n> or optional-skills/<n>). Empty if missing.
skill_path() {
  local name="$1"
  for parent in skills optional-skills; do
    if [ -f "$parent/$name/SKILL.md" ]; then
      echo "$parent/$name"
      return
    fi
  done
  if [ -f "$ARCHIVE_DIR/$name/SKILL.md" ]; then
    echo "$ARCHIVE_DIR/$name"
    return
  fi
  echo ""
}

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

ensure_entry() {
  local name="$1"
  local has
  has=$(jq -r --arg n "$name" '.skills | has($n)' "$USAGE_FILE")
  if [ "$has" != "true" ]; then
    local tmp; tmp=$(mktemp)
    jq --arg n "$name" '.skills[$n] = {
      uses: 0,
      last_used: null,
      lessons_logged: 0,
      last_lesson_at: null,
      pinned: false
    }' "$USAGE_FILE" > "$tmp" && mv "$tmp" "$USAGE_FILE"
  fi
}

set_field() {
  local name="$1" key="$2" val="$3"
  local tmp; tmp=$(mktemp)
  jq --arg n "$name" --arg k "$key" --argjson v "$val" \
    '.skills[$n][$k] = $v' "$USAGE_FILE" > "$tmp" && mv "$tmp" "$USAGE_FILE"
}

# Refuse to touch human-authored skills. $1 = skill path.
guard_human_only() {
  local path="$1"
  local created_by
  created_by=$(fm_get "$path/SKILL.md" created_by)
  if [ "$created_by" = "human" ]; then
    echo "🛑 refusing: $path is created_by: human (curator only manages agent skills)" >&2
    return 1
  fi
}

# --- verbs ----------------------------------------------------------------

verb_status() {
  local target="${1:-}"
  jq -r --arg t "$target" '
    .skills | to_entries
    | map(select($t == "" or .key == $t))
    | .[] |
      "\(.key)\t uses=\(.value.uses)\t lessons=\(.value.lessons_logged)\t pinned=\(.value.pinned)\t last_used=\(.value.last_used // "never")"
  ' "$USAGE_FILE" | column -t -s $'\t'
}

verb_record() {
  local name="$1"
  local path; path=$(skill_path "$name")
  [ -z "$path" ] && { echo "❌ unknown skill: $name" >&2; exit 1; }
  ensure_entry "$name"
  local tmp; tmp=$(mktemp)
  jq --arg n "$name" --arg t "$(now_iso)" \
    '.skills[$n].uses += 1 | .skills[$n].last_used = $t | .generated_at = $t' \
    "$USAGE_FILE" > "$tmp" && mv "$tmp" "$USAGE_FILE"
  log "record $name"
  echo "📝 recorded use of $name"
}

verb_pin()   { ensure_entry "$1"; set_field "$1" pinned true;  log "pin $1";   echo "📌 pinned $1"; }
verb_unpin() { ensure_entry "$1"; set_field "$1" pinned false; log "unpin $1"; echo "📌 unpinned $1"; }

verb_archive() {
  local name="$1"
  local path; path=$(skill_path "$name")
  [ -z "$path" ] && { echo "❌ unknown skill: $name" >&2; exit 1; }
  case "$path" in "$ARCHIVE_DIR"/*) echo "ℹ️  $name already archived"; return ;; esac
  guard_human_only "$path" || exit 1
  local pinned; pinned=$(jq -r --arg n "$name" '.skills[$n].pinned // false' "$USAGE_FILE")
  [ "$pinned" = "true" ] && { echo "📌 $name is pinned — refuse archive" >&2; exit 1; }
  mv "$path" "$ARCHIVE_DIR/$name"
  log "archive $name (from $path)"
  echo "📦 archived $name → $ARCHIVE_DIR/$name"
  echo "↻  Run: bash scripts/regen-skills-index.sh"
}

verb_restore() {
  local name="$1"
  [ ! -d "$ARCHIVE_DIR/$name" ] && { echo "❌ not in archive: $name" >&2; exit 1; }
  local parent="skills"
  local tier; tier=$(fm_get "$ARCHIVE_DIR/$name/SKILL.md" tier)
  [ "$tier" = "optional" ] && parent="optional-skills"
  mv "$ARCHIVE_DIR/$name" "$parent/$name"
  log "restore $name → $parent"
  echo "♻️  restored $name → $parent/$name"
  echo "↻  Run: bash scripts/regen-skills-index.sh"
}

verb_prune() {
  local dry_run=false
  [ "${1:-}" = "--dry-run" ] && dry_run=true
  local cutoff
  cutoff=$(date -u -d "$STALE_DAYS days ago" +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null \
        || date -u -v "-${STALE_DAYS}d" +"%Y-%m-%dT%H:%M:%SZ")
  echo "🔎 pruning agent skills not used since $cutoff (stale_days=$STALE_DAYS, dry_run=$dry_run)"
  local candidates=()
  while IFS= read -r name; do
    [ -z "$name" ] && continue
    local path; path=$(skill_path "$name")
    [ -z "$path" ] && continue
    case "$path" in "$ARCHIVE_DIR"/*) continue ;; esac
    local created_by; created_by=$(fm_get "$path/SKILL.md" created_by)
    [ "$created_by" = "human" ] && continue
    local pinned; pinned=$(jq -r --arg n "$name" '.skills[$n].pinned // false' "$USAGE_FILE")
    [ "$pinned" = "true" ] && continue
    local last; last=$(jq -r --arg n "$name" '.skills[$n].last_used // ""' "$USAGE_FILE")
    if [ -z "$last" ] || [ "$last" = "null" ] || [ "$last" \< "$cutoff" ]; then
      candidates+=("$name")
    fi
  done < <(jq -r '.skills | keys[]' "$USAGE_FILE")
  if [ "${#candidates[@]}" -eq 0 ]; then
    echo "✅ nothing to prune"
    return
  fi
  for c in "${candidates[@]}"; do
    if $dry_run; then
      echo "  would archive: $c"
    else
      verb_archive "$c"
    fi
  done
}

verb_report() {
  echo "# Curator Report — $(now_iso)"
  echo ""
  echo "## Skills by usage"
  echo ""
  echo "| Skill | Uses | Lessons | Pinned | Last used |"
  echo "|---|---:|---:|:---:|---|"
  jq -r '
    .skills | to_entries | sort_by(-.value.uses) | .[] |
    "| \(.key) | \(.value.uses) | \(.value.lessons_logged) | \(if .value.pinned then "📌" else "" end) | \(.value.last_used // "never") |"
  ' "$USAGE_FILE"
  echo ""
  echo "## Filesystem"
  echo ""
  echo "- Active skills: $(find skills optional-skills -maxdepth 2 -name SKILL.md 2>/dev/null | wc -l | tr -d ' ')"
  echo "- Archived: $(find "$ARCHIVE_DIR" -maxdepth 2 -name SKILL.md 2>/dev/null | wc -l | tr -d ' ')"
}

# --- dispatch -------------------------------------------------------------

verb="${1:-status}"; shift || true
case "$verb" in
  status)   verb_status   "${1:-}" ;;
  record)   verb_record   "$1" ;;
  pin)      verb_pin      "$1" ;;
  unpin)    verb_unpin    "$1" ;;
  archive)  verb_archive  "$1" ;;
  restore)  verb_restore  "$1" ;;
  prune)    verb_prune    "${1:-}" ;;
  report)   verb_report ;;
  -h|--help) sed -n '1,25p' "$0" ;;
  *) echo "unknown verb: $verb (try --help)" >&2; exit 2 ;;
esac
