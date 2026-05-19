import matter from "gray-matter";
import { glob } from "glob";
import { readFileSync, readdirSync } from "node:fs";
import { join, basename } from "node:path";
import { categoryForSkill } from "./categories.js";
import type { NewSkill, NewAgent } from "@dojo/db";

export function parseFrontmatter(content: string): { data: Record<string, unknown>; content: string } {
  try {
    const parsed = matter(content);
    return { data: parsed.data as Record<string, unknown>, content: parsed.content };
  } catch {
    return { data: {}, content };
  }
}

function generateTags(description: string): string[] {
  const stopWords = new Set([
    "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "is", "it", "that", "this", "from", "as", "be",
    "are", "was", "were", "been", "has", "have", "had", "do", "does",
    "did", "will", "would", "could", "should", "may", "might",
  ]);
  return description
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w))
    .slice(0, 8);
}

function getFileInventory(dirPath: string): string[] {
  try {
    return readdirSync(dirPath, { recursive: true })
      .map(String)
      .filter((f) => !f.startsWith("."));
  } catch {
    return [];
  }
}

export function scanSkillDir(slug: string, content: string, dirPath: string): NewSkill {
  const { data, content: body } = parseFrontmatter(content);
  const name = (data.name as string) || slug;
  const description = (data.description as string) || "";
  const { category, icon, label } = categoryForSkill(slug);

  return {
    slug,
    name,
    description,
    category,
    categoryIcon: icon,
    categoryLabel: label,
    markdown: body.trim(),
    tags: generateTags(description),
    filePath: dirPath,
    fileInventory: getFileInventory(dirPath),
    lastScannedAt: new Date(),
  };
}

export function scanAgentFile(slug: string, content: string, filePath: string): NewAgent {
  const { data, content: body } = parseFrontmatter(content);
  return {
    slug,
    name: (data.name as string) || slug,
    description: (data.description as string) || "",
    agentType: (data.type as string) || "",
    activation: (data.activation as string) || "",
    applyTo: (data.applyTo as string[]) || [],
    markdown: body.trim(),
    filePath,
  };
}

export async function scanAllSkills(dojoRoot: string): Promise<NewSkill[]> {
  const skillsDir = join(dojoRoot, "skills");
  const dirs = readdirSync(skillsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  const results: NewSkill[] = [];
  for (const dir of dirs) {
    const skillFile = join(skillsDir, dir, "SKILL.md");
    try {
      const content = readFileSync(skillFile, "utf-8");
      results.push(scanSkillDir(dir, content, join(skillsDir, dir)));
    } catch {
      // Skip dirs without SKILL.md
    }
  }
  return results;
}

export async function scanAllAgents(dojoRoot: string): Promise<NewAgent[]> {
  const agentsDir = join(dojoRoot, "agents");
  const files = await glob("*.md", { cwd: agentsDir });

  return files.map((file) => {
    const content = readFileSync(join(agentsDir, file), "utf-8");
    const slug = basename(file, ".md");
    return scanAgentFile(slug, content, join(agentsDir, file));
  });
}
