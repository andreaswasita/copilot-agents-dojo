#!/usr/bin/env bash
# Copilot Agents Dojo — one-command remote bootstrap installer (POSIX/bash).
#
# Drops the dojo into any repo with no clone and no Python. Designed to be run
# straight from the network:
#
#   curl -fsSL https://raw.githubusercontent.com/andreaswasita/copilot-agents-dojo/main/install.sh | bash
#
# ...or with options (note the `-s --` to pass args through a pipe):
#
#   curl -fsSL .../install.sh | bash -s -- --ref v1.0.0 --dir ./my-project
#
# Because it may run from stdin, this script NEVER relies on its own on-disk
# location. It operates only on the downloaded source ($SRC) and the target
# repo ($TARGET).
#
# Flags / env (flags win over env):
#   --ref    <branch|tag|sha>   DOJO_REF   ref to install from   (default: main)
#   --dir    <path>             DOJO_DIR   target repo           (default: $PWD)
#   --source <localpath>        DOJO_SRC   install from a local checkout (skip download)
#   --force                     DOJO_FORCE overwrite colliding non-dojo files without backup
#   --no-verify                 DOJO_NO_VERIFY  skip the post-install spec gate
#   -h | --help                 show usage and exit
set -euo pipefail

REPO_SLUG="andreaswasita/copilot-agents-dojo"

REF="${DOJO_REF:-main}"
TARGET="${DOJO_DIR:-$PWD}"
SRC_LOCAL="${DOJO_SRC:-}"
FORCE="${DOJO_FORCE:-false}"
NO_VERIFY="${DOJO_NO_VERIFY:-false}"

usage() {
  sed -n '2,25p' <<'EOF'

Copilot Agents Dojo — bootstrap installer

  curl -fsSL https://raw.githubusercontent.com/andreaswasita/copilot-agents-dojo/main/install.sh | bash
  curl -fsSL .../install.sh | bash -s -- [options]

Options:
  --ref <branch|tag|sha>   Ref to install from (default: main).
                           Pin to a tag or commit SHA for a reproducible install.
  --dir <path>             Target repo to install into (default: current dir).
  --source <localpath>     Install from a local checkout instead of downloading.
  --force                  Overwrite colliding non-dojo files without backing them up.
  --no-verify              Skip the post-install `verify.sh spec` health check.
  -h, --help               Show this help.
EOF
}

# ── Arg parsing ───────────────────────────────────────────────────────────
while [ $# -gt 0 ]; do
  case "$1" in
    --ref)      REF="${2:?--ref needs a value}"; shift 2 ;;
    --ref=*)    REF="${1#*=}"; shift ;;
    --dir)      TARGET="${2:?--dir needs a value}"; shift 2 ;;
    --dir=*)    TARGET="${1#*=}"; shift ;;
    --source)   SRC_LOCAL="${2:?--source needs a value}"; shift 2 ;;
    --source=*) SRC_LOCAL="${1#*=}"; shift ;;
    --force)    FORCE=true; shift ;;
    --no-verify) NO_VERIFY=true; shift ;;
    -h|--help)  usage; exit 0 ;;
    *) echo "❌ unknown option: $1" >&2; usage >&2; exit 2 ;;
  esac
done

say()  { printf '%s\n' "$*"; }
die()  { printf '❌ %s\n' "$*" >&2; exit 1; }

# ── Validate ref (it goes into a URL) ─────────────────────────────────────
case "$REF" in
  *[!A-Za-z0-9._/-]*) die "invalid --ref '$REF' (allowed: letters, digits, . _ / -)" ;;
esac

command -v tar >/dev/null 2>&1 || die "tar is required but not found on PATH."

mkdir -p "$TARGET" || die "cannot create target dir: $TARGET"
TARGET="$(cd "$TARGET" && pwd)"

TMP=""
cleanup() { [ -n "$TMP" ] && rm -rf "$TMP" 2>/dev/null || true; }
trap cleanup EXIT

say "🏯 Copilot Agents Dojo — bootstrap installer"
say "   target: $TARGET"

# ── Resolve SRC: local checkout or downloaded tarball ─────────────────────
if [ -n "$SRC_LOCAL" ]; then
  SRC="$(cd "$SRC_LOCAL" 2>/dev/null && pwd)" || die "--source path not found: $SRC_LOCAL"
  say "   source: $SRC (local)"
else
  TMP="$(mktemp -d 2>/dev/null || mktemp -d -t dojo)"
  SRC="$TMP/src"
  mkdir -p "$SRC"
  url="https://codeload.github.com/${REPO_SLUG}/tar.gz/${REF}"
  say "   source: $url"
  if command -v curl >/dev/null 2>&1; then
    curl -fsSL "$url" | tar -xz -C "$SRC" --strip-components=1
  elif command -v wget >/dev/null 2>&1; then
    wget -qO- "$url" | tar -xz -C "$SRC" --strip-components=1
  else
    die "need curl or wget to download (or pass --source <localpath>)."
  fi
fi

# ── Validate the source tree before touching the target ───────────────────
for req in skills scripts/init.sh scripts/verify.sh agents/registry.yaml \
           spec/copilot-skills-spec.md skills.md .github/copilot-instructions.md; do
  [ -e "$SRC/$req" ] || die "source is missing '$req' — aborting before any changes."
done

# ── Provenance: prior install manifest + this run's backup dir ────────────
DOJO_DIR_T="$TARGET/.dojo"
PREV_MANIFEST="$DOJO_DIR_T/install-manifest.txt"
mkdir -p "$DOJO_DIR_T"
NEW_MANIFEST="$(mktemp 2>/dev/null || mktemp -t dojo-man)"
STAMP="$(date -u +%Y%m%dT%H%M%SZ 2>/dev/null || echo manual)"
BACKUP_DIR="$DOJO_DIR_T/backups/$STAMP"
BACKED_UP=0
INSTALLED=0

was_ours() {  # arg: relpath — true if a previous dojo install owned this file
  [ -f "$PREV_MANIFEST" ] && grep -Fxq "$1" "$PREV_MANIFEST"
}

# Install one dojo-owned file with collision protection.
install_file() {  # args: src_abs  relpath
  local src="$1" rel="$2" dst="$TARGET/$2"
  if [ -e "$dst" ] && ! was_ours "$rel" && [ "$FORCE" != true ]; then
    mkdir -p "$BACKUP_DIR/$(dirname "$rel")"
    cp -p "$dst" "$BACKUP_DIR/$rel"
    BACKED_UP=$((BACKED_UP + 1))
  fi
  mkdir -p "$(dirname "$dst")"
  cp -p "$src" "$dst"
  printf '%s\n' "$rel" >> "$NEW_MANIFEST"
  INSTALLED=$((INSTALLED + 1))
}

# Install a whole subtree (dojo-owned, overwrite with collision protection).
install_tree() {  # arg: relative dir under SRC
  local d="$1"
  [ -d "$SRC/$d" ] || return 0
  local f rel
  while IFS= read -r f; do
    rel="${f#"$SRC"/}"
    install_file "$f" "$rel"
  done < <(find "$SRC/$d" -type f)
}

# Seed a subtree without ever clobbering existing files (user data).
seed_tree() {  # arg: relative dir under SRC
  local d="$1"
  [ -d "$SRC/$d" ] || return 0
  local f rel dst
  while IFS= read -r f; do
    rel="${f#"$SRC"/}"
    dst="$TARGET/$rel"
    [ -e "$dst" ] && continue
    mkdir -p "$(dirname "$dst")"
    cp -p "$f" "$dst"
  done < <(find "$SRC/$d" -type f)
}

say ""
say "📦 Installing dojo framework…"

# Dojo-owned framework dirs + index (overwrite-on-update, backup-on-collision).
for d in skills optional-skills agents scripts spec template mcp; do
  install_tree "$d"
done
install_file "$SRC/skills.md" "skills.md"

# Committed .dojo config (provenance manifest, delegation knobs, docs).
for f in bundled-manifest.txt delegation.yaml README.md .gitignore; do
  [ -f "$SRC/.dojo/$f" ] && install_file "$SRC/.dojo/$f" ".dojo/$f"
done

# Persistent knowledge vault — seed structure once, never overwrite.
seed_tree "memory"

# Runtime prompt — user-customizable by design ("customize for your stack").
# Seed it once; on later updates never clobber edits — drop a .dojo.md sidecar
# if the shipped version changed so the user can merge intentionally.
CI_REL=".github/copilot-instructions.md"
if [ "$FORCE" = true ] || [ ! -e "$TARGET/$CI_REL" ]; then
  mkdir -p "$TARGET/.github"
  cp -p "$SRC/$CI_REL" "$TARGET/$CI_REL"
  INSTALLED=$((INSTALLED + 1))
elif ! cmp -s "$SRC/$CI_REL" "$TARGET/$CI_REL"; then
  mkdir -p "$TARGET/.github"
  cp -p "$SRC/$CI_REL" "$TARGET/.github/copilot-instructions.dojo.md"
  say "   ⚠️  kept your $CI_REL — new dojo version written to .github/copilot-instructions.dojo.md (merge manually)"
fi

# Commit the new ownership manifest.
sort -u "$NEW_MANIFEST" > "$PREV_MANIFEST"
rm -f "$NEW_MANIFEST"

# ── Scaffold tasks/ (init.sh is no-clobber by design; inline fallback) ────
if command -v bash >/dev/null 2>&1 && [ -f "$TARGET/scripts/init.sh" ]; then
  DOJO_ROOT="$TARGET" bash "$TARGET/scripts/init.sh" >/dev/null 2>&1 || true
fi
if [ ! -f "$TARGET/tasks/todo.md" ]; then
  mkdir -p "$TARGET/tasks"
  cat > "$TARGET/tasks/todo.md" <<'EOF'
# Task Plan

> Write your plan here before starting any non-trivial work.

## Current Task
<!-- Describe the task/goal here -->

## Plan
- [ ] Step 1
- [ ] Step 2
- [ ] Step 3

## Review
<!-- After completion: summarize what was done and verified -->
EOF
fi
[ -f "$TARGET/tasks/lessons.md" ] || cat > "$TARGET/tasks/lessons.md" <<'EOF'
# Lessons Learned

> After every correction, log the lesson here. Review at session start.

## Lesson Log
EOF

say ""
say "✅ Installed $INSTALLED dojo files into $TARGET"
[ "$BACKED_UP" -gt 0 ] && say "   ↩️  backed up $BACKED_UP pre-existing file(s) to ${BACKUP_DIR#"$TARGET"/}"

# ── Post-install health gate (spec mode only — see notes) ─────────────────
# `verify.sh spec` validates the DOJO wiring (skills, personas, scripts, manifest)
# WITHOUT auditing the consumer's own workflows/plan/tests, so a healthy install
# never reports failure just because the host repo isn't fully dojo-compliant yet.
if [ "$NO_VERIFY" != true ] && command -v bash >/dev/null 2>&1 && [ -f "$TARGET/scripts/verify.sh" ]; then
  say ""
  say "🥋 Verifying install (scripts/verify.sh spec)…"
  if DOJO_ROOT="$TARGET" bash "$TARGET/scripts/verify.sh" spec; then
    :
  else
    die "post-install verification failed — see output above (re-run with --no-verify to skip)."
  fi
fi

say ""
say "🏯 Done. Next:"
say "   • Open skills.md and start a Copilot session — agents auto-discover the index."
say "   • Customize .github/copilot-instructions.md for your stack."
say "   • Run 'bash scripts/verify.sh' as your single pre-PR gate."
