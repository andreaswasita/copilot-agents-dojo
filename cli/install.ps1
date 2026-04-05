# Quick install script for dojo CLI (Windows)

Write-Host "🏯 Installing Copilot Agents Dojo CLI..." -ForegroundColor Cyan
Write-Host ""

# Check Python
$python = Get-Command python -ErrorAction SilentlyContinue
if (-not $python) {
    Write-Host "❌ Python 3.10+ is required. Install it first." -ForegroundColor Red
    exit 1
}

Write-Host "Using Python: $($python.Source)"

# Install in editable mode
Push-Location $PSScriptRoot
python -m pip install -e . --quiet
Pop-Location

Write-Host ""
Write-Host "✅ Installed! Run 'dojo' to start the skill marketplace." -ForegroundColor Green
Write-Host ""
Write-Host "Quick commands:"
Write-Host "  dojo              # Interactive marketplace"
Write-Host "  dojo skills       # List all skills"
Write-Host "  dojo select       # Pick skills for your project"
Write-Host "  dojo install .    # Install to current directory"
