#!/usr/bin/env bash
# Copilot Agents Dojo — Initialization Script
# Scaffolds the tasks/ directory with todo.md and lessons.md templates.
# Run this after cloning the repo or when starting a fresh project.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOJO_ROOT="${DOJO_ROOT:-$(dirname "$SCRIPT_DIR")}"
TASKS_DIR="$DOJO_ROOT/tasks"

echo "🥋 Copilot Agents Dojo — Initializing..."

# Create tasks directory if missing
if [ ! -d "$TASKS_DIR" ]; then
  mkdir -p "$TASKS_DIR"
  echo "  ✅ Created tasks/ directory"
else
  echo "  ℹ️  tasks/ directory already exists"
fi

# Create todo.md if missing
if [ ! -f "$TASKS_DIR/todo.md" ]; then
  cat > "$TASKS_DIR/todo.md" << 'EOF'
# Task Plan

> Write your plan here before starting any non-trivial work.
> Mark items complete as you go. Add a review section when done.

## Current Task
<!-- Describe the task/goal here -->

## Plan
- [ ] Step 1
- [ ] Step 2
- [ ] Step 3

## Review
<!-- After completion: summarize what was done, what was verified, any open items -->
EOF
  echo "  ✅ Created tasks/todo.md"
else
  echo "  ℹ️  tasks/todo.md already exists — skipping"
fi

# Create lessons.md if missing
if [ ! -f "$TASKS_DIR/lessons.md" ]; then
  cat > "$TASKS_DIR/lessons.md" << 'EOF'
# Lessons Learned

> This file is the agent's memory. After every correction, log the lesson here.
> Review this file at the start of every session.
> If a pattern appears 3+ times, propose a rule update to `skills.md`.

## Lesson Log

## Metrics

| Metric | Value |
|--------|-------|
| Total lessons logged | 0 |
| Patterns amended to skills | 0 |
| Recurring patterns (3+) | 0 |
| Sessions since last new lesson | 0 |
EOF
  echo "  ✅ Created tasks/lessons.md"
else
  echo "  ℹ️  tasks/lessons.md already exists — skipping"
fi

echo ""
echo "🏯 Dojo initialized. Your agents are ready to train."
echo "   Next: open skills.md and start your first session."
