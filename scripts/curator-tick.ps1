#requires -Version 5.1
# Copilot Agents Dojo — Curator tick (Windows wrapper).
# Forwards to scripts/curator-tick.sh under Git Bash.
param([switch]$Force, [switch]$DryRun)

$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $env:DOJO_ROOT) {
    $env:DOJO_ROOT = (Split-Path -Parent $scriptDir)
}

# Ensure jq is reachable (winget link target)
$wingetLinks = Join-Path $env:LOCALAPPDATA 'Microsoft\WinGet\Links'
if (Test-Path $wingetLinks) {
    $env:PATH = "$wingetLinks;$env:PATH"
}

$bash = "$env:ProgramFiles\Git\bin\bash.exe"
if (-not (Test-Path $bash)) { $bash = "bash" }

$flags = @()
if ($Force)  { $flags += "--force" }
if ($DryRun) { $flags += "--dry-run" }

& $bash "$scriptDir/curator-tick.sh" @flags
exit $LASTEXITCODE
