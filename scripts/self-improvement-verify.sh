#!/usr/bin/env bash
# self-improvement-verify.sh
# Concrete checks that prove the `self-improvement` skill is producing the
# intended outcomes. Run at session end (or after any correction):
#   bash scripts/self-improvement-verify.sh
# Exits non-zero on hard failures. Warnings print to stderr but do not fail.
#
# Checks:
#   1. tasks/lessons.md exists
#   2. Every lesson block has a `rule:` field (no diary entries)
#   3. Same `rule:` is not duplicated across active entries
#   4. Entries with occurrences >= 3 are amended-to-skill OR have a
#      corresponding file under memory/patterns/
#   5. memory/INDEX.md reports zero orphans
#   6. If a session summary was written today, it links to at least one
#      decision, pattern, or preference
#
# Designed to be portable across Git Bash on Windows, macOS, and Linux.

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DOJO_ROOT="${DOJO_ROOT:-$(dirname "$SCRIPT_DIR")}"
cd "$DOJO_ROOT"

pass=0
fail=0
warn=0

ok()   { echo "✅ $*"; pass=$((pass+1)); }
bad()  { echo "❌ $*"; fail=$((fail+1)); }
note() { echo "⚠️  $*" >&2; warn=$((warn+1)); }

lessons=tasks/lessons.md

# 1. lessons file present
if [[ -f "$lessons" ]]; then
  ok "tasks/lessons.md exists"
else
  bad "tasks/lessons.md missing — run scripts/init.sh"
  echo "Summary: pass=$pass fail=$fail warn=$warn"
  exit 1
fi

# 2. every `- date:` block has a `rule:` field
missing_rules=$(awk '
  /^- date:/ {
    if (in_block && !has_rule) print "  " block_first
    in_block=1; has_rule=0; block_first=$0
    next
  }
  in_block && /^[[:space:]]+rule:/ { has_rule=1 }
  END {
    if (in_block && !has_rule) print "  " block_first
  }
' "$lessons")
if [[ -z "$missing_rules" ]]; then
  ok "every lesson has a rule: field"
else
  bad "lessons without rule: field:"
  echo "$missing_rules"
fi

# 3. duplicate active rules
dupes=$(grep -E '^[[:space:]]+rule:' "$lessons" | sort | uniq -d || true)
if [[ -z "$dupes" ]]; then
  ok "no duplicated rules (use occurrences: instead)"
else
  note "duplicated rules detected — increment occurrences: instead of cloning:"
  echo "$dupes" >&2
fi

# 4. occurrences >= 3 → either amended-to-skill or pattern file exists
over_threshold=$(awk '
  /^- date:/ { occ=0; status=""; rule="" }
  /^[[:space:]]+occurrences:/ { occ=$2+0 }
  /^[[:space:]]+status:/ { status=$2 }
  /^[[:space:]]+rule:/ {
    rule=$0; sub(/^[[:space:]]+rule:[[:space:]]*/,"",rule)
    gsub(/^"|"$/,"",rule)
  }
  /^$/ {
    if (occ>=3 && status!="amended-to-skill") print rule
  }
' "$lessons")
if [[ -z "$over_threshold" ]]; then
  ok "no unpromoted rules at occurrences >= 3"
else
  has_pattern_file=true
  while IFS= read -r r; do
    [[ -z "$r" ]] && continue
    if ! ls memory/patterns/*.md 2>/dev/null | xargs -I{} grep -l -F -- "$r" {} >/dev/null 2>&1; then
      has_pattern_file=false
      note "rule at threshold without memory/patterns/ entry: $r"
    fi
  done <<< "$over_threshold"
  $has_pattern_file && ok "all threshold rules have pattern files" || true
fi

# 5. memory graph orphans
if [[ -x scripts/link-index.sh ]]; then
  bash scripts/link-index.sh >/dev/null 2>&1 || note "link-index.sh exited non-zero"
fi
if [[ -f memory/INDEX.md ]]; then
  orphan_count=$(grep -c -i "orphan" memory/INDEX.md || true)
  if [[ "$orphan_count" -eq 0 ]]; then
    ok "memory/ graph has no orphans"
  else
    note "memory/INDEX.md mentions $orphan_count orphan(s)"
  fi
else
  note "memory/INDEX.md missing — skipping orphan check"
fi

# 6. today's session summary (if present) links to decisions/patterns/preferences
today=$(date +%Y-%m-%d)
shopt -s nullglob
sessions=(memory/sessions/${today}-*.md)
shopt -u nullglob
if (( ${#sessions[@]} > 0 )); then
  if grep -q -E '\]\(\.\./(decisions|patterns|preferences)/' "${sessions[@]}"; then
    ok "today's session summary links to memory entries"
  else
    note "today's session summary exists but has no decision/pattern/preference links"
  fi
fi

echo
echo "Summary: pass=$pass fail=$fail warn=$warn"
(( fail == 0 ))
