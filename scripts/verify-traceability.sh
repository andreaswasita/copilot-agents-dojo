#!/usr/bin/env bash
# Copilot Agents Dojo — Traceability Gate (v1)
#
# Enforces the TOGAF red thread: no artifact at layer N+1 may persist
# unless it carries a verified link to a parent at layer N. The gate
# parses YAML frontmatter only — the body is for humans.
#
# Contract: spec/artifact-schema.md
#
# Usage:
#   bash scripts/verify-traceability.sh                                 # walks all engagements
#   bash scripts/verify-traceability.sh requirements/<engagement>       # one engagement
#   bash scripts/verify-traceability.sh --strict requirements/<engagement>
#       # --strict: unratified artifacts (ratified_by empty) are failures, not warnings.
#       # Exception: an engagement carrying a `.teaching-fixture` marker file keeps
#       # empty ratified_by as a WARNING even under --strict (demo/teaching trees).
#
# Exit codes:
#   0 — gate passed (zero failures; warnings allowed unless --strict)
#   1 — gate failed
#   2 — invocation error

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOJO_ROOT="${DOJO_ROOT:-$(dirname "$SCRIPT_DIR")}"
cd "$DOJO_ROOT"

STRICT=false
TARGETS=()
for arg in "$@"; do
  case "$arg" in
    --strict) STRICT=true ;;
    -h|--help) sed -n '1,20p' "$0"; exit 0 ;;
    -*) echo "unknown flag: $arg" >&2; exit 2 ;;
    *) TARGETS+=("$arg") ;;
  esac
done

if [ "${#TARGETS[@]}" -eq 0 ]; then
  if [ -d requirements ]; then
    while IFS= read -r d; do TARGETS+=("$d"); done < <(find requirements -mindepth 1 -maxdepth 1 -type d)
  fi
fi

if [ "${#TARGETS[@]}" -eq 0 ]; then
  echo "🧵 traceability-gate: no engagements found under requirements/ — nothing to do."
  exit 0
fi

PASSED=0; FAILED=0; WARNED=0
pass() { echo "  ✅ $1"; PASSED=$((PASSED + 1)); }
fail() { echo "  ❌ $1"; FAILED=$((FAILED + 1)); }
warn() { echo "  ⚠️  $1"; WARNED=$((WARNED + 1)); }
# note(): informational only — NOT counted as a warning, so it never trips
# verify.sh --check (where warnings are fatal). Used for intentional, documented
# exemptions such as teaching fixtures.
note() { echo "  ℹ️  $1"; }

# Layer cascade — must mirror spec/artifact-schema.md §1.
valid_parents_for() {
  case "$1" in
    BR)  echo "" ;;
    FR)  echo "BR" ;;
    NFR) echo "BR FR" ;;
    SR)  echo "BR FR NFR" ;;
    IR)  echo "FR NFR" ;;
    TR)  echo "FR NFR SR IR" ;;
    *)   echo "__INVALID__" ;;
  esac
}

# Extract a scalar YAML frontmatter value (very small parser — fields
# are simple scalars or inline arrays; multi-line YAML is out of scope
# for the artifact schema by design).
yaml_value() {
  local file="$1" key="$2"
  awk -v k="$key" '
    BEGIN { in_fm=0 }
    /^---[[:space:]]*$/ { in_fm++; next }
    in_fm == 1 {
      if ($0 ~ "^"k":") {
        sub("^"k":[[:space:]]*", "")
        # strip surrounding quotes
        gsub(/^["'\'']|["'\'']$/, "")
        print
        exit
      }
    }
  ' "$file"
}

# Extract inline YAML array: parent_ids: [A, B, C]  →  "A B C"
yaml_array() {
  local file="$1" key="$2"
  awk -v k="$key" '
    BEGIN { in_fm=0 }
    /^---[[:space:]]*$/ { in_fm++; next }
    in_fm == 1 && $0 ~ "^"k":" {
      sub("^"k":[[:space:]]*", "")
      gsub(/^\[|\]$/, "")
      gsub(/,/, " ")
      gsub(/["'\'']/, "")
      print
      exit
    }
  ' "$file"
}

# --- Walk one engagement ----------------------------------------------------
walk_engagement() {
  local eng="$1"
  echo "🧵 engagement: $eng"

  if [ ! -d "$eng" ]; then
    fail "$eng: directory not found"
    return
  fi

  # Teaching-fixture engagements (marked by a .teaching-fixture file) are demo
  # trees, not real engagements: in --strict mode an empty ratified_by is a
  # warning, not a failure, so the dojo can keep an intentionally-unratified
  # artifact in-tree while its own verify.sh --check gate stays green.
  local teaching_fixture=false
  [ -f "$eng/.teaching-fixture" ] && teaching_fixture=true

  # In-memory tables (parallel arrays keyed by ID).
  declare -A LAYER_OF FILE_OF PARENTS_OF MEASURABLE_OF RATIFIED_OF

  local files
  files=$(find "$eng" -mindepth 2 -maxdepth 2 -type f -name '*.md' \
          \( -path "*/BR/*" -o -path "*/FR/*" -o -path "*/NFR/*" \
             -o -path "*/SR/*" -o -path "*/IR/*" -o -path "*/TR/*" \) \
          2>/dev/null || true)

  if [ -z "$files" ]; then
    warn "$eng: zero requirement artifacts — seed state"
    return
  fi

  # Pass 1: parse and validate frontmatter shape
  while IFS= read -r f; do
    [ -z "$f" ] && continue
    local rel="${f#$DOJO_ROOT/}"
    local base id layer title parents owner measurable ratified deriv folder_layer
    base=$(basename "$f" .md)
    folder_layer=$(basename "$(dirname "$f")")

    id=$(yaml_value "$f" id)
    layer=$(yaml_value "$f" layer)
    title=$(yaml_value "$f" title)
    parents=$(yaml_array "$f" parent_ids)
    owner=$(yaml_value "$f" owner)
    measurable=$(yaml_value "$f" measurable)
    ratified=$(yaml_value "$f" ratified_by)
    deriv=$(yaml_value "$f" derivation_skill)

    # Required keys
    for k_name in id layer title owner measurable ratified_by derivation_skill; do
      local v
      v=$(yaml_value "$f" "$k_name")
      if [ -z "$v" ] && [ "$k_name" != "ratified_by" ]; then
        fail "$rel: missing required frontmatter key '$k_name'"
      fi
    done

    # id matches filename
    if [ "$id" != "$base" ]; then
      fail "$rel: id '$id' does not match filename '$base'"
    fi

    # id prefix matches folder layer
    if [ "${id%%-*}" != "$folder_layer" ]; then
      fail "$rel: id prefix '${id%%-*}' does not match folder '$folder_layer'"
    fi

    # layer valid
    case "$layer" in
      BR|FR|NFR|SR|IR|TR) ;;
      *) fail "$rel: layer '$layer' is not a valid layer code" ;;
    esac

    # layer matches folder
    if [ "$layer" != "$folder_layer" ]; then
      fail "$rel: layer '$layer' does not match folder '$folder_layer'"
    fi

    # measurable hardline
    case "$layer" in
      NFR|SR|TR)
        if [ "$measurable" != "true" ]; then
          fail "$rel: $layer artifacts require measurable: true (got '$measurable')"
        fi
        ;;
    esac

    # ratified_by — warn locally, fail in --strict (unless teaching fixture)
    if [ -z "$ratified" ] || [ "$ratified" = '""' ]; then
      if [ "$STRICT" = true ] && [ "$teaching_fixture" != true ]; then
        fail "$rel: ratified_by is empty (strict mode)"
      elif [ "$STRICT" = true ]; then
        note "$rel: ratified_by is empty — teaching fixture, exempt from strict"
      else
        warn "$rel: ratified_by is empty — artifact is unratified"
      fi
    fi

    # parent_ids hardline for non-BR
    if [ "$layer" != "BR" ] && [ -z "$parents" ]; then
      fail "$rel: parent_ids missing — only BR may have no parent"
    fi
    if [ "$layer" = "BR" ] && [ -n "$parents" ]; then
      warn "$rel: BR artifact declares parent_ids — root layer should have none"
    fi

    # Stash for pass 2
    LAYER_OF["$id"]="$layer"
    FILE_OF["$id"]="$rel"
    PARENTS_OF["$id"]="$parents"
    MEASURABLE_OF["$id"]="$measurable"
    RATIFIED_OF["$id"]="$ratified"
  done <<< "$files"

  # Pass 2: resolve parent links and layer-cascade rules
  for id in "${!LAYER_OF[@]}"; do
    local layer="${LAYER_OF[$id]}" rel="${FILE_OF[$id]}"
    local parents="${PARENTS_OF[$id]}"
    [ -z "$parents" ] && continue
    local allowed
    allowed=" $(valid_parents_for "$layer") "
    for pid in $parents; do
      if [ -z "${LAYER_OF[$pid]+set}" ]; then
        fail "$rel: parent_id '$pid' does not resolve to any artifact in $eng"
        continue
      fi
      local player="${LAYER_OF[$pid]}"
      case "$allowed" in
        *" $player "*) ;;  # ok
        *) fail "$rel: parent '$pid' is layer '$player', not a valid parent of '$layer' (see spec/artifact-schema.md §1)" ;;
      esac
    done
  done

  # Pass 3: cycle detection (a cycle = a node reachable as its own ancestor).
  # Walking the same ancestor twice via different paths in a DAG is NOT a cycle.
  for start in "${!LAYER_OF[@]}"; do
    local visited=" "
    local frontier="${PARENTS_OF[$start]:-}"
    while [ -n "$(echo "$frontier" | tr -d '[:space:]')" ]; do
      local next=""
      local cycle_found=false
      for cur in $frontier; do
        if [ "$cur" = "$start" ]; then
          fail "${FILE_OF[$start]}: cycle detected — '$start' is its own ancestor"
          cycle_found=true
          break
        fi
        case "$visited" in
          *" $cur "*) continue ;;  # already explored this ancestor; not a cycle
        esac
        visited="$visited$cur "
        next="$next ${PARENTS_OF[$cur]:-}"
      done
      [ "$cycle_found" = true ] && break
      frontier="$next"
    done
  done

  echo "  ($eng: ${#LAYER_OF[@]} artifacts validated)"
}

for t in "${TARGETS[@]}"; do
  walk_engagement "$t"
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  traceability-gate: ✅ $PASSED · ❌ $FAILED · ⚠️  $WARNED"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$FAILED" -gt 0 ]; then
  echo "🚫 traceability-gate FAILED — see spec/artifact-schema.md"
  exit 1
fi
echo "🧵 red thread holds."
