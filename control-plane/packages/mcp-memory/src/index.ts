#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { createStore } from "./store.js";
import { registerTools } from "./tools.js";
import { registerResources } from "./resources.js";

function parseArgs(argv: string[]): { dojoRoot: string } {
  let dojoRoot = process.env.DOJO_ROOT ?? process.cwd();

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--dojo-root") {
      const next = argv[i + 1];
      if (!next) {
        console.error("Error: --dojo-root requires a path argument");
        process.exit(1);
      }
      dojoRoot = next;
      i++;
    } else if (arg.startsWith("--dojo-root=")) {
      dojoRoot = arg.slice("--dojo-root=".length);
    } else if (arg === "--help" || arg === "-h") {
      console.error(
        [
          "dojo-mcp-memory — Model Context Protocol server for the Copilot Agents Dojo memory vault.",
          "",
          "Usage: dojo-mcp-memory [--dojo-root <path>]",
          "",
          "Env vars:",
          "  DOJO_ROOT  Path to the dojo (containing memory/ directory). Defaults to cwd.",
          "",
          "Transports: stdio only.",
        ].join("\n"),
      );
      process.exit(0);
    }
  }

  dojoRoot = resolve(dojoRoot);
  if (!existsSync(dojoRoot)) {
    console.error(`Error: dojo root does not exist: ${dojoRoot}`);
    process.exit(1);
  }
  return { dojoRoot };
}

async function main() {
  const { dojoRoot } = parseArgs(process.argv.slice(2));

  let store;
  try {
    store = createStore(dojoRoot);
  } catch (err) {
    console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }

  const server = new McpServer(
    {
      name: "dojo-mcp-memory",
      version: "0.0.1",
    },
    {
      capabilities: {
        tools: {},
        resources: { listChanged: true },
      },
      instructions: [
        "This server exposes the Copilot Agents Dojo memory vault.",
        "Call `memory_recent_sessions` and `memory_decisions_active` at session start to load context.",
        "Use `memory_patterns_for_context` to fetch patterns relevant to your current file or language.",
        "When you finish meaningful work, call `memory_create` with type='session' to log a summary.",
        "Read `memory://INDEX` for the Map of Content.",
      ].join("\n"),
    },
  );

  registerTools(server, store);
  registerResources(server, store);

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error(`[dojo-mcp-memory] connected over stdio. Dojo root: ${dojoRoot}`);
}

main().catch((err) => {
  console.error("[dojo-mcp-memory] fatal:", err);
  process.exit(1);
});
