#!/usr/bin/env bash
# Copilot Agents Dojo — Curator (skill lifecycle manager)
#
# Reads .dojo/skill-usage.json + .dojo/bundled-manifest.txt and manages
# skill state per the invariants documented in AGENTS.md → Curator:
#
#   - NEVER auto-touches bundled skills (those in .dojo/bundled-manifest.txt).
#   - NEVER auto-touches created_by: human skills.
#   - NEVER deletes — max destructive action is archive to skills/.archive/.
#   - Pinned skills are exempt from all auto-transitions.
#   - skills/.archive/ is restorable.
#   - Every mutating run snapshots .dojo/curator-backups/<utc>/ first.
#   - Every real (non-dry-run) run writes .dojo/logs/curator/<utc>/.
#
# Usage:
#   bash scripts/curator.sh status [<skill>]
#   bash scripts/curator.sh record <skill>
#   bash scripts/curator.sh pin    <skill>
#   bash scripts/curator.sh unpin  <skill>
#   bash scripts/curator.sh archive <skill>
#   bash scripts/curator.sh restore <skill>
#   bash scripts/curator.sh transition [--dry-run]   # age-based state machine
#   bash scripts/curator.sh prune      [--dry-run]   # legacy alias for transition
#   bash scripts/curator.sh backup     [--reason <s>]
#   bash scripts/curator.sh rollback   [--list | --id <ts> | -y]
#   bash scripts/curator.sh report

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOJO_ROOT="${DOJO_ROOT:-$(dirname "$SCRIPT_DIR")}"
cd "$DOJO_ROOT"

USAGE_FILE=".dojo/skill-usage.json"
LOG_FILE=".dojo/curator.log"
MANIFEST=".dojo/bundled-manifest.txt"
ARCHIVE_DIR="skills/.archive"
BACKUP_DIR=".dojo/curator-backups"
REPORT_ROOT=".dojo/logs/curator"

STALE_DAYS="${DOJO_CURATOR_STALE_DAYS:-30}"
ARCHIVE_DAYS="${DOJO_CURATOR_ARCHIVE_DAYS:-90}"
BACKUP_KEEP="${DOJO_CURATOR_BACKUP_KEEP:-5}"
REPORT_KEEP="${DOJO_CURATOR_REPORT_KEEP:-20}"

mkdir -p .dojo "$ARCHIVE_DIR" "$BACKUP_DIR" "$REPORT_ROOT"
[ -f "$USAGE_FILE" ] || echo '{"version":1,"generated_at":null,"skills":{}}' > "$USAGE_FILE"
[ -f "$MANIFEST" ]   || : > "$MANIFEST"

command -v jq >/dev/null 2>&1 || {
  echo "❌ curator requires 'jq'. Install: https://jqlang.github.io/jq/" >&2
  exit 2
}

# --- helpers --------------------------------------------------------------

log() {
  local ts; ts=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  echo "$ts $*" >> "$LOG_FILE"
}

now_iso()    { date -u +"%Y-%m-%dT%H:%M:%SZ"; }
now_compact(){ date -u +"%Y%m%dT%H%M%SZ"; }

iso_days_ago() {
  local d="$1"
  date -u -d "$d days ago" +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null \
    || date -u -v "-${d}d" +"%Y-%m-%dT%H:%M:%SZ"
}

skill_path() {
  local name="$1"
  for parent in skills optional-skills; do
    if [ -f "$parent/$name/SKILL.md" ]; then
      echo "$parent/$name"; return
    fi
  done
  [ -f "$ARCHIVE_DIR/$name/SKILL.md" ] && { echo "$ARCHIVE_DIR/$name"; return; }
  echo ""
}

fm_get() {
  local file="$1" key="$2"
  awk -v key="$key" '
    /^---$/ { c++; next }
    c == 1 && $0 ~ "^"key":" {
      sub("^"key":[[:space:]]*", "")
      sub(/^"/, ""); sub(/"$/, "")
      print; exit
    }
  ' "$file"
}

is_bundled() {
  local name="$1"
  [ -s "$MANIFEST" ] && grep -Fxq "$name" "$MANIFEST"
}

ensure_entry() {
  local name="$1"
  local has; has=$(jq -r --arg n "$name" '.skills | has($n)' "$USAGE_FILE")
  if [ "$has" != "true" ]; then
    local tmp; tmp=$(mktemp)
    jq --arg n "$name" '.skills[$n] = {
      uses: 0,
      last_used: null,
      lessons_logged: 0,
      last_lesson_at: null,
      pinned: false,
      state: "active",
      archived_at: null
    }' "$USAGE_FILE" > "$tmp" && mv "$tmp" "$USAGE_FILE"
  else
    # backfill any missing fields on entries from older format
    local tmp; tmp=$(mktemp)
    jq --arg n "$name" '
      .skills[$n].state       //= "active" |
      .skills[$n].archived_at //= null
    ' "$USAGE_FILE" > "$tmp" && mv "$tmp" "$USAGE_FILE"
  fi
}

set_field() {
  local name="$1" key="$2" val="$3"
  local tmp; tmp=$(mktemp)
  jq --arg n "$name" --arg k "$key" --argjson v "$val" \
    '.skills[$n][$k] = $v' "$USAGE_FILE" > "$tmp" && mv "$tmp" "$USAGE_FILE"
}

set_field_str() {
  local name="$1" key="$2" val="$3"
  local tmp; tmp=$(mktemp)
  jq --arg n "$name" --arg k "$key" --arg v "$val" \
    '.skills[$n][$k] = $v' "$USAGE_FILE" > "$tmp" && mv "$tmp" "$USAGE_FILE"
}

guard_human_only() {
  local path="$1"
  local created_by; created_by=$(fm_get "$path/SKILL.md" created_by)
  if [ "$created_by" = "human" ]; then
    echo "🛑 refusing: $path is created_by: human (curator only manages agent skills)" >&2
    return 1
  fi
}

# --- backup / rollback ---------------------------------------------------

do_backup() {
  local reason="${1:-auto-pre-mutation}"
  local stamp; stamp=$(now_compact)
  local dir="$BACKUP_DIR/$stamp"
  mkdir -p "$dir"
  local manifest_file="$dir/manifest.json"
  local skills_present optional_present archive_present=false
  skills_present=$([ -d skills ] && echo true || echo false)
  optional_present=$([ -d optional-skills ] && echo true || echo false)
  [ -d "$ARCHIVE_DIR" ] && archive_present=true
  tar -czf "$dir/skills.tgz" \
    $([ "$skills_present"  = true ] && echo skills) \
    $([ "$optional_present" = true ] && echo optional-skills) \
    "$USAGE_FILE" "$MANIFEST" 2>/dev/null
  jq -n \
    --arg ts "$(now_iso)" \
    --arg reason "$reason" \
    --argjson size "$(wc -c < "$dir/skills.tgz" | tr -d ' ')" \
    '{created_at: $ts, reason: $reason, size_bytes: $size}' > "$manifest_file"
  log "backup $stamp reason=\"$reason\""
  echo "📦 backup: $dir/skills.tgz"
  prune_backups
  echo "$stamp"
}

prune_backups() {
  local keep="${BACKUP_KEEP}"
  # newest first
  local all
  all=$(ls -1 "$BACKUP_DIR" 2>/dev/null | sort -r)
  local i=0
  while IFS= read -r entry; do
    [ -z "$entry" ] && continue
    i=$((i + 1))
    if [ "$i" -gt "$keep" ]; then
      rm -rf "$BACKUP_DIR/$entry"
      log "prune_backup $entry"
    fi
  done <<< "$all"
}

verb_backup() {
  local reason="manual"
  if [ "${1:-}" = "--reason" ] && [ -n "${2:-}" ]; then
    reason="$2"
  fi
  do_backup "$reason"
}

verb_rollback() {
  local action="apply" target="" assume_yes=false
  while [ $# -gt 0 ]; do
    case "$1" in
      --list) action="list" ;;
      --id) target="$2"; shift ;;
      -y|--yes) assume_yes=true ;;
      *) echo "rollback: unknown flag $1" >&2; exit 2 ;;
    esac
    shift
  done

  if [ "$action" = "list" ]; then
    echo "Available backups (newest first):"
    for d in $(ls -1 "$BACKUP_DIR" 2>/dev/null | sort -r); do
      local m="$BACKUP_DIR/$d/manifest.json"
      if [ -f "$m" ]; then
        local reason size
        reason=$(jq -r '.reason' "$m")
        size=$(jq -r '.size_bytes' "$m")
        printf "  %s   size=%-8s reason=%s\n" "$d" "$size" "$reason"
      else
        printf "  %s   (no manifest)\n" "$d"
      fi
    done
    return
  fi

  if [ -z "$target" ]; then
    target=$(ls -1 "$BACKUP_DIR" 2>/dev/null | sort -r | head -1)
  fi
  [ -z "$target" ] && { echo "❌ no backups available" >&2; exit 1; }
  local arc="$BACKUP_DIR/$target/skills.tgz"
  [ ! -f "$arc" ] && { echo "❌ backup not found: $arc" >&2; exit 1; }

  if ! $assume_yes; then
    printf "⚠️  rollback to %s — REPLACES current skills/, optional-skills/, %s. Continue? [y/N] " \
      "$target" "$USAGE_FILE"
    read -r ans
    case "$ans" in y|Y|yes) ;; *) echo "  aborted"; return ;; esac
  fi

  # snapshot current state first so rollback itself is reversible
  do_backup "pre-rollback to $target" >/dev/null
  tar -xzf "$arc"
  log "rollback to $target"
  echo "♻️  rolled back to $target"
  echo "↻  Run: bash scripts/regen-skills-index.sh && bash scripts/verify.sh spec"
}

# --- per-run report ------------------------------------------------------

REPORT_DIR=""
REPORT_MD=""
REPORT_JSON=""

start_report() {
  local kind="$1"
  local stamp; stamp=$(now_compact)
  REPORT_DIR="$REPORT_ROOT/$stamp-$kind"
  mkdir -p "$REPORT_DIR"
  REPORT_MD="$REPORT_DIR/REPORT.md"
  REPORT_JSON="$REPORT_DIR/run.json"
  {
    echo "# Curator run — $(now_iso)"
    echo ""
    echo "- Kind: \`$kind\`"
    echo "- Thresholds: stale=$STALE_DAYS d, archive=$ARCHIVE_DAYS d"
    echo ""
    echo "## Actions"
    echo ""
  } > "$REPORT_MD"
  echo '{"started_at":"'"$(now_iso)"'","kind":"'"$kind"'","actions":[]}' > "$REPORT_JSON"
}

record_action() {
  local skill="$1" action="$2" detail="${3:-}"
  echo "- \`$skill\` → **$action**${detail:+ — $detail}" >> "$REPORT_MD"
  local tmp; tmp=$(mktemp)
  jq --arg s "$skill" --arg a "$action" --arg d "$detail" \
    '.actions += [{skill: $s, action: $a, detail: $d}]' "$REPORT_JSON" > "$tmp" \
    && mv "$tmp" "$REPORT_JSON"
}

end_report() {
  local count
  count=$(jq -r '.actions | length' "$REPORT_JSON")
  {
    echo ""
    echo "## Summary"
    echo ""
    echo "- Total actions: $count"
    echo "- Finished: $(now_iso)"
  } >> "$REPORT_MD"
  local tmp; tmp=$(mktemp)
  jq --arg t "$(now_iso)" '.finished_at = $t' "$REPORT_JSON" > "$tmp" \
    && mv "$tmp" "$REPORT_JSON"
  echo "📝 report: $REPORT_MD"
  prune_reports
}

prune_reports() {
  local keep="${REPORT_KEEP}"
  local i=0
  for d in $(ls -1 "$REPORT_ROOT" 2>/dev/null | sort -r); do
    i=$((i + 1))
    [ "$i" -gt "$keep" ] && rm -rf "$REPORT_ROOT/$d"
  done
}

# --- verbs ----------------------------------------------------------------

verb_status() {
  local target="${1:-}"
  jq -r --arg t "$target" '
    .skills | to_entries
    | map(select($t == "" or .key == $t))
    | .[] |
      "\(.key)\t state=\(.value.state // "active")\t uses=\(.value.uses)\t lessons=\(.value.lessons_logged)\t pinned=\(.value.pinned)\t last_used=\(.value.last_used // "never")"
  ' "$USAGE_FILE" | column -t -s $'\t'
}

verb_record() {
  local name="$1"
  local path; path=$(skill_path "$name")
  [ -z "$path" ] && { echo "❌ unknown skill: $name" >&2; exit 1; }
  ensure_entry "$name"
  local tmp; tmp=$(mktemp)
  jq --arg n "$name" --arg t "$(now_iso)" \
    '.skills[$n].uses += 1
     | .skills[$n].last_used = $t
     | .skills[$n].state = (if .skills[$n].state == "archived" then "archived" else "active" end)
     | .generated_at = $t' \
    "$USAGE_FILE" > "$tmp" && mv "$tmp" "$USAGE_FILE"
  log "record $name"
  echo "📝 recorded use of $name"
}

verb_pin()   { ensure_entry "$1"; set_field "$1" pinned true;  log "pin $1";   echo "📌 pinned $1"; }
verb_unpin() { ensure_entry "$1"; set_field "$1" pinned false; log "unpin $1"; echo "📌 unpinned $1"; }

_do_archive() {
  local name="$1" reason="${2:-manual}"
  local path; path=$(skill_path "$name")
  [ -z "$path" ] && { echo "❌ unknown skill: $name" >&2; return 1; }
  case "$path" in "$ARCHIVE_DIR"/*) echo "ℹ️  $name already archived"; return 0 ;; esac
  ensure_entry "$name"
  mv "$path" "$ARCHIVE_DIR/$name"
  set_field_str "$name" state "archived"
  set_field_str "$name" archived_at "$(now_iso)"
  log "archive $name (from $path, reason=$reason)"
  echo "📦 archived $name → $ARCHIVE_DIR/$name"
}

verb_archive() {
  local name="$1"
  local path; path=$(skill_path "$name")
  [ -z "$path" ] && { echo "❌ unknown skill: $name" >&2; exit 1; }
  guard_human_only "$path" || exit 1
  local pinned; pinned=$(jq -r --arg n "$name" '.skills[$n].pinned // false' "$USAGE_FILE")
  [ "$pinned" = "true" ] && { echo "📌 $name is pinned — refuse archive" >&2; exit 1; }
  if is_bundled "$name"; then
    echo "🛑 $name is bundled (.dojo/bundled-manifest.txt) — refuse manual archive" >&2
    exit 1
  fi
  do_backup "pre-archive $name" >/dev/null
  _do_archive "$name" "manual"
  echo "↻  Run: bash scripts/regen-skills-index.sh"
}

verb_restore() {
  local name="$1"
  [ ! -d "$ARCHIVE_DIR/$name" ] && { echo "❌ not in archive: $name" >&2; exit 1; }
  local parent="skills"
  local tier; tier=$(fm_get "$ARCHIVE_DIR/$name/SKILL.md" tier)
  [ "$tier" = "optional" ] && parent="optional-skills"
  mv "$ARCHIVE_DIR/$name" "$parent/$name"
  ensure_entry "$name"
  set_field_str "$name" state "active"
  set_field "$name" archived_at null
  log "restore $name → $parent"
  echo "♻️  restored $name → $parent/$name"
  echo "↻  Run: bash scripts/regen-skills-index.sh"
}

# Age-based state machine: active → stale (30d) → archived (90d).
# Bundled / human / pinned skills are exempt from any transition.
verb_transition() {
  local dry_run=false
  [ "${1:-}" = "--dry-run" ] && dry_run=true

  local stale_cut; stale_cut=$(iso_days_ago "$STALE_DAYS")
  local arch_cut;  arch_cut=$(iso_days_ago "$ARCHIVE_DAYS")

  echo "🔎 transition (dry_run=$dry_run)"
  echo "  stale_cut   = $stale_cut"
  echo "  archive_cut = $arch_cut"

  if ! $dry_run; then
    do_backup "pre-transition" >/dev/null
    start_report "transition"
  fi

  local actions=0
  while IFS= read -r name; do
    [ -z "$name" ] && continue
    local path; path=$(skill_path "$name")
    [ -z "$path" ] && continue
    # ineligible filters
    case "$path" in "$ARCHIVE_DIR"/*) continue ;; esac
    is_bundled "$name" && continue
    local created_by; created_by=$(fm_get "$path/SKILL.md" created_by)
    [ "$created_by" = "human" ] && continue
    local pinned; pinned=$(jq -r --arg n "$name" '.skills[$n].pinned // false' "$USAGE_FILE")
    [ "$pinned" = "true" ] && continue

    local last cur_state
    last=$(jq -r --arg n "$name" '.skills[$n].last_used // ""' "$USAGE_FILE")
    cur_state=$(jq -r --arg n "$name" '.skills[$n].state // "active"' "$USAGE_FILE")
    [ "$last" = "null" ] && last=""

    local target_state="$cur_state"
    if [ -z "$last" ] || [ "$last" \< "$arch_cut" ]; then
      target_state="archived"
    elif [ "$last" \< "$stale_cut" ]; then
      target_state="stale"
    else
      target_state="active"
    fi

    if [ "$target_state" = "$cur_state" ]; then
      continue
    fi

    actions=$((actions + 1))
    if $dry_run; then
      echo "  would: $name $cur_state → $target_state (last_used=${last:-never})"
      continue
    fi

    case "$target_state" in
      stale)
        set_field_str "$name" state "stale"
        log "stale $name"
        echo "  $name → stale"
        record_action "$name" "stale" "last_used=${last:-never}"
        ;;
      archived)
        _do_archive "$name" "auto-archive last_used=${last:-never}"
        record_action "$name" "archived" "last_used=${last:-never}"
        ;;
      active)
        set_field_str "$name" state "active"
        log "reactivate $name"
        echo "  $name → active"
        record_action "$name" "active" "last_used=${last:-never}"
        ;;
    esac
  done < <(jq -r '.skills | keys[]' "$USAGE_FILE")

  if [ "$actions" -eq 0 ]; then
    echo "✅ nothing to transition"
  fi

  if ! $dry_run; then
    # stamp last_run_at
    local tmp; tmp=$(mktemp)
    jq --arg t "$(now_iso)" '.last_run_at = $t' "$USAGE_FILE" > "$tmp" && mv "$tmp" "$USAGE_FILE"
    end_report
    [ "$actions" -gt 0 ] && echo "↻  Run: bash scripts/regen-skills-index.sh"
  fi
}

verb_report() {
  echo "# Curator Report — $(now_iso)"
  echo ""
  echo "## Configuration"
  echo "- Stale after: $STALE_DAYS days"
  echo "- Archive after: $ARCHIVE_DAYS days"
  echo "- Backups kept: $BACKUP_KEEP"
  echo "- Reports kept: $REPORT_KEEP"
  echo "- Manifest entries: $(wc -l < "$MANIFEST" | tr -d ' ')"
  echo ""
  echo "## Skills by usage"
  echo ""
  echo "| Skill | State | Uses | Lessons | Pinned | Last used |"
  echo "|---|---|---:|---:|:---:|---|"
  jq -r '
    .skills | to_entries | sort_by(-.value.uses) | .[] |
    "| \(.key) | \(.value.state // "active") | \(.value.uses) | \(.value.lessons_logged) | \(if .value.pinned then "📌" else "" end) | \(.value.last_used // "never") |"
  ' "$USAGE_FILE"
  echo ""
  echo "## Filesystem"
  echo ""
  echo "- Active skills: $(find skills optional-skills -maxdepth 2 -name SKILL.md 2>/dev/null | grep -v '/.archive/' | wc -l | tr -d ' ')"
  echo "- Archived: $(find "$ARCHIVE_DIR" -maxdepth 2 -name SKILL.md 2>/dev/null | wc -l | tr -d ' ')"
  echo "- Backups: $(ls -1 "$BACKUP_DIR" 2>/dev/null | wc -l | tr -d ' ')"
  echo "- Reports: $(ls -1 "$REPORT_ROOT" 2>/dev/null | wc -l | tr -d ' ')"
  local last_run; last_run=$(jq -r '.last_run_at // "never"' "$USAGE_FILE")
  echo "- Last transition run: $last_run"
}

# --- dispatch -------------------------------------------------------------

verb="${1:-status}"; shift || true
case "$verb" in
  status)     verb_status     "${1:-}" ;;
  record)     verb_record     "$1" ;;
  pin)        verb_pin        "$1" ;;
  unpin)      verb_unpin      "$1" ;;
  archive)    verb_archive    "$1" ;;
  restore)    verb_restore    "$1" ;;
  transition) verb_transition "${1:-}" ;;
  prune)      verb_transition "${1:-}" ;;  # legacy alias
  backup)     verb_backup     "$@" ;;
  rollback)   verb_rollback   "$@" ;;
  report)     verb_report ;;
  -h|--help)  sed -n '1,32p' "$0" ;;
  *) echo "unknown verb: $verb (try --help)" >&2; exit 2 ;;
esac
