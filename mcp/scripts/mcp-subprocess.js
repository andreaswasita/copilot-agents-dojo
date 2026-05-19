#!/usr/bin/env node
// mcp/scripts/mcp-subprocess.js — Generalized MCP-server subprocess helper.
// Spawn any stdio MCP server, send `initialize` + `tools/call`, return content.
// Adapted and generalized from csa-sherpa's MSX subprocess pattern (v3.48.0).
//
// Usage as CLI:
//   node mcp-subprocess.js call <bin> <toolName> [paramsJSON] [--timeout=60000]
//   node mcp-subprocess.js list <bin>
//   node mcp-subprocess.js auth <bin> [authToolName=auth_status]
//
// Usage as module:
//   const { callTool, listTools } = require("./mcp-subprocess.js");
//   const out = await callTool("/path/to/server.js", "search", { q: "x" });

const { spawn } = require("child_process");

const INIT = JSON.stringify({
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "dojo-mcp-subprocess", version: "1.0.0" },
  },
});

function rpcRequest(rawBin, msg, { timeout = 60000 } = {}) {
  return new Promise((resolve, reject) => {
    // Allow `bin` to be either a path to an .mjs/.js or a `command args` string
    let cmd, args;
    if (rawBin.endsWith(".js") || rawBin.endsWith(".mjs")) {
      cmd = "node";
      args = [rawBin];
    } else {
      const parts = rawBin.split(" ");
      cmd = parts[0];
      args = parts.slice(1);
    }

    const proc = spawn(cmd, args, { stdio: ["pipe", "pipe", "pipe"], shell: process.platform === "win32" });
    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (d) => (stdout += d.toString()));
    proc.stderr.on("data", (d) => (stderr += d.toString()));

    const t = setTimeout(() => {
      proc.kill();
      reject(new Error(`MCP subprocess timed out after ${timeout}ms`));
    }, timeout);

    proc.on("close", (code) => {
      clearTimeout(t);
      const lines = stdout.split("\n").filter((l) => l.includes('"id":2'));
      if (!lines.length) {
        return reject(new Error(`No id:2 response (exit=${code}, stderr=${stderr.slice(0, 400)})`));
      }
      try {
        const resp = JSON.parse(lines[0]);
        if (resp.error) return reject(new Error(`MCP error: ${resp.error.message || JSON.stringify(resp.error)}`));
        resolve(resp.result);
      } catch (e) {
        reject(new Error(`Parse error: ${e.message}`));
      }
    });

    proc.on("error", (e) => {
      clearTimeout(t);
      reject(new Error(`Spawn failed: ${e.message}`));
    });

    proc.stdin.write(INIT + "\n");
    proc.stdin.write(msg + "\n");
    proc.stdin.end();
  });
}

function callTool(bin, tool, args = {}, opts = {}) {
  const msg = JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: { name: tool, arguments: args },
  });
  return rpcRequest(bin, msg, opts);
}

function listTools(bin, opts = {}) {
  const msg = JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} });
  return rpcRequest(bin, msg, opts);
}

function extractText(result) {
  if (!result || !result.content) return "";
  return result.content.filter((c) => c.type === "text").map((c) => c.text).join("\n");
}

async function main() {
  const [, , cmd, bin, ...rest] = process.argv;
  if (!cmd || cmd === "help" || cmd === "--help" || cmd === "-h") {
    console.log(`Usage:
  mcp-subprocess.js call <bin> <toolName> [paramsJSON]
  mcp-subprocess.js list <bin>
  mcp-subprocess.js auth <bin> [authToolName]
<bin> is either an absolute path to an .js/.mjs entry, or a "command args" string.`);
    process.exit(0);
  }
  if (!bin) {
    console.error("Missing <bin>");
    process.exit(1);
  }
  try {
    if (cmd === "list") {
      const r = await listTools(bin);
      (r.tools || []).forEach((t) => console.log(`  ${t.name} — ${(t.description || "").slice(0, 80)}`));
      console.log(`\n${(r.tools || []).length} tools`);
    } else if (cmd === "call") {
      const tool = rest[0];
      const params = rest[1] ? JSON.parse(rest[1]) : {};
      const r = await callTool(bin, tool, params);
      console.log(extractText(r));
      process.stderr.write(JSON.stringify(r) + "\n");
    } else if (cmd === "auth") {
      const tool = rest[0] || "auth_status";
      const r = await callTool(bin, tool, {});
      console.log(extractText(r));
    } else {
      console.error(`Unknown command: ${cmd}`);
      process.exit(1);
    }
  } catch (e) {
    console.error(`❌ ${e.message}`);
    process.exit(1);
  }
}

module.exports = { callTool, listTools, extractText };
if (require.main === module) main();
