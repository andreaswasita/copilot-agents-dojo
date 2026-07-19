#!/usr/bin/env bash
# Copilot Agents Dojo — Regenerate skills.md from the filesystem.
#
# Scans every skills/*/SKILL.md and optional-skills/*/SKILL.md, reads
# YAML frontmatter (name, description, tier, category), and emits a
# skills.md grouped by tier → category in deterministic alphabetical order.
#
# Run before every PR if you've added/renamed/retired a skill. CI's
# `verify.sh spec` will warn ("skills.md drift detected") until you do.
#
# Usage:
#   bash scripts/regen-skills-index.sh            # write skills.md
#   bash scripts/regen-skills-index.sh --check    # exit 1 if drift exists
#   bash scripts/regen-skills-index.sh --stdout   # print to stdout, don't write

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOJO_ROOT="${DOJO_ROOT:-$(dirname "$SCRIPT_DIR")}"
cd "$DOJO_ROOT"

MODE="write"
for arg in "$@"; do
  case "$arg" in
    --check)  MODE="check" ;;
    --stdout) MODE="stdout" ;;
    -h|--help) sed -n '1,20p' "$0"; exit 0 ;;
    *) echo "unknown arg: $arg" >&2; exit 2 ;;
  esac
done

# --- helpers --------------------------------------------------------------

# Pull a single key from the YAML frontmatter of a SKILL.md.
fm_get() {
  local file="$1" key="$2"
  awk -v key="$key" '
    /^---$/ { c++; next }
    c == 1 && $0 ~ "^"key":" {
      sub("^"key":[[:space:]]*", "")
      sub(/^"/, ""); sub(/"$/, "")
      sub(/^>-[[:space:]]*/, "")
      print
      exit
    }
  ' "$file"
}

# Friendly section title per tier.
tier_title() {
  case "$1" in
    core)      echo "Core Kata — 基本型" ;;
    practical) echo "Practical Kumite — 実践組手" ;;
    optional)  echo "Optional Dō — 拡張道" ;;
    *)         echo "$1" ;;
  esac
}

tier_blurb() {
  case "$1" in
    core)
      echo "Always loaded. Behavioral skills that govern *how* the agent thinks and operates — style-agnostic, language-agnostic." ;;
    practical)
      echo "Loaded on-demand. Task-specific skills that teach the agent *how to do* particular kinds of work." ;;
    optional)
      echo "Loaded only when invoked. Heavyweight or integration-specific skills. Not part of the default skill bundle." ;;
  esac
}

category_icon() {
  case "$1" in
    discipline)    echo "🥋" ;;
    activation)    echo "🥋" ;;
    workflow)      echo "🔄" ;;
    delegation)    echo "🤝" ;;
    review)        echo "🔍" ;;
    quality)       echo "✨" ;;
    debugging)     echo "🐛" ;;
    testing)       echo "🧪" ;;
    onboarding)    echo "📚" ;;
    requirements)  echo "📋" ;;
    integration)   echo "🔌" ;;
    meta)          echo "📐" ;;
    *)             echo "▫️" ;;
  esac
}

# --- collect skills -------------------------------------------------------

TMP=$(mktemp)
trap 'rm -f "$TMP"' EXIT

# Format: tier|category|folder|name|description|path
while IFS= read -r f; do
  [ -z "$f" ] && continue
  name=$(fm_get "$f" name)
  desc=$(fm_get "$f" description)
  tier=$(fm_get "$f" tier)
  cat=$(fm_get  "$f" category)
  folder=$(basename "$(dirname "$f")")
  parent=$(basename "$(dirname "$(dirname "$f")")")
  rel="$parent/$folder/SKILL.md"
  echo "${tier}|${cat}|${folder}|${name}|${desc}|${rel}" >> "$TMP"
done < <(find skills optional-skills -name SKILL.md 2>/dev/null | sort)

# --- render ---------------------------------------------------------------

render() {
  local total
  total=$(wc -l < "$TMP" | tr -d ' ')

  cat <<EOF
# Copilot Agents Dojo — Skills Index

A skills & discipline framework for GitHub Copilot agents. ${total} production skills across three tiers. Mandatory workflow. Self-improving. Built from field-tested patterns — [Anthropic Claude](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering) prompt engineering, [obra/superpowers](https://github.com/obra/superpowers) orchestration, and the [hermes-agent](https://github.com/andreaswasita/hermes-agent) reference build.

> **Auto-generated.** Do not edit by hand — run \`bash scripts/regen-skills-index.sh\` (or \`pwsh scripts/regen-skills-index.ps1\` on Windows).

Skills are self-contained folders of instructions, examples, and resources that Copilot agents load to improve performance on specialized tasks. Each skill has a \`SKILL.md\` with YAML frontmatter and the canonical body sections defined in [\`spec/copilot-skills-spec.md\`](spec/copilot-skills-spec.md).

To create a new skill, start from [\`template/SKILL.md\`](template/SKILL.md) or read [\`optional-skills/writing-skills\`](optional-skills/writing-skills/SKILL.md).

---

## The Mandatory Workflow

Every non-trivial task follows this pipeline:

\`\`\`
BRAINSTORM → WORKTREE → PLAN → EXECUTE → TEST → REVIEW → FINISH → LEARN
\`\`\`

Each arrow is enforced by a flow skill in the *Core* or *Practical* tiers.

---
EOF

  for tier in core practical optional; do
    echo ""
    echo "## $(tier_title "$tier")"
    echo ""
    echo "$(tier_blurb "$tier")"
    echo ""

    # categories within this tier, alphabetical
    local cats
    cats=$(awk -F'|' -v t="$tier" '$1==t{print $2}' "$TMP" | sort -u)
    for cat in $cats; do
      echo "### $(category_icon "$cat") ${cat^}"
      echo ""
      # entries within category, alphabetical by folder
      awk -F'|' -v t="$tier" -v c="$cat" '$1==t && $2==c{print}' "$TMP" \
      | sort -t'|' -k3,3 \
      | while IFS='|' read -r _ _ folder name desc rel; do
          printf -- "- [\`%s\`](%s) — %s\n" "$name" "$rel" "$desc"
        done
      echo ""
    done
  done

  cat <<'EOF'
---

## Core Principles

- **Simplicity First** — Make every change as small as possible. Fewer lines beats more lines.
- **No Laziness** — Find root causes. No temporary fixes. Every shortcut is technical debt.
- **Zero Hand-Holding** — The user provides intent; the agent handles execution. No asking "which file?" or "what command?" — figure it out.
- **Continuous Evolution** — Lessons feed back into skills. Skills get sharper over time.
- **Mandatory Workflow** — The pipeline is not optional. Brainstorm → Plan → Execute → Review → Finish. Every time.

---

## See Also

- [`spec/copilot-skills-spec.md`](spec/copilot-skills-spec.md) — Authoritative SKILL.md spec
- [`AGENTS.md`](AGENTS.md) — Contributor development guide
- [`.github/known-pitfalls.md`](.github/known-pitfalls.md) — Pitfalls register
- [`scripts/verify.sh`](scripts/verify.sh) — Single verification gate
EOF
}

case "$MODE" in
  stdout)
    render
    ;;
  write)
    render > skills.md
    # also write the bundled-skills manifest for the curator's provenance guard
    mkdir -p .dojo
    {
      find skills          -mindepth 2 -maxdepth 2 -name SKILL.md 2>/dev/null \
        | sed -E 's|^skills/||; s|/SKILL.md$||'
      find optional-skills -mindepth 2 -maxdepth 2 -name SKILL.md 2>/dev/null \
        | sed -E 's|^optional-skills/||; s|/SKILL.md$||'
    } | grep -v '^\.archive' | sort -u > .dojo/bundled-manifest.txt
    echo "✅ skills.md regenerated ($(wc -l < "$TMP" | tr -d ' ') skills)"
    echo "✅ .dojo/bundled-manifest.txt regenerated ($(wc -l < .dojo/bundled-manifest.txt | tr -d ' ') entries)"
    ;;
  check)
    new=$(mktemp); trap 'rm -f "$TMP" "$new"' EXIT
    render > "$new"
    if ! diff -q skills.md "$new" >/dev/null 2>&1; then
      echo "❌ skills.md is out of date — run: bash scripts/regen-skills-index.sh" >&2
      diff -u skills.md "$new" || true
      exit 1
    fi
    echo "✅ skills.md is in sync"
    ;;
esac
