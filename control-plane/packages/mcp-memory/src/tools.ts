import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Store, MemoryEntry } from "./store.js";

function entrySummary(e: MemoryEntry): string {
  return [
    `slug: ${e.slug}`,
    `type: ${e.type}`,
    `title: ${e.title}`,
    e.date ? `date: ${e.date}` : null,
    e.status ? `status: ${e.status}` : null,
    e.tags.length ? `tags: ${e.tags.join(", ")}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

function entryFull(e: MemoryEntry): string {
  return `${entrySummary(e)}\n\n---\n${e.markdown}\n`;
}

function toText(content: string) {
  return { content: [{ type: "text" as const, text: content }] };
}

function toError(err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  return { content: [{ type: "text" as const, text: `Error: ${msg}` }], isError: true };
}

export function registerTools(server: McpServer, store: Store): void {
  server.registerTool(
    "memory_list",
    {
      title: "List memory entries",
      description:
        "List entries in the agent memory vault. Optional filter by type (decision/pattern/preference/session) or tag.",
      inputSchema: {
        type: z
          .enum(["decision", "pattern", "preference", "session"])
          .optional()
          .describe("Filter by entry type"),
        tag: z.string().optional().describe("Filter by exact tag match"),
      },
    },
    async ({ type, tag }) => {
      try {
        const entries = await store.list({ type, tag });
        if (entries.length === 0) return toText("No matching entries.");
        const lines = entries.map((e) => `- [${e.type}] ${e.slug} — ${e.title}`);
        return toText(`Found ${entries.length} entries:\n${lines.join("\n")}`);
      } catch (err) {
        return toError(err);
      }
    },
  );

  server.registerTool(
    "memory_search",
    {
      title: "Search memory vault",
      description: "Substring search across titles, body markdown, and tags.",
      inputSchema: {
        query: z.string().min(1).describe("Search query (case-insensitive substring)"),
      },
    },
    async ({ query }) => {
      try {
        const entries = await store.search(query);
        if (entries.length === 0) return toText(`No entries match "${query}".`);
        const lines = entries.map((e) => `- [${e.type}] ${e.slug} — ${e.title}`);
        return toText(`Found ${entries.length} matches for "${query}":\n${lines.join("\n")}`);
      } catch (err) {
        return toError(err);
      }
    },
  );

  server.registerTool(
    "memory_get",
    {
      title: "Get full memory entry",
      description: "Fetch one entry by slug (e.g. 'decisions/2026-04-12-postgres-over-dynamodb').",
      inputSchema: {
        slug: z.string().min(1).describe("Slug of the entry"),
      },
    },
    async ({ slug }) => {
      try {
        const entry = await store.get(slug);
        if (!entry) return toText(`Not found: ${slug}`);
        const backlinks = store.backlinks(slug);
        const forward = store.forwardLinks(slug);
        const linkBlock =
          backlinks.length || forward.length
            ? `\n\n---\nForward links: ${forward.join(", ") || "(none)"}\nBacklinks: ${backlinks.join(", ") || "(none)"}`
            : "";
        return toText(`${entryFull(entry)}${linkBlock}`);
      } catch (err) {
        return toError(err);
      }
    },
  );

  server.registerTool(
    "memory_create",
    {
      title: "Create a new memory entry",
      description:
        "Create a new entry in the memory vault. Re-runs link-index automatically. Returns the new slug.",
      inputSchema: {
        type: z
          .enum(["decision", "pattern", "preference", "session"])
          .describe("Entry type"),
        slugSuffix: z
          .string()
          .regex(/^[a-z0-9][a-z0-9-]*$/)
          .describe("Kebab-case suffix; decisions/sessions get YYYY-MM-DD prepended."),
        title: z.string().min(1).describe("Human-readable title"),
        tags: z.array(z.string()).optional().describe("Tag list"),
        status: z.string().optional().describe("Status (e.g. accepted, active)"),
        extraFrontmatter: z
          .record(z.string(), z.unknown())
          .optional()
          .describe("Extra frontmatter keys"),
        initialBody: z
          .string()
          .optional()
          .describe("Markdown body. If omitted, a minimal template is used."),
      },
    },
    async (input) => {
      try {
        const entry = await store.create(input);
        return toText(`Created ${entry.slug} at ${entry.filePath}`);
      } catch (err) {
        return toError(err);
      }
    },
  );

  server.registerTool(
    "memory_link",
    {
      title: "Add a link between entries",
      description:
        "Append a markdown link from one entry to another. Re-runs link-index automatically.",
      inputSchema: {
        fromSlug: z.string().min(1).describe("Slug of the source entry"),
        toSlug: z.string().min(1).describe("Slug of the target entry"),
        label: z.string().optional().describe("Optional link label (defaults to target title)"),
      },
    },
    async ({ fromSlug, toSlug, label }) => {
      try {
        const updated = await store.link(fromSlug, toSlug, label);
        return toText(`Linked ${fromSlug} → ${toSlug}. Updated file: ${updated.filePath}`);
      } catch (err) {
        return toError(err);
      }
    },
  );

  server.registerTool(
    "memory_recent_sessions",
    {
      title: "Recent session summaries",
      description: "Return the most recent N session entries (by date desc). Use at session start to load context.",
      inputSchema: {
        limit: z.number().int().min(1).max(50).default(5).describe("How many sessions to return"),
      },
    },
    async ({ limit }) => {
      try {
        const entries = await store.recentSessions(limit);
        if (entries.length === 0) return toText("No session entries yet.");
        const parts = entries.map((e) => `## ${e.slug}\n${entrySummary(e)}\n\n${e.markdown}`);
        return toText(parts.join("\n\n---\n\n"));
      } catch (err) {
        return toError(err);
      }
    },
  );

  server.registerTool(
    "memory_decisions_active",
    {
      title: "Active architectural decisions",
      description: "List all decisions where status='accepted' (i.e. not superseded). Use at session start.",
      inputSchema: {},
    },
    async () => {
      try {
        const entries = await store.activeDecisions();
        if (entries.length === 0) return toText("No active decisions.");
        const parts = entries.map((e) => `## ${e.slug}\n${entrySummary(e)}\n\n${e.markdown}`);
        return toText(parts.join("\n\n---\n\n"));
      } catch (err) {
        return toError(err);
      }
    },
  );

  server.registerTool(
    "memory_patterns_for_context",
    {
      title: "Patterns relevant to context",
      description:
        "Return active patterns whose body/tags mention the given language or file type. If both omitted, returns all patterns.",
      inputSchema: {
        language: z.string().optional().describe("e.g. typescript, python, go"),
        fileType: z.string().optional().describe("e.g. test, route, schema"),
      },
    },
    async ({ language, fileType }) => {
      try {
        const entries = await store.patternsForContext({ language, fileType });
        if (entries.length === 0) return toText("No matching patterns.");
        const parts = entries.map((e) => `## ${e.slug}\n${entrySummary(e)}\n\n${e.markdown}`);
        return toText(parts.join("\n\n---\n\n"));
      } catch (err) {
        return toError(err);
      }
    },
  );

  server.registerTool(
    "memory_supersede",
    {
      title: "Supersede a decision",
      description:
        "Mark an existing decision as superseded by another. Sets status='superseded' and superseded-by.",
      inputSchema: {
        oldSlug: z.string().min(1).describe("Slug of the decision being superseded"),
        newSlug: z.string().min(1).describe("Slug of the replacement decision"),
      },
    },
    async ({ oldSlug, newSlug }) => {
      try {
        const updated = await store.supersede(oldSlug, newSlug);
        return toText(`Superseded ${oldSlug} → ${newSlug}. Updated: ${updated.filePath}`);
      } catch (err) {
        return toError(err);
      }
    },
  );

  server.registerTool(
    "memory_history",
    {
      title: "Git history for a memory entry",
      description: "Return git commit history for a specific entry (sha, date, author, message, sessionId).",
      inputSchema: {
        slug: z.string().min(1).describe("Slug of the entry"),
        limit: z.number().int().min(1).max(100).default(20).describe("Max commits to return"),
      },
    },
    async ({ slug, limit }) => {
      try {
        const commits = (await store.history(slug)).slice(0, limit);
        if (commits.length === 0) return toText(`No git history for ${slug}.`);
        const lines = commits.map(
          (c) =>
            `- ${c.sha.slice(0, 8)} | ${c.date} | ${c.author} | ${c.message}${c.sessionId ? ` (session: ${c.sessionId})` : ""}`,
        );
        return toText(`History for ${slug}:\n${lines.join("\n")}`);
      } catch (err) {
        return toError(err);
      }
    },
  );
}
