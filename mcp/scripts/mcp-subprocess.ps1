# mcp/scripts/mcp-subprocess.ps1 — PowerShell helper for any stdio MCP server.
# Speaks JSON-RPC over stdio. Adapted from csa-sherpa's MSX subprocess pattern.
#
# Usage:
#   . .\mcp-subprocess.ps1
#   Invoke-McpTool -Bin "C:\path\server\index.js" -Tool "get_my_deals" -Params @{limit=10}
#   Get-McpTools  -Bin "C:\path\server\index.js"
#   Test-McpAuth  -Bin "C:\path\server\index.js" -AuthTool "auth_status"

$script:InitMsg = '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"dojo-mcp-subprocess","version":"1.0.0"}}}'

function Invoke-McpRpc {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$Bin,
        [Parameter(Mandatory)][string]$Message,
        [int]$TimeoutSec = 60
    )

    if (-not (Test-Path $Bin)) {
        throw "MCP server binary not found: $Bin"
    }

    $payload = "$($script:InitMsg)`n$Message`n"
    try {
        $result = $payload | node $Bin 2>$null
        $line = ($result -split "`n" | Where-Object { $_ -match '"id":2' }) | Select-Object -First 1
        if (-not $line) { throw "No id:2 response from MCP subprocess" }
        $response = $line | ConvertFrom-Json
        if ($response.error) { throw "MCP error: $($response.error.message)" }
        return $response.result
    } catch {
        throw "MCP subprocess call failed: $_"
    }
}

function Invoke-McpTool {
    <#
    .SYNOPSIS
        Call a tool on any stdio MCP server.
    .PARAMETER Bin
        Absolute path to the server's .js entry point.
    .PARAMETER Tool
        Tool name (e.g., search_repositories).
    .PARAMETER Params
        Hashtable of arguments.
    .PARAMETER Raw
        Return the full result object instead of extracted text.
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$Bin,
        [Parameter(Mandatory)][string]$Tool,
        [hashtable]$Params = @{},
        [switch]$Raw,
        [int]$TimeoutSec = 60
    )

    $msg = @{
        jsonrpc = "2.0"; id = 2; method = "tools/call"
        params = @{ name = $Tool; arguments = $Params }
    } | ConvertTo-Json -Depth 6 -Compress

    $result = Invoke-McpRpc -Bin $Bin -Message $msg -TimeoutSec $TimeoutSec
    if ($Raw) { return $result }

    $text = ($result.content | Where-Object { $_.type -eq 'text' } | ForEach-Object { $_.text }) -join "`n"
    return $text
}

function Get-McpTools {
    <#
    .SYNOPSIS
        List tools advertised by a stdio MCP server.
    #>
    [CmdletBinding()]
    param([Parameter(Mandatory)][string]$Bin)
    $msg = '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'
    $r = Invoke-McpRpc -Bin $Bin -Message $msg
    return $r.tools
}

function Test-McpAuth {
    <#
    .SYNOPSIS
        Call a server's auth/health tool. Returns the text response (or $null on error).
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$Bin,
        [string]$AuthTool = "auth_status"
    )
    try { return Invoke-McpTool -Bin $Bin -Tool $AuthTool -Params @{} }
    catch { Write-Warning $_; return $null }
}

Write-Host "MCP subprocess helpers loaded. Commands: Invoke-McpTool, Get-McpTools, Test-McpAuth" -ForegroundColor Cyan
