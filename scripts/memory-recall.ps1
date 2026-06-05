# Copilot Agents Dojo — Memory Recall (Windows wrapper)
#
# Surfaces prior decisions, patterns, and recent sessions relevant to a planning
# topic. Call BEFORE writing a plan so past knowledge compounds.
#
# Thin wrapper around scripts/memory_recall.py (the single source of recall
# logic, shared with the .sh mirror) to avoid three-way logic drift.
#
# Usage:
#   pwsh scripts/memory-recall.ps1 -Topic "postgres migration" -Language typescript
#   pwsh scripts/memory-recall.ps1          # active decisions + recent context
#
# Honors $env:DOJO_ROOT (defaults to the repo root inferred from this script).

[CmdletBinding()]
param(
    [string]$Topic = '',
    [string]$Language,
    [string]$FileType,
    [int]$Limit = 10
)

$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$dojoRoot  = if ($env:DOJO_ROOT) { $env:DOJO_ROOT } else { Split-Path -Parent $scriptDir }
$env:DOJO_ROOT = $dojoRoot

$python = @('python3', 'python') |
    ForEach-Object { Get-Command $_ -ErrorAction SilentlyContinue } |
    Select-Object -First 1

if (-not $python) {
    Write-Error "Python not found. Install Python 3: https://www.python.org/downloads/"
    exit 2
}

$pyArgs = @("$scriptDir\memory_recall.py", '--topic', $Topic)
if ($Language) { $pyArgs += @('--language', $Language) }
if ($FileType) { $pyArgs += @('--file-type', $FileType) }
$pyArgs += @('--limit', "$Limit")

& $python.Source @pyArgs
exit $LASTEXITCODE
