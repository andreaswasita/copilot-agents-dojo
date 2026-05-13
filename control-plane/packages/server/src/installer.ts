import { writeFileSync, mkdirSync, copyFileSync, existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

function assertSafePath(targetPath: string): string {
  const resolved = resolve(targetPath);
  if (resolved.includes("..")) {
    throw new Error(`Path traversal blocked: ${targetPath}`);
  }
  return resolved;
}

function assertSafeSlug(slug: string): void {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
    throw new Error(`Invalid slug: ${slug}`);
  }
}

export interface InstallOptions {
  targetPath: string;
  dojoRoot: string;
  skills: string[];
  agents: string[];
  instructionsContent: string;
  includeMemory?: boolean;
  wireMcp?: boolean;
}

export interface InstallResult {
  copiedSkills: string[];
  copiedAgents: string[];
  instructionsPath: string;
  memoryCopied: boolean;
  mcpConfigPath: string | null;
  errors: string[];
}

export function installToProject(options: InstallOptions): InstallResult {
  const { targetPath, dojoRoot, skills, agents, instructionsContent, includeMemory, wireMcp } = options;

  // Validate inputs
  const safePath = assertSafePath(targetPath);
  for (const slug of skills) assertSafeSlug(slug);
  for (const slug of agents) assertSafeSlug(slug);

  const result: InstallResult = {
    copiedSkills: [],
    copiedAgents: [],
    instructionsPath: "",
    memoryCopied: false,
    mcpConfigPath: null,
    errors: [],
  };

  // Write copilot-instructions.md
  const githubDir = join(safePath, ".github");
  mkdirSync(githubDir, { recursive: true });
  const instructionsPath = join(githubDir, "copilot-instructions.md");
  writeFileSync(instructionsPath, instructionsContent, "utf-8");
  result.instructionsPath = instructionsPath;

  // Copy skill directories
  const targetSkillsDir = join(githubDir, "skills");
  for (const slug of skills) {
    const srcDir = join(dojoRoot, "skills", slug);
    if (!existsSync(srcDir)) {
      result.errors.push(`Skill not found: ${slug}`);
      continue;
    }
    const destDir = join(targetSkillsDir, slug);
    mkdirSync(destDir, { recursive: true });
    copyDirRecursive(srcDir, destDir);
    result.copiedSkills.push(slug);
  }

  // Copy agent files
  const targetAgentsDir = join(githubDir, "agents");
  for (const slug of agents) {
    const srcFile = join(dojoRoot, "agents", `${slug}.md`);
    if (!existsSync(srcFile)) {
      result.errors.push(`Agent not found: ${slug}`);
      continue;
    }
    mkdirSync(targetAgentsDir, { recursive: true });
    copyFileSync(srcFile, join(targetAgentsDir, `${slug}.md`));
    result.copiedAgents.push(slug);
  }

  // Optionally copy memory vault + link-index.sh
  if (includeMemory) {
    const srcMemory = join(dojoRoot, "memory");
    if (existsSync(srcMemory)) {
      const destMemory = join(safePath, "memory");
      mkdirSync(destMemory, { recursive: true });
      copyDirRecursive(srcMemory, destMemory);

      const srcScript = join(dojoRoot, "scripts", "link-index.sh");
      if (existsSync(srcScript)) {
        const destScripts = join(safePath, "scripts");
        mkdirSync(destScripts, { recursive: true });
        copyFileSync(srcScript, join(destScripts, "link-index.sh"));
      }
      result.memoryCopied = true;
    } else {
      result.errors.push("Memory vault not found in dojo root");
    }
  }

  // Optionally wire the MCP memory server config
  if (wireMcp) {
    const mcpConfig = buildMcpConfig(dojoRoot);
    const mcpConfigPath = join(safePath, ".mcp.json");
    let merged: Record<string, unknown> = mcpConfig;
    if (existsSync(mcpConfigPath)) {
      try {
        const existing = JSON.parse(readFileSync(mcpConfigPath, "utf-8"));
        merged = mergeMcpConfig(existing, mcpConfig);
      } catch {
        result.errors.push(`Could not parse existing .mcp.json — leaving it untouched`);
      }
    }
    if (!result.errors.some((e) => e.includes(".mcp.json"))) {
      writeFileSync(mcpConfigPath, JSON.stringify(merged, null, 2) + "\n", "utf-8");
      result.mcpConfigPath = mcpConfigPath;
    }
  }

  return result;
}

function buildMcpConfig(dojoRoot: string): Record<string, unknown> {
  const serverEntry = join(dojoRoot, "control-plane", "packages", "mcp-memory", "dist", "index.js");
  return {
    mcpServers: {
      "dojo-memory": {
        command: "node",
        args: [serverEntry, "--dojo-root", dojoRoot],
      },
    },
  };
}

function mergeMcpConfig(
  existing: Record<string, unknown>,
  next: Record<string, unknown>,
): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...existing };
  const existingServers =
    (existing.mcpServers as Record<string, unknown> | undefined) ?? {};
  const nextServers = (next.mcpServers as Record<string, unknown>) ?? {};
  merged.mcpServers = { ...existingServers, ...nextServers };
  return merged;
}

function copyDirRecursive(src: string, dest: string): void {
  const entries = readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);
    if (entry.isDirectory()) {
      mkdirSync(destPath, { recursive: true });
      copyDirRecursive(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}
