# Copilot Agents Dojo — Safety Guard (Windows wrapper)
#
# Heuristic preflight lint. Thin wrapper around safety_guard.py (the single
# source of guard logic, shared with the .sh mirror) to avoid logic drift.
#
# Usage:
#   pwsh scripts/safety-guard.ps1 command "rm -rf /"
#   pwsh scripts/safety-guard.ps1 tree --require-clean
#
# Exit codes: 0 = no concern, 1 = flagged (stop and confirm), 2 = usage error.

[CmdletBinding()]
param(
    [Parameter(Position = 0, Mandatory = $true)]
    [string]$Mode,

    [Parameter(Position = 1, ValueFromRemainingArguments = $true)]
    [string[]]$Rest
)

$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

$python = @('python3', 'python') |
    ForEach-Object { Get-Command $_ -ErrorAction SilentlyContinue } |
    Select-Object -First 1

if (-not $python) {
    Write-Error "Python not found. Install Python 3: https://www.python.org/downloads/"
    exit 2
}

$pyArgs = @("$scriptDir\safety_guard.py", $Mode)
if ($Rest) { $pyArgs += $Rest }

& $python.Source @pyArgs
exit $LASTEXITCODE
