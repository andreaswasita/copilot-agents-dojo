# Copilot Agents Dojo — Regenerate slash-command prompt shims (Windows wrapper)
#
# Delegates to scripts/regen-prompts.sh via git-bash, the same way
# scripts/regen-skills-index.ps1 does. Keeps Windows contributors at parity
# with CI (and guarantees byte-identical output — there is one generator).
#
# Usage:
#   pwsh scripts/regen-prompts.ps1            # write .github/prompts/*.prompt.md
#   pwsh scripts/regen-prompts.ps1 -Check     # exit 1 if drift exists
#   pwsh scripts/regen-prompts.ps1 -Stdout    # list the shims that would exist

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
    $bashArgs = @('scripts/regen-prompts.sh')
    if ($Check)  { $bashArgs += '--check' }
    if ($Stdout) { $bashArgs += '--stdout' }
    & $bash @bashArgs
    exit $LASTEXITCODE
}
finally {
    Pop-Location
}
