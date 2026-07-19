# Copilot Agents Dojo — Regenerate skills.md (Windows wrapper)
#
# Delegates to scripts/regen-skills-index.sh via git-bash, the same way
# scripts/run-checks.ps1 does. Keeps Windows contributors at parity with CI.
#
# Usage:
#   pwsh scripts/regen-skills-index.ps1            # write skills.md
#   pwsh scripts/regen-skills-index.ps1 -Check     # exit 1 if drift exists
#   pwsh scripts/regen-skills-index.ps1 -Stdout    # print to stdout

[CmdletBinding()]
param(
    [switch]$Check,
    [switch]$Stdout
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
    $args = @('scripts/regen-skills-index.sh')
    if ($Check)  { $args += '--check' }
    if ($Stdout) { $args += '--stdout' }
    & $bash @args
    exit $LASTEXITCODE
}
finally {
    Pop-Location
}
