# Copilot Agents Dojo — Curator (Windows wrapper)
#
# Delegates to scripts/curator.sh via git-bash. Same verbs:
#   pwsh scripts/curator.ps1 status [<skill>]
#   pwsh scripts/curator.ps1 record <skill>
#   pwsh scripts/curator.ps1 pin <skill>
#   pwsh scripts/curator.ps1 unpin <skill>
#   pwsh scripts/curator.ps1 archive <skill>
#   pwsh scripts/curator.ps1 restore <skill>
#   pwsh scripts/curator.ps1 prune [-DryRun]
#   pwsh scripts/curator.ps1 report

[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [string]$Verb = 'status',

    [Parameter(Position = 1)]
    [string]$Skill,

    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

$bash = @(
    "$env:ProgramFiles\Git\bin\bash.exe",
    "${env:ProgramFiles(x86)}\Git\bin\bash.exe",
    "$env:LOCALAPPDATA\Programs\Git\bin\bash.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1

if (-not $bash) {
    Write-Error "git-bash not found. Install Git for Windows: https://git-scm.com/download/win"
    exit 2
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$dojoRoot  = if ($env:DOJO_ROOT) { $env:DOJO_ROOT } else { Split-Path -Parent $scriptDir }

# Make WinGet shim dir visible to git-bash so `jq` resolves without manual PATH setup.
$wingetLinks = "$env:LOCALAPPDATA\Microsoft\WinGet\Links"
if (Test-Path $wingetLinks) {
    $env:PATH = "$env:PATH;$wingetLinks"
}

Push-Location $dojoRoot
try {
    $bashArgs = @('scripts/curator.sh', $Verb)
    if ($Skill)  { $bashArgs += $Skill }
    if ($DryRun) { $bashArgs += '--dry-run' }
    & $bash @bashArgs
    exit $LASTEXITCODE
}
finally {
    Pop-Location
}
