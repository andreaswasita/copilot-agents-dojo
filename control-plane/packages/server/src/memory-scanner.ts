import matter from "gray-matter";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, basename, relative } from "node:path";
import type { NewMemoryEntry } from "@dojo/db";

export interface LinkGraph {
  generated: string;
  total_files: number;
  total_links: number;
  forward_links: Record<string, string[]>;
  back_links: Record<string, string[]>;
}

const MEMORY_TYPES = ["decisions", "patterns", "preferences", "sessions"] as const;
type MemoryType = (typeof MEMORY_TYPES)[number];

function singularizeType(folder: MemoryType): string {
  return folder.replace(/s$/, "");
}

export function readLinkGraph(dojoRoot: string): LinkGraph | null {
  const graphPath = join(dojoRoot, "memory", ".link-graph.json");
  if (!existsSync(graphPath)) return null;
  try {
    return JSON.parse(readFileSync(graphPath, "utf-8")) as LinkGraph;
  } catch {
    return null;
  }
}

function inferTitle(slug: string, body: string, frontmatter: Record<string, unknown>): string {
  const fmTitle = (frontmatter.title as string) || (frontmatter.name as string);
  if (fmTitle) return fmTitle;
  const h1 = body.match(/^#\s+(.+)$/m);
  if (h1) return h1[1].trim();
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function scanMemoryFile(
  type: MemoryType,
  filename: string,
  filePath: string
): NewMemoryEntry {
  const content = readFileSync(filePath, "utf-8");
  const parsed = matter(content);
  const data = parsed.data as Record<string, unknown>;
  const slug = `${type}/${basename(filename, ".md")}`;

  return {
    slug,
    type: singularizeType(type),
    title: inferTitle(basename(filename, ".md"), parsed.content, data),
    date: typeof data.date === "string" ? data.date : null,
    status: typeof data.status === "string" ? data.status : null,
    tags: Array.isArray(data.tags) ? (data.tags as string[]).map(String) : [],
    frontmatter: data,
    markdown: parsed.content.trim(),
    filePath,
    lastScannedAt: new Date(),
  };
}

export async function scanAllMemory(dojoRoot: string): Promise<NewMemoryEntry[]> {
  const memoryDir = join(dojoRoot, "memory");
  if (!existsSync(memoryDir)) return [];

  const results: NewMemoryEntry[] = [];
  for (const type of MEMORY_TYPES) {
    const subDir = join(memoryDir, type);
    if (!existsSync(subDir)) continue;

    const files = readdirSync(subDir, { withFileTypes: true })
      .filter((d) => d.isFile() && d.name.endsWith(".md") && d.name !== "_template.md")
      .map((d) => d.name);

    for (const file of files) {
      try {
        results.push(scanMemoryFile(type, file, join(subDir, file)));
      } catch {
        // Skip unreadable files
      }
    }
  }
  return results;
}

export interface GraphNode {
  id: string;
  type: string;
  title: string;
}

export interface GraphEdge {
  source: string;
  target: string;
}

export interface GraphPayload {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export function buildGraphPayload(
  entries: { slug: string; type: string; title: string }[],
  graph: LinkGraph | null
): GraphPayload {
  const slugByPath: Record<string, string> = {};
  for (const e of entries) slugByPath[`${e.slug}.md`] = e.slug;

  const nodes: GraphNode[] = entries.map((e) => ({ id: e.slug, type: e.type, title: e.title }));
  const edges: GraphEdge[] = [];
  const seen = new Set<string>();

  if (graph) {
    for (const [from, targets] of Object.entries(graph.forward_links)) {
      const sourceSlug = slugByPath[from];
      if (!sourceSlug) continue;
      for (const target of targets) {
        const targetSlug = slugByPath[target];
        if (!targetSlug) continue;
        const key = `${sourceSlug}\u0000${targetSlug}`;
        if (seen.has(key)) continue;
        seen.add(key);
        edges.push({ source: sourceSlug, target: targetSlug });
      }
    }
  }

  return { nodes, edges };
}

export function getBacklinksFor(slug: string, graph: LinkGraph | null): string[] {
  if (!graph) return [];
  const sources = graph.back_links[`${slug}.md`] || [];
  return sources.map((s) => s.replace(/\.md$/, ""));
}

export function getForwardLinksFor(slug: string, graph: LinkGraph | null): string[] {
  if (!graph) return [];
  const targets = graph.forward_links[`${slug}.md`] || [];
  return Array.from(new Set(targets.map((s) => s.replace(/\.md$/, ""))));
}

export function memoryRoot(dojoRoot: string): string {
  return join(dojoRoot, "memory");
}

export function relativeMemoryPath(filePath: string, dojoRoot: string): string {
  return relative(memoryRoot(dojoRoot), filePath);
}
