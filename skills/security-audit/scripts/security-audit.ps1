# Copilot Agents Dojo — Security Audit (Windows wrapper)
#
# Heuristic security scanner. Thin pass-through wrapper around security_audit.py
# (the single source of scan logic, shared with the .sh mirror). All arguments
# are forwarded unchanged so flag semantics live only in Python.
#
# Usage:
#   pwsh skills/security-audit/scripts/security-audit.ps1 . --format md --suggest
#   pwsh skills/security-audit/scripts/security-audit.ps1 src --fail-on medium
#
# Exit codes: 0 = clean (below --fail-on), 1 = findings at/above it, 2 = usage.

[CmdletBinding()]
param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$Args
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

$pyArgs = @("$scriptDir\security_audit.py")
if ($Args) { $pyArgs += $Args }

& $python.Source @pyArgs
exit $LASTEXITCODE
