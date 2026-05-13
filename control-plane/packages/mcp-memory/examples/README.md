# Example MCP Client Configurations

The Dojo memory MCP server runs over **stdio** and works with any MCP-capable agent.

Replace `/absolute/path/to/copilot-agents-dojo` with your actual dojo root.

When the Control Plane installs the memory vault into a target project with **Wire MCP** enabled, the corresponding config file is written automatically.

---

## Claude Code — `.mcp.json` (project root)

```json
{
  "mcpServers": {
    "dojo-memory": {
      "command": "node",
      "args": [
        "/absolute/path/to/copilot-agents-dojo/control-plane/packages/mcp-memory/dist/index.js",
        "--dojo-root",
        "/absolute/path/to/copilot-agents-dojo"
      ]
    }
  }
}
```

## Copilot CLI — `~/.copilot/mcp.json`

```json
{
  "servers": {
    "dojo-memory": {
      "command": "node",
      "args": [
        "/absolute/path/to/copilot-agents-dojo/control-plane/packages/mcp-memory/dist/index.js",
        "--dojo-root",
        "/absolute/path/to/copilot-agents-dojo"
      ]
    }
  }
}
```

## Cursor — `.cursor/mcp.json` (project root)

```json
{
  "mcpServers": {
    "dojo-memory": {
      "command": "node",
      "args": [
        "/absolute/path/to/copilot-agents-dojo/control-plane/packages/mcp-memory/dist/index.js",
        "--dojo-root",
        "/absolute/path/to/copilot-agents-dojo"
      ]
    }
  }
}
```

## VS Code — `.vscode/mcp.json` (project root)

```json
{
  "servers": {
    "dojo-memory": {
      "type": "stdio",
      "command": "node",
      "args": [
        "/absolute/path/to/copilot-agents-dojo/control-plane/packages/mcp-memory/dist/index.js",
        "--dojo-root",
        "/absolute/path/to/copilot-agents-dojo"
      ]
    }
  }
}
```

---

## Run with `npx` (after publishing)

Once `@dojo/mcp-memory` is published to npm, you can replace the absolute path with:

```json
{
  "command": "npx",
  "args": ["-y", "@dojo/mcp-memory", "--dojo-root", "/absolute/path/to/copilot-agents-dojo"]
}
```

## Inspect with the official MCP inspector

```bash
npx @modelcontextprotocol/inspector \
  node /absolute/path/to/copilot-agents-dojo/control-plane/packages/mcp-memory/dist/index.js \
  --dojo-root /absolute/path/to/copilot-agents-dojo
```
