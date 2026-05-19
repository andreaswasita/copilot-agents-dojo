#!/usr/bin/env pwsh
# Copilot Agents Dojo — Verification Gate (PowerShell parity for verify.sh)
#
# Windows-first contributors run this instead of verify.sh.
# Mirrors the same modes, hermetic env, and exit codes.
#
# Usage:
#   pwsh scripts/run-checks.ps1                  # full gate
#   pwsh scripts/run-checks.ps1 spec             # only spec/frontmatter invariants
#   pwsh scripts/run-checks.ps1 tests            # only the pytest smoke tests
#   pwsh scripts/run-checks.ps1 plan             # only the tasks/todo.md check
#   pwsh scripts/run-checks.ps1 actions          # only the Action SHA-pin audit
#   pwsh scripts/run-checks.ps1 -Check           # CI mode: warnings are fatal

[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [ValidateSet('all', 'spec', 'tests', 'plan', 'actions')]
    [string]$Mode = 'all',

    [switch]$Check
)

$ErrorActionPreference = 'Stop'

# --- Hermetic env ---------------------------------------------------------
$env:TZ      = 'UTC'
$env:LANG    = 'C.UTF-8'
$env:LC_ALL  = 'C.UTF-8'
foreach ($k in 'GITHUB_TOKEN','GH_TOKEN','OPENAI_API_KEY','ANTHROPIC_API_KEY',
               'AZURE_OPENAI_API_KEY','GOOGLE_API_KEY','GEMINI_API_KEY',
               'HUGGINGFACE_TOKEN','COPILOT_TOKEN') {
    Remove-Item "env:$k" -ErrorAction SilentlyContinue
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$dojoRoot  = if ($env:DOJO_ROOT) { $env:DOJO_ROOT } else { Split-Path -Parent $scriptDir }
Set-Location $dojoRoot

$script:Passed = 0
$script:Failed = 0
$script:Warned = 0

function Pass([string]$m) { Write-Host "  ✅ $m"; $script:Passed++ }
function Fail([string]$m) { Write-Host "  ❌ $m"; $script:Failed++ }
function Warn([string]$m) { Write-Host "  ⚠️  $m"; $script:Warned++ }

Write-Host "🥋 Copilot Agents Dojo — Verification (mode=$Mode, root=$dojoRoot)"
Write-Host ""

# Helpers ------------------------------------------------------------------

function Get-Frontmatter([string]$path) {
    $lines = Get-Content $path
    $start = ($lines | Select-String -Pattern '^---$' | Select-Object -First 1).LineNumber
    $end   = ($lines | Select-String -Pattern '^---$' | Select-Object -Skip 1 -First 1).LineNumber
    if (-not $start -or -not $end) { return @{} }
    $fm = @{}
    foreach ($l in $lines[$start..($end - 2)]) {
        if ($l -match '^([a-z_]+):\s*(.*)$') {
            $fm[$Matches[1]] = $Matches[2].Trim('"',"'",' ')
        }
    }
    return $fm
}

function Get-Body([string]$path) {
    $lines  = Get-Content $path
    $fences = ($lines | Select-String -Pattern '^---$').LineNumber
    if ($fences.Count -lt 2) { return $lines }
    return $lines[$fences[1]..($lines.Count - 1)]
}

# Spec checks --------------------------------------------------------------

function Invoke-SpecChecks {
    Write-Host "[spec] Scanning skill frontmatter and bodies…"
    $skillFiles = @(Get-ChildItem -Path skills, optional-skills -Filter SKILL.md -Recurse -ErrorAction SilentlyContinue)
    if (-not $skillFiles) { Warn "No SKILL.md files found"; return }

    $banned   = 'powerful|comprehensive|seamless|advanced|robust|cutting-edge|intelligent|revolutionary'
    $banShell = '\b(cat|sed|awk|find|head|tail)\b'
    $seen     = @{}

    foreach ($f in $skillFiles) {
        $rel = Resolve-Path -Relative $f.FullName
        $fm  = Get-Frontmatter $f.FullName

        foreach ($key in 'name','description','tier','category','created_by','platforms') {
            if (-not $fm.ContainsKey($key)) { Fail "$rel`: missing required frontmatter key '$key'" }
        }

        $desc = $fm['description']
        if ($desc) {
            if ($desc.Length -gt 60)       { Fail "$rel`: description is $($desc.Length) chars (max 60)" }
            if ($desc -notmatch '\.$')     { Fail "$rel`: description must end with a period" }
            if ($desc -imatch $banned)     { Fail "$rel`: description contains a banned marketing word" }
        }

        $folder = Split-Path -Leaf $f.Directory
        if ($fm['name'] -and $fm['name'] -ne $folder) {
            Fail "$rel`: name '$($fm['name'])' does not match folder '$folder'"
        }
        if ($seen.ContainsKey($fm['name'])) { Fail "$rel`: duplicate skill name '$($fm['name'])'" }
        else { $seen[$fm['name']] = $true }

        if ($fm['tier'] -and $fm['tier'] -notin 'core','practical','optional') {
            Fail "$rel`: tier '$($fm['tier'])' must be core|practical|optional"
        }

        $body = Get-Body $f.FullName
        $bodyText = $body -join "`n"
        $prev = -1
        foreach ($section in 'When to Use','Prerequisites','How to Run','Quick Reference','Procedure','Pitfalls','Verification') {
            $hit = $body | Select-String -Pattern "^## $([regex]::Escape($section))\b" | Select-Object -First 1
            if (-not $hit) { Fail "$rel`: missing required section '## $section'"; continue }
            if ($hit.LineNumber -le $prev) { Fail "$rel`: section '## $section' is out of order" }
            $prev = $hit.LineNumber
        }

        if ($bodyText -imatch $banned) { Warn "$rel`: body contains a banned marketing word" }

        $prose = ($body | Where-Object {
            $script:in = $false
        } | ForEach-Object {
            if ($_ -match '^```') { $script:in = -not $script:in; return }
            if (-not $script:in)  { $_ }
        }) -join "`n"
        if ($prose -match $banShell) {
            Warn "$rel`: prose references a bare shell utility (use Copilot tool instead — see spec §3)"
        }
    }

    if (Test-Path skills.md) {
        $fsNames = $skillFiles | ForEach-Object { Split-Path -Leaf $_.Directory } | Sort-Object -Unique
        $idxRaw  = (Get-Content skills.md -Raw)
        $idxNames = [regex]::Matches($idxRaw, '(?:skills|optional-skills)/([a-z0-9-]+)') |
                    ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique
        $diff = Compare-Object $fsNames $idxNames
        if ($diff) { Warn "skills.md drift detected — regenerate via scripts/regen-skills-index.sh" }
        else      { Pass "skills.md matches filesystem" }
    } else {
        Warn "skills.md missing"
    }

    if ($script:Failed -eq 0) { Pass "spec invariants OK" }
}

# Plan checks --------------------------------------------------------------

function Invoke-PlanChecks {
    Write-Host "[plan] Checking tasks/todo.md…"
    if (-not (Test-Path tasks/todo.md)) { Fail "tasks/todo.md not found — run scripts/init.sh"; return }
    $todo = Get-Content tasks/todo.md -Raw
    if ($todo -match '^- \[( |x)\] Step 1$' -and $todo -notmatch '^- \[( |x)\] (?!Step \d)') {
        Warn "tasks/todo.md looks like the default template"
    } else { Pass "tasks/todo.md has a real plan" }
    if (Test-Path tasks/lessons.md) { Pass "tasks/lessons.md exists" }
    else { Warn "tasks/lessons.md missing — run scripts/init.sh" }
}

# Actions audit ------------------------------------------------------------

function Invoke-ActionsChecks {
    Write-Host "[actions] Auditing .github/workflows/ for SHA-pinned uses:…"
    $workflows = @(Get-ChildItem .github/workflows -Filter *.y*ml -ErrorAction SilentlyContinue)
    if (-not $workflows) { Warn "no workflow files found"; return }
    $bad = 0
    foreach ($wf in $workflows) {
        $rel = Resolve-Path -Relative $wf.FullName
        $hits = Select-String -Path $wf.FullName -Pattern '^\s*-?\s*uses:\s*[^@]+@[^\s]+'
        foreach ($h in $hits) {
            if ($h.Line -notmatch '@[0-9a-f]{40}\b') {
                Fail "$rel`:$($h.LineNumber): $($h.Line.Trim())  (pin to 40-char SHA + version comment)"
                $bad++
            }
        }
    }
    if ($bad -eq 0) { Pass "all workflow uses: lines are SHA-pinned" }
}

# Tests --------------------------------------------------------------------

function Invoke-Tests {
    Write-Host "[tests] Running skill smoke tests…"
    $testDirs = @(Get-ChildItem -Path skills, optional-skills -Filter tests -Directory -Recurse -ErrorAction SilentlyContinue)
    if (-not $testDirs) { Warn "no skill tests found — skipping"; return }
    $python = Get-Command python -ErrorAction SilentlyContinue
    if (-not $python) { Warn "python not available — skipping"; return }
    $args = @('-m','pytest','-q','--no-header') + ($testDirs | ForEach-Object { $_.FullName })
    & python @args
    if ($LASTEXITCODE -eq 0) { Pass "skill smoke tests passed" }
    else { Fail "skill smoke tests failed" }
}

# Dispatch -----------------------------------------------------------------

switch ($Mode) {
    'spec'    { Invoke-SpecChecks }
    'plan'    { Invoke-PlanChecks }
    'actions' { Invoke-ActionsChecks }
    'tests'   { Invoke-Tests }
    'all'     { Invoke-SpecChecks; Invoke-PlanChecks; Invoke-ActionsChecks; Invoke-Tests }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host "  Results: ✅ $($script:Passed) passed, ❌ $($script:Failed) failed, ⚠️  $($script:Warned) warnings"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if ($script:Failed -gt 0) { Write-Host "🚫 Verification FAILED."; exit 1 }
if ($Check -and $script:Warned -gt 0) { Write-Host "🚫 -Check mode: warnings are fatal."; exit 1 }
Write-Host "🏯 OK."
