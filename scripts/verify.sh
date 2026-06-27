#!/usr/bin/env bash
# Copilot Agents Dojo — Verification Gate (v1)
#
# Single source of truth for "is this dojo clone in good shape?"
# Run before every PR. CI runs the same script with --check.
#
# Usage:
#   bash scripts/verify.sh                  # full gate
#   bash scripts/verify.sh spec             # only spec/frontmatter invariants
#   bash scripts/verify.sh tests            # only the pytest/skill smoke tests
#   bash scripts/verify.sh plan             # only the tasks/todo.md sanity check
#   bash scripts/verify.sh actions          # only the Action SHA-pin audit
#   bash scripts/verify.sh --check          # CI mode: fail on warnings too
#
# Hermetic environment:
#   We pin TZ=UTC, LANG=C.UTF-8, and unset credential env vars so local
#   runs match CI. This prevents "works on my machine" drift caused by
#   timezone-dependent string comparisons, locale-dependent sort order,
#   or tests that silently use a developer's real API keys.
#
# Profile-safe:
#   All paths resolve from ${DOJO_ROOT:-<repo>}.

set -euo pipefail

# --- Hermetic env ---------------------------------------------------------
export TZ=UTC
export LANG=C.UTF-8
export LC_ALL=C.UTF-8
# Strip credentials so tests can never call real APIs by accident.
unset GITHUB_TOKEN GH_TOKEN OPENAI_API_KEY ANTHROPIC_API_KEY \
      AZURE_OPENAI_API_KEY GOOGLE_API_KEY GEMINI_API_KEY \
      HUGGINGFACE_TOKEN COPILOT_TOKEN 2>/dev/null || true

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOJO_ROOT="${DOJO_ROOT:-$(dirname "$SCRIPT_DIR")}"
cd "$DOJO_ROOT"

PASSED=0; FAILED=0; WARNED=0
CHECK_MODE=false
MODE="all"

for arg in "$@"; do
  case "$arg" in
    --check) CHECK_MODE=true ;;
    spec|tests|plan|actions|traceability|all) MODE="$arg" ;;
    -h|--help) sed -n '1,30p' "$0"; exit 0 ;;
    *) echo "unknown arg: $arg" >&2; exit 2 ;;
  esac
done

pass() { echo "  ✅ $1"; PASSED=$((PASSED + 1)); }
fail() { echo "  ❌ $1"; FAILED=$((FAILED + 1)); }
warn() { echo "  ⚠️  $1"; WARNED=$((WARNED + 1)); }

echo "🥋 Copilot Agents Dojo — Verification (mode=$MODE, root=$DOJO_ROOT)"
echo ""

# =========================================================================
# Spec / frontmatter invariants
# =========================================================================
run_spec_checks() {
  echo "[spec] Scanning skill frontmatter and bodies…"
  local skill_files
  skill_files=$(find skills optional-skills -name SKILL.md 2>/dev/null || true)
  if [ -z "$skill_files" ]; then
    warn "No SKILL.md files found under skills/ or optional-skills/"
    return
  fi

  # Banned marketing words in description/intro
  local banned_words='powerful|comprehensive|seamless|advanced|robust|cutting-edge|intelligent|revolutionary'
  # Banned bare shell utilities in prose (skip code fences via simple heuristic — flag for review)
  local banned_shell='\b(cat|sed|awk|find|head|tail)\b'

  local seen_names=""
  while IFS= read -r f; do
    [ -z "$f" ] && continue
    local rel="${f#$DOJO_ROOT/}"

    # Required frontmatter keys
    for key in name description tier category created_by platforms; do
      if ! awk '/^---$/{c++; next} c==1' "$f" | grep -qE "^${key}:"; then
        fail "$rel: missing required frontmatter key '$key'"
      fi
    done

    # description <= 60 chars and ends with period
    local desc
    desc=$(awk '/^---$/{c++; next} c==1 && /^description:/{sub(/^description: */,""); print; exit}' "$f" \
           | sed -E 's/^"//; s/"$//; s/^>-\s*//')
    if [ -n "$desc" ]; then
      local n=${#desc}
      if [ "$n" -gt 60 ]; then
        fail "$rel: description is $n chars (max 60): \"$desc\""
      fi
      case "$desc" in
        *.) ;;
        *) fail "$rel: description must end with a period";;
      esac
      if echo "$desc" | grep -qiE "$banned_words"; then
        fail "$rel: description contains a banned marketing word"
      fi
    fi

    # name must match folder
    local folder name
    folder=$(basename "$(dirname "$f")")
    name=$(awk '/^---$/{c++; next} c==1 && /^name:/{sub(/^name: */,""); print; exit}' "$f")
    if [ "$folder" != "$name" ]; then
      fail "$rel: name '$name' does not match folder '$folder'"
    fi
    case " $seen_names " in
      *" $name "*) fail "$rel: duplicate skill name '$name'";;
      *) seen_names="$seen_names $name";;
    esac

    # tier must be valid
    local tier
    tier=$(awk '/^---$/{c++; next} c==1 && /^tier:/{sub(/^tier: */,""); print; exit}' "$f")
    case "$tier" in core|practical|optional) ;;
      *) fail "$rel: tier '$tier' must be core|practical|optional";;
    esac

    # Required body sections in correct order.
    # Track code fences so a literal `---` inside ```yaml example doesn't
    # get counted as a frontmatter delimiter.
    local body
    body=$(awk '
      /^```/ { fence = !fence; print; next }
      !fence && /^---$/ { c++; next }
      c >= 2 { print }
    ' "$f")
    local prev=0
    for section in "When to Use" "Prerequisites" "How to Run" "Quick Reference" "Procedure" "Pitfalls" "Verification"; do
      local line
      line=$(echo "$body" | grep -nE "^## ${section}\b" | head -n1 | cut -d: -f1 || true)
      if [ -z "$line" ]; then
        fail "$rel: missing required section '## $section'"
        continue
      fi
      if [ "$line" -le "$prev" ]; then
        fail "$rel: section '## $section' is out of order"
      fi
      prev=$line
    done

    # Strip ```…``` blocks for prose-level checks (so meta skills that
    # document forbidden words/utilities in code examples don't false-positive).
    local prose
    prose=$(echo "$body" | awk 'BEGIN{infence=0} /^```/{infence=1-infence; next} !infence')

    # Banned marketing words in prose (outside code fences)
    if echo "$prose" | grep -qiE "$banned_words"; then
      warn "$rel: body contains a banned marketing word (review prose)"
    fi

    # Banned bare shell utility references in prose (outside code fences)
    if echo "$prose" | grep -qE "$banned_shell"; then
      warn "$rel: prose references a bare shell utility (use Copilot tool instead — see spec §3)"
    fi
  done <<< "$skill_files"

  # skills.md drift: every skill folder present in index, and vice versa
  if [ -f skills.md ]; then
    local fs_names index_names
    fs_names=$(find skills optional-skills -name SKILL.md 2>/dev/null \
               | awk -F/ '{print $(NF-1)}' | sort -u)
    index_names=$(grep -oE 'skills/[a-z0-9-]+|optional-skills/[a-z0-9-]+' skills.md \
                  | awk -F/ '{print $2}' | sort -u)
    local diff_out
    diff_out=$(diff <(echo "$fs_names") <(echo "$index_names") || true)
    if [ -n "$diff_out" ]; then
      warn "skills.md drift detected — regenerate via scripts/regen-skills-index.sh"
    else
      pass "skills.md matches filesystem"
    fi
  else
    warn "skills.md missing"
  fi

  # prompts drift: generated slash-command shims must match skills/ + agents/
  if [ -d .github/prompts ]; then
    if bash scripts/regen-prompts.sh --check >/dev/null 2>&1; then
      pass ".github/prompts matches skills/ and agents/"
    else
      warn ".github/prompts drift — regenerate via scripts/regen-prompts.sh"
    fi
  fi

  if [ "$FAILED" -eq 0 ]; then pass "spec invariants OK"; fi
}

# =========================================================================
# Persona registry drift (agents/registry.yaml ↔ agents/*.md)
# =========================================================================
run_persona_checks() {
  echo "[personas] Checking agents/registry.yaml drift…"
  local reg="agents/registry.yaml"
  if [ ! -f "$reg" ]; then
    warn "agents/registry.yaml missing — falling back to per-file frontmatter"
    return
  fi
  local fs_slugs reg_slugs
  fs_slugs=$(find agents -maxdepth 1 -name '*.md' 2>/dev/null \
             | awk -F/ '{print $NF}' | sed 's/\.md$//' | sort -u)
  reg_slugs=$(grep -E '^[[:space:]]*-[[:space:]]*slug:' "$reg" \
              | sed -E 's/^[[:space:]]*-[[:space:]]*slug:[[:space:]]*//' | sort -u)
  local diff_out
  diff_out=$(diff <(echo "$fs_slugs") <(echo "$reg_slugs") || true)
  if [ -n "$diff_out" ]; then
    warn "agents/registry.yaml drift — re-sync with agents/*.md (see diff below)"
    echo "$diff_out" | sed 's/^/    /'
  else
    pass "agents/registry.yaml matches agents/*.md"
  fi
}

# =========================================================================
# Path audit — scripts must respect DOJO_ROOT, never hardcode parent paths
# =========================================================================
run_path_audit() {
  echo "[paths] Auditing scripts/ for DOJO_ROOT compliance…"
  local files
  files=$(find scripts -maxdepth 1 -type f \( -name '*.sh' -o -name '*.ps1' \) 2>/dev/null || true)
  [ -z "$files" ] && { warn "no scripts found"; return; }

  local bad=0
  while IFS= read -r f; do
    [ -z "$f" ] && continue
    # Each script must reference DOJO_ROOT (env or var) — the contract from AGENTS.md §Path Convention.
    if ! grep -qE 'DOJO_ROOT' "$f"; then
      warn "$f: does not reference DOJO_ROOT (see AGENTS.md → Path Convention)"
      bad=$((bad + 1))
      continue
    fi
    # Hardcoded parent-relative paths that ignore DOJO_ROOT are the bug pattern.
    # Allow them inside comments (lines starting with #) and inside heredocs we
    # can't easily detect — keep this a warning, not an error.
    local hits
    hits=$(grep -nE '(^|[^A-Za-z0-9_/.$"])(\.\./(skills|tasks|agents|optional-skills|cli|mcp|template|spec|\.dojo)/)' "$f" \
           | grep -vE '^[0-9]+:[[:space:]]*#' || true)
    if [ -n "$hits" ]; then
      warn "$f: hardcoded parent-relative dojo path (use \${DOJO_ROOT}/… instead)"
      echo "$hits" | sed 's/^/    /'
      bad=$((bad + 1))
    fi
  done <<< "$files"
  [ "$bad" -eq 0 ] && pass "all scripts respect DOJO_ROOT" || true
}

# =========================================================================
# Curator provenance — bundled manifest must exist once .dojo is initialized
# =========================================================================
run_curator_checks() {
  echo "[curator] Checking .dojo provenance manifest…"
  if [ ! -d .dojo ]; then
    warn ".dojo/ missing — run scripts/init.sh"
    return
  fi
  if [ ! -f .dojo/bundled-manifest.txt ]; then
    warn ".dojo/bundled-manifest.txt missing — run scripts/regen-skills-index.sh"
    return
  fi
  local count
  count=$(grep -cve '^\s*$' .dojo/bundled-manifest.txt || true)
  if [ "$count" -lt 1 ]; then
    fail ".dojo/bundled-manifest.txt is empty — regen-skills-index.sh broken?"
    return
  fi
  pass ".dojo/bundled-manifest.txt has $count entries"
}

# =========================================================================
# Plan sanity (tasks/todo.md)
# =========================================================================
run_plan_checks() {
  echo "[plan] Checking tasks/todo.md…"
  if [ ! -f tasks/todo.md ]; then
    fail "tasks/todo.md not found — run scripts/init.sh"
    return
  fi
  # Canonical-repo mode: when running inside the dojo source repo itself
  # (presence of spec/ + skills/), tasks/todo.md SHOULD be the default
  # scaffold template — it's an artifact downstream consumers fill in,
  # not a working plan for the dojo's own development. PR working plans
  # live in plan.md inside the session folder (or scratch branches),
  # not in the canonical scaffold.
  local canonical_repo=false
  if [ -f spec/copilot-skills-spec.md ] && [ -d skills ] && [ -f scripts/init.sh ]; then
    canonical_repo=true
  fi
  if grep -qE '^- \[( |x)\] Step 1$' tasks/todo.md \
     && ! grep -qE '^- \[( |x)\] (?!Step [0-9])' tasks/todo.md 2>/dev/null; then
    if [ "$canonical_repo" = true ]; then
      pass "tasks/todo.md is the canonical scaffold template (expected on dojo main)"
    else
      warn "tasks/todo.md looks like the default template"
    fi
  else
    if [ "$canonical_repo" = true ]; then
      warn "tasks/todo.md has been edited away from the scaffold template on the dojo repo (PR working plans belong in scratch state, not in the canonical scaffold)"
    else
      pass "tasks/todo.md has a real plan"
    fi
  fi
  [ -f tasks/lessons.md ] && pass "tasks/lessons.md exists" \
                          || warn "tasks/lessons.md missing — run scripts/init.sh"
}

# =========================================================================
# GitHub Actions SHA-pin audit
# =========================================================================
run_actions_checks() {
  echo "[actions] Auditing .github/workflows/ for SHA-pinned uses:…"
  local files
  files=$(find .github/workflows -name '*.yml' -o -name '*.yaml' 2>/dev/null || true)
  if [ -z "$files" ]; then
    warn "no workflow files found"
    return
  fi
  local bad=0
  while IFS= read -r wf; do
    [ -z "$wf" ] && continue
    # Allowed: uses: <owner/repo>@<40-hex-sha>  # comment
    # Reject:  uses: <…>@v4   or @main
    local violations
    violations=$(grep -nE '^\s*-?\s*uses:\s*[^@]+@[^[:space:]]+' "$wf" \
                 | grep -vE '@[0-9a-f]{40}\b' || true)
    if [ -n "$violations" ]; then
      while IFS= read -r v; do
        fail "$wf: $v  (pin to 40-char SHA + version comment)"
        bad=$((bad+1))
      done <<< "$violations"
    fi
  done <<< "$files"
  [ "$bad" -eq 0 ] && pass "all workflow uses: lines are SHA-pinned"
}

# =========================================================================
# Tests (skill smoke tests + auto-detected project tests)
# =========================================================================
run_tests() {
  echo "[tests] Running skill smoke tests…"
  local skill_tests
  skill_tests=$(find skills optional-skills -path '*/tests' -type d 2>/dev/null || true)
  if [ -n "$skill_tests" ] && command -v python >/dev/null 2>&1; then
    if python -m pytest $skill_tests -q --no-header 2>&1; then
      pass "skill smoke tests passed"
    else
      fail "skill smoke tests failed"
    fi
  else
    warn "no skill tests found (or python unavailable) — skipping"
  fi
}

# =========================================================================
# Traceability gate — TOGAF red thread (spec/artifact-schema.md)
# =========================================================================
run_traceability_checks() {
  echo "[traceability] Walking requirements/ for parent-link lineage…"
  if [ ! -d requirements ]; then
    warn "requirements/ missing — no engagements to check"
    return
  fi
  local trace_args=()
  [ "$CHECK_MODE" = true ] && trace_args+=("--strict")
  if bash "$DOJO_ROOT/scripts/verify-traceability.sh" "${trace_args[@]}" >/tmp/dojo-trace.log 2>&1; then
    pass "traceability gate passed"
    # Re-emit any traceability warnings. Guard with `grep -q` so that a clean
    # run (zero ⚠️ lines) doesn't make grep exit non-zero and trip `set -e`.
    if grep -qE '^  ⚠️' /tmp/dojo-trace.log; then
      grep -E '^  ⚠️' /tmp/dojo-trace.log | while IFS= read -r w; do
        warn "${w#  ⚠️  }"
      done
    fi
  else
    fail "traceability gate failed — see output below"
    sed 's/^/    /' /tmp/dojo-trace.log
  fi
}

# --- Dispatch -------------------------------------------------------------
case "$MODE" in
  spec)    run_spec_checks; run_persona_checks; run_path_audit; run_curator_checks ;;
  plan)    run_plan_checks ;;
  actions) run_actions_checks ;;
  tests)   run_tests ;;
  traceability) run_traceability_checks ;;
  all)     run_spec_checks; run_persona_checks; run_path_audit; run_curator_checks; run_plan_checks; run_actions_checks; run_traceability_checks; run_tests ;;
esac

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Results: ✅ $PASSED passed, ❌ $FAILED failed, ⚠️  $WARNED warnings"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$FAILED" -gt 0 ]; then
  echo "🚫 Verification FAILED."
  exit 1
fi
if [ "$CHECK_MODE" = true ] && [ "$WARNED" -gt 0 ]; then
  echo "🚫 --check mode: warnings are fatal."
  exit 1
fi
echo "🏯 OK."
