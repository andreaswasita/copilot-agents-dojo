import { writeFileSync, mkdirSync, copyFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

export interface InstallOptions {
  targetPath: string;
  dojoRoot: string;
  skills: string[];
  agents: string[];
  instructionsContent: string;
}

export interface InstallResult {
  copiedSkills: string[];
  copiedAgents: string[];
  instructionsPath: string;
  errors: string[];
}

export function installToProject(options: InstallOptions): InstallResult {
  const { targetPath, dojoRoot, skills, agents, instructionsContent } = options;
  const result: InstallResult = {
    copiedSkills: [],
    copiedAgents: [],
    instructionsPath: "",
    errors: [],
  };

  // Write copilot-instructions.md
  const githubDir = join(targetPath, ".github");
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

  return result;
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
