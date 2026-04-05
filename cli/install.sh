#!/usr/bin/env bash
# Quick install script for dojo CLI
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🏯 Installing Copilot Agents Dojo CLI..."
echo ""

# Check Python
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo "❌ Python 3.10+ is required. Install it first."
    exit 1
fi

PYTHON=$(command -v python3 || command -v python)
echo "Using Python: $PYTHON"

# Install in editable mode
cd "$SCRIPT_DIR"
$PYTHON -m pip install -e . --quiet

echo ""
echo "✅ Installed! Run 'dojo' to start the skill marketplace."
echo ""
echo "Quick commands:"
echo "  dojo              # Interactive marketplace"
echo "  dojo skills       # List all skills"
echo "  dojo select       # Pick skills for your project"
echo "  dojo install .    # Install to current directory"
