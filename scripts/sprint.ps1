# Copilot Agents Dojo — Pipeline orchestrator (Windows wrapper)
#
# Delegates to scripts/sprint.sh via git-bash, the same way the other .ps1
# wrappers do. Keeps Windows contributors at parity with CI.
#
# Usage:
#   pwsh scripts/sprint.ps1 steps
#   pwsh scripts/sprint.ps1 start "<goal>" -Swarm -DryRun
#   pwsh scripts/sprint.ps1 gate
#   pwsh scripts/sprint.ps1 finish

[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [string]$Verb = 'steps',

    [Parameter(Position = 1)]
    [string]$Goal,

    [switch]$Swarm,
    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

$bashCandidates = @(
    "$env:ProgramFiles\Git\bin\bash.exe",
    "${env:ProgramFiles(x86)}\Git\bin\bash.exe",
    "$env:LOCALAPPDATA\Programs\Git\bin\bash.exe"
)
$bash = $bashCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $bash) {
    Write-Error "git-bash not found. Install Git for Windows: https://git-scm.com/download/win"
    exit 2
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$dojoRoot  = if ($env:DOJO_ROOT) { $env:DOJO_ROOT } else { Split-Path -Parent $scriptDir }
Push-Location $dojoRoot
try {
    $bashArgs = @('scripts/sprint.sh', $Verb)
    if ($Goal)   { $bashArgs += $Goal }
    if ($Swarm)  { $bashArgs += '--swarm' }
    if ($DryRun) { $bashArgs += '--dry-run' }
    & $bash @bashArgs
    exit $LASTEXITCODE
}
finally {
    Pop-Location
}
