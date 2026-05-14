import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join, basename } from "node:path";
import { execSync } from "node:child_process";
import matter from "gray-matter";

const MEMORY_TYPES = ["decisions", "patterns", "preferences", "sessions"] as const;
type MemoryFolder = (typeof MEMORY_TYPES)[number];

interface LinkGraph {
  generated: string;
  total_files: number;
  total_links: number;
  forward_links: Record<string, string[]>;
  back_links: Record<string, string[]>;
}

function readLinkGraph(dojoRoot: string): LinkGraph | null {
  const p = join(dojoRoot, "memory", ".link-graph.json");
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf-8")) as LinkGraph;
  } catch {
    return null;
  }
}

function getBacklinksFor(slug: string, graph: LinkGraph | null): string[] {
  if (!graph) return [];
  const sources = graph.back_links[`${slug}.md`] ?? [];
  return sources.map((s) => s.replace(/\.md$/, ""));
}

function getForwardLinksFor(slug: string, graph: LinkGraph | null): string[] {
  if (!graph) return [];
  const targets = graph.forward_links[`${slug}.md`] ?? [];
  return Array.from(new Set(targets.map((s) => s.replace(/\.md$/, ""))));
}

export interface MemoryEntry {
  slug: string;
  type: string;
  title: string;
  date: string | null;
  status: string | null;
  tags: string[];
  frontmatter: Record<string, unknown>;
  markdown: string;
  filePath: string;
}

export interface HistoryEntry {
  sha: string;
  date: string;
  author: string;
  message: string;
  sessionId: string | null;
}

const TYPE_TO_FOLDER: Record<string, string> = {
  decision: "decisions",
  pattern: "patterns",
  preference: "preferences",
  session: "sessions",
};

const VALID_TYPES = new Set(Object.keys(TYPE_TO_FOLDER));

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function singularize(folder: string): string {
  return folder.replace(/s$/, "");
}

function readEntryFromFile(filePath: string, slug: string, type: string): MemoryEntry {
  const raw = readFileSync(filePath, "utf-8");
  const parsed = matter(raw);
  const data = parsed.data as Record<string, unknown>;
  const title = (data.title as string)
    || (parsed.content.match(/^#\s+(.+)$/m)?.[1].trim())
    || basename(slug).replace(/-/g, " ");
  return {
    slug,
    type,
    title,
    date: typeof data.date === "string" ? data.date : null,
    status: typeof data.status === "string" ? data.status : null,
    tags: Array.isArray(data.tags) ? (data.tags as string[]).map(String) : [],
    frontmatter: data,
    markdown: parsed.content.trim(),
    filePath,
  };
}

export class FilesystemStore {
  constructor(public readonly dojoRoot: string) {}

  private memoryDir(): string {
    return join(this.dojoRoot, "memory");
  }

  async all(): Promise<MemoryEntry[]> {
    const memoryDir = this.memoryDir();
    if (!existsSync(memoryDir)) return [];

    const results: MemoryEntry[] = [];
    for (const folder of MEMORY_TYPES) {
      const subDir = join(memoryDir, folder);
      if (!existsSync(subDir)) continue;

      const files = readdirSync(subDir, { withFileTypes: true })
        .filter((d) => d.isFile() && d.name.endsWith(".md") && d.name !== "_template.md")
        .map((d) => d.name);

      for (const file of files) {
        try {
          const filePath = join(subDir, file);
          const slug = `${folder}/${basename(file, ".md")}`;
          results.push(readEntryFromFile(filePath, slug, singularize(folder)));
        } catch {
          // skip unreadable
        }
      }
    }
    return results;
  }

  async list(filter?: { type?: string; tag?: string }): Promise<MemoryEntry[]> {
    let entries = await this.all();
    if (filter?.type) entries = entries.filter((e) => e.type === filter.type);
    if (filter?.tag) entries = entries.filter((e) => e.tags.includes(filter.tag!));
    return entries.sort((a, b) => a.type.localeCompare(b.type) || a.title.localeCompare(b.title));
  }

  async search(query: string): Promise<MemoryEntry[]> {
    const q = query.toLowerCase();
    const entries = await this.all();
    return entries.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.markdown.toLowerCase().includes(q) ||
        e.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }

  async get(slug: string): Promise<MemoryEntry | null> {
    const entries = await this.all();
    return entries.find((e) => e.slug === slug) ?? null;
  }

  async recentSessions(limit: number): Promise<MemoryEntry[]> {
    const entries = await this.list({ type: "session" });
    return entries
      .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))
      .slice(0, limit);
  }

  async activeDecisions(): Promise<MemoryEntry[]> {
    const entries = await this.list({ type: "decision" });
    return entries.filter((e) => (e.status ?? "accepted") === "accepted");
  }

  async patternsForContext(ctx: { language?: string; fileType?: string }): Promise<MemoryEntry[]> {
    const patterns = await this.list({ type: "pattern" });
    if (!ctx.language && !ctx.fileType) return patterns;

    const langKey = ctx.language?.toLowerCase();
    const ftKey = ctx.fileType?.toLowerCase();

    return patterns.filter((p) => {
      const haystack = [
        p.markdown.toLowerCase(),
        ...p.tags.map((t) => t.toLowerCase()),
        JSON.stringify(p.frontmatter).toLowerCase(),
      ].join(" ");
      if (langKey && haystack.includes(langKey)) return true;
      if (ftKey && haystack.includes(ftKey)) return true;
      return false;
    });
  }

  async create(input: {
    type: string;
    slugSuffix: string;
    title: string;
    tags?: string[];
    status?: string;
    extraFrontmatter?: Record<string, unknown>;
    initialBody?: string;
  }): Promise<MemoryEntry> {
    if (!VALID_TYPES.has(input.type)) {
      throw new Error(`Invalid type: ${input.type}. Must be one of ${[...VALID_TYPES].join(", ")}.`);
    }
    if (!/^[a-z0-9][a-z0-9-]*$/.test(input.slugSuffix)) {
      throw new Error(`Invalid slugSuffix: must be lowercase kebab-case (got "${input.slugSuffix}")`);
    }

    const folder = TYPE_TO_FOLDER[input.type];
    const memoryDir = this.memoryDir();
    if (!existsSync(memoryDir)) throw new Error(`Memory vault not found at ${memoryDir}`);

    const filename =
      input.type === "decision" || input.type === "session"
        ? `${todayIso()}-${input.slugSuffix}.md`
        : `${input.slugSuffix}.md`;
    const targetPath = join(memoryDir, folder, filename);
    if (existsSync(targetPath)) throw new Error(`File already exists: ${folder}/${filename}`);

    const fm: Record<string, unknown> = {
      type: input.type,
      date: todayIso(),
      tags: input.tags ?? [],
    };
    if (input.status) fm.status = input.status;
    if (input.type === "decision") {
      fm.status = fm.status || "accepted";
      fm["superseded-by"] = null;
    } else if (input.type === "pattern") {
      fm.source = "mcp-memory";
      fm.error_type = null;
      fm.occurrences = 0;
      fm.status = fm.status || "active";
    } else if (input.type === "preference") {
      fm.source = "mcp-memory";
      fm.confidence = "low";
    } else if (input.type === "session") {
      fm.task = null;
      fm.branch = null;
    }
    Object.assign(fm, input.extraFrontmatter ?? {});

    const fmLines = ["---"];
    for (const [k, v] of Object.entries(fm)) {
      if (Array.isArray(v)) fmLines.push(`${k}: [${v.map((x) => JSON.stringify(x)).join(", ")}]`);
      else if (v === null) fmLines.push(`${k}: null`);
      else if (typeof v === "string") fmLines.push(`${k}: ${v}`);
      else fmLines.push(`${k}: ${JSON.stringify(v)}`);
    }
    fmLines.push("---");
    const frontmatter = fmLines.join("\n");
    const body = input.initialBody?.trim() || `# ${input.title}\n\n_Created by MCP memory server._\n`;

    writeFileSync(targetPath, `${frontmatter}\n\n${body.trim()}\n`, "utf-8");
    this.runLinkIndex();

    const slug = `${folder}/${filename.replace(/\.md$/, "")}`;
    return readEntryFromFile(targetPath, slug, singularize(folder));
  }

  async link(fromSlug: string, toSlug: string, label?: string): Promise<MemoryEntry> {
    const from = await this.get(fromSlug);
    const to = await this.get(toSlug);
    if (!from) throw new Error(`Source entry not found: ${fromSlug}`);
    if (!to) throw new Error(`Target entry not found: ${toSlug}`);

    const raw = readFileSync(from.filePath, "utf-8");
    const parsed = matter(raw);
    const linkLabel = label ?? to.title;
    const fromFolder = from.slug.split("/")[0];
    const toFolder = to.slug.split("/")[0];
    const targetRel =
      fromFolder === toFolder
        ? `${to.slug.split("/")[1]}.md`
        : `../${to.slug}.md`;
    const linkLine = `- [${linkLabel}](${targetRel})`;

    if (parsed.content.includes(`](${targetRel})`)) return from;

    const updated = `${parsed.content.trimEnd()}\n${linkLine}\n`;
    const rebuilt = matter.stringify(updated, parsed.data);
    writeFileSync(from.filePath, rebuilt, "utf-8");
    this.runLinkIndex();

    return readEntryFromFile(from.filePath, from.slug, from.type);
  }

  async supersede(oldSlug: string, newSlug: string): Promise<MemoryEntry> {
    const old = await this.get(oldSlug);
    const next = await this.get(newSlug);
    if (!old) throw new Error(`Decision not found: ${oldSlug}`);
    if (!next) throw new Error(`Replacement decision not found: ${newSlug}`);
    if (old.type !== "decision") throw new Error(`Only decisions can be superseded (got type=${old.type})`);

    const raw = readFileSync(old.filePath, "utf-8");
    const parsed = matter(raw);
    const data = { ...parsed.data, status: "superseded", "superseded-by": `${newSlug}.md` };
    const rebuilt = matter.stringify(parsed.content, data);
    writeFileSync(old.filePath, rebuilt, "utf-8");
    this.runLinkIndex();
    return readEntryFromFile(old.filePath, old.slug, old.type);
  }

  async history(slug: string): Promise<HistoryEntry[]> {
    const entry = await this.get(slug);
    if (!entry) return [];
    try {
      const out = execSync(
        `git log --follow --pretty=format:'%H%x00%aI%x00%an%x00%s' -- "${entry.filePath}"`,
        { cwd: this.dojoRoot, encoding: "utf-8" },
      );
      return out
        .split("\n")
        .filter(Boolean)
        .map((line) => {
          const [sha, date, author, message] = line.split("\u0000");
          const sessionMatch = message?.match(/session[:\s]+([a-z0-9-]{6,})/i);
          return {
            sha,
            date,
            author,
            message,
            sessionId: sessionMatch?.[1] ?? null,
          };
        });
    } catch {
      return [];
    }
  }

  backlinks(slug: string): string[] {
    return getBacklinksFor(slug, readLinkGraph(this.dojoRoot));
  }

  forwardLinks(slug: string): string[] {
    return getForwardLinksFor(slug, readLinkGraph(this.dojoRoot));
  }

  private runLinkIndex(): void {
    const script = join(this.dojoRoot, "scripts", "link-index.sh");
    if (!existsSync(script)) return;
    try {
      execSync(`bash "${script}"`, { cwd: this.dojoRoot, stdio: "ignore" });
    } catch {
      // graph just won't have new node until next manual run
    }
  }
}

export type Store = FilesystemStore;

export function createStore(dojoRoot: string): Store {
  if (!existsSync(join(dojoRoot, "memory"))) {
    throw new Error(`No memory vault found at ${dojoRoot}/memory`);
  }
  return new FilesystemStore(dojoRoot);
}
