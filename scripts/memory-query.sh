#!/usr/bin/env bash
# Copilot Agents Dojo — Memory Query Tool
# Search the memory vault by tag, type, date range, or free text.
#
# Usage:
#   bash scripts/memory-query.sh --tag architecture
#   bash scripts/memory-query.sh --type decision
#   bash scripts/memory-query.sh --since 2026-01-01
#   bash scripts/memory-query.sh --text "postgres"
#   bash scripts/memory-query.sh --backlinks-for decisions/chose-postgres.md
#   bash scripts/memory-query.sh --stats
#
# Agents call this script to find relevant context in the memory vault
# without reading every file. Lightweight Dataview replacement.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
MEMORY_DIR="$REPO_ROOT/memory"
GRAPH_FILE="$MEMORY_DIR/.link-graph.json"

usage() {
  echo "Usage: memory-query.sh [OPTIONS]"
  echo ""
  echo "Options:"
  echo "  --tag TAG           Find files with TAG in frontmatter tags list"
  echo "  --type TYPE         Filter by type (decision|pattern|preference|session)"
  echo "  --since DATE        Files with date >= DATE (YYYY-MM-DD)"
  echo "  --until DATE        Files with date <= DATE (YYYY-MM-DD)"
  echo "  --status STATUS     Filter by status (active|accepted|retired|deprecated)"
  echo "  --text QUERY        Full-text search across all memory files"
  echo "  --backlinks-for F   Show files that link TO the given file (relative to memory/)"
  echo "  --links-from F      Show files that the given file links TO"
  echo "  --stats             Show vault statistics"
  echo "  --recent N          Show N most recently modified files (default: 5)"
  echo ""
  echo "Multiple options can be combined (AND logic)."
  exit 0
}

if [ $# -eq 0 ]; then
  usage
fi

# Defaults
FILTER_TAG=""
FILTER_TYPE=""
FILTER_SINCE=""
FILTER_UNTIL=""
FILTER_STATUS=""
FILTER_TEXT=""
BACKLINKS_FOR=""
LINKS_FROM=""
SHOW_STATS=false
RECENT_N=0

# Parse args
while [ $# -gt 0 ]; do
  case "$1" in
    --tag) FILTER_TAG="$2"; shift 2 ;;
    --type) FILTER_TYPE="$2"; shift 2 ;;
    --since) FILTER_SINCE="$2"; shift 2 ;;
    --until) FILTER_UNTIL="$2"; shift 2 ;;
    --status) FILTER_STATUS="$2"; shift 2 ;;
    --text) FILTER_TEXT="$2"; shift 2 ;;
    --backlinks-for) BACKLINKS_FOR="$2"; shift 2 ;;
    --links-from) LINKS_FROM="$2"; shift 2 ;;
    --stats) SHOW_STATS=true; shift ;;
    --recent) RECENT_N="${2:-5}"; shift 2 ;;
    --help|-h) usage ;;
    *) echo "Unknown option: $1"; usage ;;
  esac
done

# ─── Stats mode ───
if [ "$SHOW_STATS" = true ]; then
  if [ -f "$GRAPH_FILE" ]; then
    cat "$GRAPH_FILE"
  else
    echo "No link graph found. Run scripts/link-index.sh first."
  fi
  exit 0
fi

# ─── Backlinks mode ───
if [ -n "$BACKLINKS_FOR" ]; then
  if [ -f "$GRAPH_FILE" ]; then
    echo "Files linking to: $BACKLINKS_FOR"
    python3 -c "
import json, sys
with open('$GRAPH_FILE') as f:
    g = json.load(f)
bl = g.get('back_links', {}).get('$BACKLINKS_FOR', [])
for src in bl:
    print(f'  ← {src}')
if not bl:
    print('  (no backlinks)')
" 2>/dev/null || echo "  (python3 required for graph queries)"
  else
    echo "No link graph found. Run scripts/link-index.sh first."
  fi
  exit 0
fi

# ─── Forward links mode ───
if [ -n "$LINKS_FROM" ]; then
  if [ -f "$GRAPH_FILE" ]; then
    echo "Files linked from: $LINKS_FROM"
    python3 -c "
import json
with open('$GRAPH_FILE') as f:
    g = json.load(f)
fl = g.get('forward_links', {}).get('$LINKS_FROM', [])
for tgt in fl:
    print(f'  → {tgt}')
if not fl:
    print('  (no outgoing links)')
" 2>/dev/null || echo "  (python3 required for graph queries)"
  else
    echo "No link graph found. Run scripts/link-index.sh first."
  fi
  exit 0
fi

# ─── Recent mode ───
if [ "$RECENT_N" -gt 0 ]; then
  echo "Most recent $RECENT_N memory files:"
  find "$MEMORY_DIR" -name '*.md' ! -name '_template.md' ! -name 'INDEX.md' -type f \
    -exec stat -f '%m %N' {} \; 2>/dev/null | sort -rn | head -n "$RECENT_N" | \
    while read -r _ filepath; do
      rel="${filepath#$MEMORY_DIR/}"
      title=$(grep -m1 '^# ' "$filepath" 2>/dev/null | sed 's/^# //' || echo "$rel")
      echo "  $rel — $title"
    done
  exit 0
fi

# ─── Search mode — scan all files with filters ───
mapfile -t MD_FILES < <(find "$MEMORY_DIR" -name '*.md' ! -name '_template.md' ! -name 'INDEX.md' -type f | sort)

for file in "${MD_FILES[@]}"; do
  rel_path="${file#$MEMORY_DIR/}"
  match=true

  # Extract frontmatter (between first two --- lines)
  frontmatter=$(sed -n '/^---$/,/^---$/p' "$file" 2>/dev/null | head -20)

  # Filter by type
  if [ -n "$FILTER_TYPE" ] && [ "$match" = true ]; then
    file_type=$(echo "$frontmatter" | grep '^type:' | head -1 | sed 's/type: *//')
    if [ "$file_type" != "$FILTER_TYPE" ]; then
      match=false
    fi
  fi

  # Filter by tag
  if [ -n "$FILTER_TAG" ] && [ "$match" = true ]; then
    if ! echo "$frontmatter" | grep -q "$FILTER_TAG"; then
      match=false
    fi
  fi

  # Filter by date range
  if [ -n "$FILTER_SINCE" ] && [ "$match" = true ]; then
    file_date=$(echo "$frontmatter" | grep '^date:' | head -1 | sed 's/date: *//')
    if [ -n "$file_date" ] && [[ "$file_date" < "$FILTER_SINCE" ]]; then
      match=false
    fi
  fi

  if [ -n "$FILTER_UNTIL" ] && [ "$match" = true ]; then
    file_date=$(echo "$frontmatter" | grep '^date:' | head -1 | sed 's/date: *//')
    if [ -n "$file_date" ] && [[ "$file_date" > "$FILTER_UNTIL" ]]; then
      match=false
    fi
  fi

  # Filter by status
  if [ -n "$FILTER_STATUS" ] && [ "$match" = true ]; then
    file_status=$(echo "$frontmatter" | grep '^status:' | head -1 | sed 's/status: *//')
    if [ "$file_status" != "$FILTER_STATUS" ]; then
      match=false
    fi
  fi

  # Filter by text
  if [ -n "$FILTER_TEXT" ] && [ "$match" = true ]; then
    if ! grep -qi "$FILTER_TEXT" "$file" 2>/dev/null; then
      match=false
    fi
  fi

  # Output matching file
  if [ "$match" = true ]; then
    title=$(grep -m1 '^# ' "$file" 2>/dev/null | sed 's/^# //' || echo "$rel_path")
    file_date=$(echo "$frontmatter" | grep '^date:' | head -1 | sed 's/date: *//' || echo "n/a")
    echo "  $rel_path  [$file_date]  $title"
  fi
done
