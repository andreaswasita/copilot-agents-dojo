<#
.SYNOPSIS
  Copilot Agents Dojo - one-command remote bootstrap installer (Windows / PowerShell).

.DESCRIPTION
  Drops the dojo into any repo with no clone and no Python. Designed to run
  straight from the network:

      irm https://raw.githubusercontent.com/andreaswasita/copilot-agents-dojo/main/install.ps1 | iex

  Because `irm | iex` cannot forward parameters, the piped form is driven by
  environment variables:

      $env:DOJO_REF='v1.0.0'; $env:DOJO_DIR='C:\proj'; irm .../install.ps1 | iex

  When saved to disk it also accepts named parameters:

      ./install.ps1 -Ref v1.0.0 -Dir C:\proj -Source C:\checkout -Force -NoVerify

  Like the bash installer, it never relies on its own on-disk location; it
  operates only on the downloaded source and the target repo.
#>
[CmdletBinding()]
param(
  [string]$Ref,
  [string]$Dir,
  [string]$Source,
  [switch]$Force,
  [switch]$NoVerify
)

$ErrorActionPreference = 'Stop'
$RepoSlug = 'andreaswasita/copilot-agents-dojo'

# Flags win over env vars (so both the piped and saved-file forms work).
if (-not $Ref)    { $Ref    = if ($env:DOJO_REF) { $env:DOJO_REF } else { 'main' } }
if (-not $Dir)    { $Dir    = if ($env:DOJO_DIR) { $env:DOJO_DIR } else { (Get-Location).Path } }
if (-not $Source) { $Source = $env:DOJO_SRC }
if (-not $Force)    { $Force    = [bool]$env:DOJO_FORCE }
if (-not $NoVerify) { $NoVerify = [bool]$env:DOJO_NO_VERIFY }

function Die($msg) { Write-Host "ERROR: $msg" -ForegroundColor Red; exit 1 }

if ($Ref -notmatch '^[A-Za-z0-9._/-]+$') { Die "invalid -Ref '$Ref' (allowed: letters, digits, . _ / -)" }

New-Item -ItemType Directory -Force -Path $Dir | Out-Null
$Target = (Resolve-Path $Dir).Path

Write-Host "Copilot Agents Dojo - bootstrap installer" -ForegroundColor Cyan
Write-Host "   target: $Target"

# -- Resolve source: local checkout or downloaded zip --
$Tmp = $null
try {
  if ($Source) {
    if (-not (Test-Path $Source)) { Die "-Source path not found: $Source" }
    $Src = (Resolve-Path $Source).Path
    Write-Host "   source: $Src (local)"
  } else {
    $Tmp = Join-Path ([System.IO.Path]::GetTempPath()) ("dojo-" + [guid]::NewGuid().ToString('N'))
    New-Item -ItemType Directory -Force -Path $Tmp | Out-Null
    $url = "https://codeload.github.com/$RepoSlug/zip/$Ref"
    $zip = Join-Path $Tmp 'dojo.zip'
    Write-Host "   source: $url"
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest -Uri $url -OutFile $zip -UseBasicParsing
    Expand-Archive -Path $zip -DestinationPath $Tmp -Force
    # GitHub nests everything under a single <repo>-<ref> dir; detect it.
    $top = Get-ChildItem -Path $Tmp -Directory | Select-Object -First 1
    if (-not $top) { Die "download did not extract a source directory." }
    $Src = $top.FullName
  }

  # -- Validate source before touching the target --
  foreach ($req in @('skills','scripts/init.sh','scripts/verify.sh','agents/registry.yaml',
                     'spec/copilot-skills-spec.md','skills.md','.github/copilot-instructions.md')) {
    if (-not (Test-Path (Join-Path $Src $req))) { Die "source is missing '$req' - aborting before any changes." }
  }

  # -- Provenance: prior manifest + this run's backup dir --
  $DojoDir      = Join-Path $Target '.dojo'
  $PrevManifest = Join-Path $DojoDir 'install-manifest.txt'
  New-Item -ItemType Directory -Force -Path $DojoDir | Out-Null
  $prevOwned = @{}
  if (Test-Path $PrevManifest) {
    foreach ($l in Get-Content $PrevManifest) { if ($l) { $prevOwned[$l] = $true } }
  }
  $stamp     = (Get-Date).ToUniversalTime().ToString('yyyyMMddTHHmmssZ')
  $backupDir = Join-Path (Join-Path $DojoDir 'backups') $stamp
  $newOwned  = New-Object System.Collections.Generic.List[string]
  $script:BackedUp  = 0
  $script:Installed = 0

  function Install-File($srcAbs, $rel) {
    $dst = Join-Path $Target $rel
    if ((Test-Path $dst) -and (-not $prevOwned.ContainsKey($rel)) -and (-not $Force)) {
      $b = Join-Path $backupDir $rel
      New-Item -ItemType Directory -Force -Path (Split-Path $b) | Out-Null
      Copy-Item $dst $b -Force
      $script:BackedUp++
    }
    New-Item -ItemType Directory -Force -Path (Split-Path $dst) | Out-Null
    Copy-Item $srcAbs $dst -Force
    $newOwned.Add($rel) | Out-Null
    $script:Installed++
  }

  function Install-Tree($d) {
    $root = Join-Path $Src $d
    if (-not (Test-Path $root)) { return }
    Get-ChildItem -Path $root -Recurse -File | ForEach-Object {
      $rel = $_.FullName.Substring($Src.Length + 1) -replace '\\','/'
      Install-File $_.FullName $rel
    }
  }

  function Seed-Tree($d) {   # no-clobber seed for user data (memory/)
    $root = Join-Path $Src $d
    if (-not (Test-Path $root)) { return }
    Get-ChildItem -Path $root -Recurse -File | ForEach-Object {
      $rel = $_.FullName.Substring($Src.Length + 1) -replace '\\','/'
      $dst = Join-Path $Target $rel
      if (-not (Test-Path $dst)) {
        New-Item -ItemType Directory -Force -Path (Split-Path $dst) | Out-Null
        Copy-Item $_.FullName $dst -Force
      }
    }
  }

  Write-Host ""
  Write-Host "Installing dojo framework..." -ForegroundColor Cyan

  foreach ($d in @('skills','optional-skills','agents','scripts','spec','template','mcp')) { Install-Tree $d }
  Install-File (Join-Path $Src 'skills.md') 'skills.md'

  foreach ($f in @('bundled-manifest.txt','delegation.yaml','README.md','.gitignore')) {
    $p = Join-Path $Src ".dojo/$f"
    if (Test-Path $p) { Install-File $p ".dojo/$f" }
  }

  Seed-Tree 'memory'

  $ciRel = '.github/copilot-instructions.md'
  $ciDst = Join-Path $Target $ciRel
  $ciSrc = Join-Path $Src $ciRel
  if ($Force -or -not (Test-Path $ciDst)) {
    New-Item -ItemType Directory -Force -Path (Join-Path $Target '.github') | Out-Null
    Copy-Item $ciSrc $ciDst -Force
    $script:Installed++
  } elseif ((Get-FileHash $ciSrc).Hash -ne (Get-FileHash $ciDst).Hash) {
    New-Item -ItemType Directory -Force -Path (Join-Path $Target '.github') | Out-Null
    Copy-Item $ciSrc (Join-Path $Target '.github/copilot-instructions.dojo.md') -Force
    Write-Host "   WARNING: kept your $ciRel - new dojo version written to .github/copilot-instructions.dojo.md (merge manually)" -ForegroundColor Yellow
  }

  $newOwned | Sort-Object -Unique | Set-Content -Path $PrevManifest -Encoding UTF8

  # -- Scaffold tasks/ (no-clobber) --
  $tasks = Join-Path $Target 'tasks'
  New-Item -ItemType Directory -Force -Path $tasks | Out-Null
  $todo = Join-Path $tasks 'todo.md'
  if (-not (Test-Path $todo)) {
@'
# Task Plan

> Write your plan here before starting any non-trivial work.

## Current Task
<!-- Describe the task/goal here -->

## Plan
- [ ] Step 1
- [ ] Step 2
- [ ] Step 3

## Review
<!-- After completion: summarize what was done and verified -->
'@ | Set-Content -Path $todo -Encoding UTF8
  }
  $lessons = Join-Path $tasks 'lessons.md'
  if (-not (Test-Path $lessons)) {
@'
# Lessons Learned

> After every correction, log the lesson here. Review at session start.

## Lesson Log
'@ | Set-Content -Path $lessons -Encoding UTF8
  }

  Write-Host ""
  Write-Host "OK: Installed $script:Installed dojo files into $Target" -ForegroundColor Green
  if ($script:BackedUp -gt 0) {
    Write-Host "   backed up $script:BackedUp pre-existing file(s) to .dojo/backups/$stamp"
  }

  # -- Post-install health gate (spec mode - via git-bash) --
  if (-not $NoVerify) {
    # Prefer a real Git-for-Windows bash. Note: Get-Command may resolve the
    # WSL launcher at System32\bash.exe, which errors with "Class not
    # registered" when WSL is absent - so look for git-bash explicitly first
    # and ignore the System32 stub.
    $cands = @("$env:ProgramFiles\Git\bin\bash.exe","${env:ProgramFiles(x86)}\Git\bin\bash.exe","$env:LOCALAPPDATA\Programs\Git\bin\bash.exe")
    $bash = $cands | Where-Object { Test-Path $_ } | Select-Object -First 1
    if (-not $bash) {
      $found = (Get-Command bash -ErrorAction SilentlyContinue).Source
      if ($found -and ($found -notlike "$env:WINDIR\System32\*") -and ($found -notlike "$env:WINDIR\Sysnative\*")) { $bash = $found }
    }
    if ($bash) {
      Write-Host ""
      Write-Host "Verifying install (scripts/verify.sh spec)..." -ForegroundColor Cyan
      $env:DOJO_ROOT = $Target
      & $bash "$Target/scripts/verify.sh" spec
      $code = $LASTEXITCODE
      Remove-Item Env:\DOJO_ROOT -ErrorAction SilentlyContinue
      if ($code -ne 0) { Die "post-install verification failed - see output above (re-run with -NoVerify to skip)." }
    } else {
      Write-Host "   WARNING: git-bash not found - skipping spec gate. Install Git for Windows to run scripts/verify.sh." -ForegroundColor Yellow
    }
  }

  Write-Host ""
  Write-Host "Done. Next:" -ForegroundColor Cyan
  Write-Host "   - Open skills.md and start a Copilot session - agents auto-discover the index."
  Write-Host "   - Customize .github/copilot-instructions.md for your stack."
  Write-Host "   - Run 'bash scripts/verify.sh' as your single pre-PR gate."
}
finally {
  if ($Tmp -and (Test-Path $Tmp)) { Remove-Item -Recurse -Force $Tmp -ErrorAction SilentlyContinue }
}
