#!/usr/bin/env bash
# Copilot Agents Dojo — Migration helper for upgrading a pre-v1 repo to v1.0.
#
# Idempotent. Safe to re-run. Reports what it would do before mutating.
# Usage:
#   bash scripts/migrate-v1.sh            # interactive — prompts before each step
#   bash scripts/migrate-v1.sh --yes      # apply all changes without prompting
#   bash scripts/migrate-v1.sh --dry-run  # report only, mutate nothing

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOJO_ROOT="${DOJO_ROOT:-$(dirname "$SCRIPT_DIR")}"
cd "$DOJO_ROOT"

YES=0
DRY=0
for arg in "$@"; do
  case "$arg" in
    --yes|-y) YES=1 ;;
    --dry-run|-n) DRY=1 ;;
    -h|--help)
      sed -n '1,12p' "$0"
      exit 0
      ;;
    *) echo "Unknown flag: $arg" >&2; exit 2 ;;
  esac
done

step() { printf '\n[migrate-v1] %s\n' "$*"; }
do_or_say() {
  local msg="$1"; shift
  if [ "$DRY" -eq 1 ]; then
    echo "  (dry-run) $msg"
    return 0
  fi
  if [ "$YES" -ne 1 ]; then
    printf '  apply: %s [y/N] ' "$msg"
    read -r answer
    case "$answer" in y|Y|yes) ;; *) echo "  skipped"; return 0 ;; esac
  fi
  "$@"
}

# ── 1. Retire skill-creator (folded into writing-skills) ─────────────────
if [ -d "skills/skill-creator" ]; then
  step "Retire skills/skill-creator → skills/.archive/skill-creator"
  do_or_say "move skill-creator into archive" \
    bash -c 'mkdir -p skills/.archive && git mv skills/skill-creator skills/.archive/skill-creator 2>/dev/null || mv skills/skill-creator skills/.archive/skill-creator'
fi

# ── 2. Relocate writing-skills to optional-skills/ ───────────────────────
if [ -d "skills/writing-skills" ] && [ ! -d "optional-skills/writing-skills" ]; then
  step "Relocate skills/writing-skills → optional-skills/writing-skills"
  do_or_say "move writing-skills to optional tier" \
    bash -c 'mkdir -p optional-skills && git mv skills/writing-skills optional-skills/writing-skills 2>/dev/null || mv skills/writing-skills optional-skills/writing-skills'
fi

# ── 3. Add tier: frontmatter to any SKILL.md missing it ─────────────────
step "Scan SKILL.md files for missing tier: frontmatter"
missing_tier=()
while IFS= read -r f; do
  if ! awk 'BEGIN{fm=0} /^---[[:space:]]*$/ {fm++; if(fm==2) exit} fm==1 && /^tier:/ {found=1; exit} END{exit !found}' "$f"; then
    missing_tier+=("$f")
  fi
done < <(find skills optional-skills -name SKILL.md -not -path '*/.archive/*' 2>/dev/null)

if [ "${#missing_tier[@]}" -gt 0 ]; then
  echo "  The following SKILL.md files lack a tier: field — edit by hand:"
  for f in "${missing_tier[@]}"; do echo "    - $f"; done
  echo "  (core | practical | optional). See spec/copilot-skills-spec.md §1."
else
  echo "  ✅ All SKILL.md files have tier: frontmatter"
fi

# ── 4. Bootstrap .dojo/ telemetry sidecar ───────────────────────────────
if [ ! -d ".dojo" ]; then
  step "Create .dojo/ telemetry sidecar (gitignored)"
  do_or_say "create .dojo/ + skill-usage.json" \
    bash -c 'mkdir -p .dojo && printf "{}\n" > .dojo/skill-usage.json && printf "*\n!.gitignore\n!README.md\n" > .dojo/.gitignore && printf "# .dojo — local telemetry\n\nGitignored sidecar for skill-usage telemetry and per-clone state.\n" > .dojo/README.md'
fi

# ── 5. Bootstrap tasks/board/ if missing ────────────────────────────────
if [ ! -d "tasks/board" ]; then
  step "Create tasks/board/ for durable work"
  do_or_say "scaffold tasks/board with README + template" \
    bash -c 'mkdir -p tasks/board && printf "# Task board\n\nDurable per-task files. Use scripts/board.sh.\n" > tasks/board/README.md'
fi

# ── 6. Regenerate skills.md ──────────────────────────────────────────────
if [ -x "scripts/regen-skills-index.sh" ] || [ -f "scripts/regen-skills-index.sh" ]; then
  step "Regenerate skills.md from filesystem"
  do_or_say "run scripts/regen-skills-index.sh" \
    bash scripts/regen-skills-index.sh
fi

# ── 7. Run the gate ──────────────────────────────────────────────────────
step "Run the spec gate"
if [ "$DRY" -eq 1 ]; then
  echo "  (dry-run) would run: bash scripts/verify.sh spec"
else
  if bash scripts/verify.sh spec; then
    echo "  ✅ Migration complete and gate is green."
  else
    echo "  ⚠️  Gate failed — review the output above and fix before committing."
    exit 1
  fi
fi
