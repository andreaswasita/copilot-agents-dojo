import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, mkdirSync, rmSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import matter from "gray-matter";

import { createStore, FilesystemStore } from "../src/store.js";

function makeVault(root: string): void {
  mkdirSync(join(root, "memory"), { recursive: true });
  for (const sub of ["decisions", "patterns", "preferences", "sessions"]) {
    mkdirSync(join(root, "memory", sub), { recursive: true });
  }
}

function seedFile(
  root: string,
  rel: string,
  frontmatter: Record<string, unknown>,
  body: string,
): void {
  const full = join(root, "memory", rel);
  const fmLines = ["---"];
  for (const [k, v] of Object.entries(frontmatter)) {
    if (Array.isArray(v)) fmLines.push(`${k}: [${v.map((x) => JSON.stringify(x)).join(", ")}]`);
    else if (v === null) fmLines.push(`${k}: null`);
    else if (typeof v === "string") fmLines.push(`${k}: ${v}`);
    else fmLines.push(`${k}: ${JSON.stringify(v)}`);
  }
  fmLines.push("---");
  writeFileSync(full, `${fmLines.join("\n")}\n\n${body.trim()}\n`, "utf-8");
}

describe("FilesystemStore", () => {
  let root: string;

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "dojo-mcp-memory-"));
  });

  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
  });

  describe("createStore", () => {
    it("throws when no memory/ directory exists", () => {
      expect(() => createStore(root)).toThrow(/No memory vault/);
    });

    it("succeeds when memory/ is present", () => {
      makeVault(root);
      const store = createStore(root);
      expect(store).toBeInstanceOf(FilesystemStore);
    });
  });

  describe("list / search / get", () => {
    beforeEach(() => {
      makeVault(root);
      seedFile(
        root,
        "decisions/2026-04-12-postgres.md",
        { type: "decision", date: "2026-04-12", status: "accepted", tags: ["db", "infra"] },
        "# Use Postgres over DynamoDB\n\nSQL semantics needed for joins.",
      );
      seedFile(
        root,
        "patterns/retry-with-jitter.md",
        { type: "pattern", date: "2026-04-15", status: "active", tags: ["resilience", "typescript"] },
        "# Retry with full jitter\n\nExponential backoff multiplied by random.",
      );
      seedFile(
        root,
        "preferences/short-commits.md",
        { type: "preference", date: "2026-05-01", confidence: "high", tags: ["git"] },
        "# Prefer short commits\n\nUser asked for atomic commits.",
      );
      seedFile(
        root,
        "sessions/2026-05-20-debug-auth.md",
        { type: "session", date: "2026-05-20", task: "auth debugging", branch: "main", tags: [] },
        "# Debug auth flow\n\nSession exploring JWT verification.",
      );
      seedFile(
        root,
        "decisions/_template.md",
        { type: "decision", date: "TBD", status: "draft", tags: [] },
        "# TEMPLATE — do not list",
      );
    });

    it("list() returns all non-template entries", async () => {
      const store = createStore(root);
      const all = await store.list();
      expect(all.map((e) => e.slug).sort()).toEqual([
        "decisions/2026-04-12-postgres",
        "patterns/retry-with-jitter",
        "preferences/short-commits",
        "sessions/2026-05-20-debug-auth",
      ]);
      expect(all.find((e) => e.slug.includes("_template"))).toBeUndefined();
    });

    it("list() filters by type", async () => {
      const store = createStore(root);
      const decisions = await store.list({ type: "decision" });
      expect(decisions).toHaveLength(1);
      expect(decisions[0].type).toBe("decision");
    });

    it("list() filters by exact tag match", async () => {
      const store = createStore(root);
      const tsEntries = await store.list({ tag: "typescript" });
      expect(tsEntries).toHaveLength(1);
      expect(tsEntries[0].slug).toBe("patterns/retry-with-jitter");
    });

    it("search() is case-insensitive across title/body/tags", async () => {
      const store = createStore(root);
      expect((await store.search("POSTGRES")).length).toBe(1);
      expect((await store.search("jitter")).length).toBe(1);
      expect((await store.search("git")).length).toBe(1);
      expect((await store.search("nope-no-match")).length).toBe(0);
    });

    it("get() returns the entry or null", async () => {
      const store = createStore(root);
      const found = await store.get("patterns/retry-with-jitter");
      expect(found?.title).toBe("Retry with full jitter");
      expect(await store.get("decisions/does-not-exist")).toBeNull();
    });

    it("recentSessions() sorts by date desc and respects limit", async () => {
      seedFile(
        root,
        "sessions/2026-01-01-old.md",
        { type: "session", date: "2026-01-01", tags: [] },
        "# Old session",
      );
      const store = createStore(root);
      const recent = await store.recentSessions(1);
      expect(recent).toHaveLength(1);
      expect(recent[0].slug).toBe("sessions/2026-05-20-debug-auth");
    });

    it("activeDecisions() filters out superseded", async () => {
      seedFile(
        root,
        "decisions/2026-03-01-superseded.md",
        { type: "decision", date: "2026-03-01", status: "superseded", tags: [] },
        "# Old choice",
      );
      const store = createStore(root);
      const active = await store.activeDecisions();
      expect(active.map((e) => e.slug)).toEqual(["decisions/2026-04-12-postgres"]);
    });

    it("patternsForContext() matches on language tag", async () => {
      const store = createStore(root);
      const ts = await store.patternsForContext({ language: "typescript" });
      expect(ts.map((e) => e.slug)).toContain("patterns/retry-with-jitter");
      const none = await store.patternsForContext({ language: "cobol" });
      expect(none).toHaveLength(0);
    });
  });

  describe("create()", () => {
    beforeEach(() => makeVault(root));

    it("creates a decision with YYYY-MM-DD prefix and default frontmatter", async () => {
      const store = createStore(root);
      const today = new Date().toISOString().slice(0, 10);
      const entry = await store.create({
        type: "decision",
        slugSuffix: "use-redis",
        title: "Use Redis for hot cache",
      });
      expect(entry.slug).toBe(`decisions/${today}-use-redis`);
      const raw = readFileSync(entry.filePath, "utf-8");
      const parsed = matter(raw);
      expect(parsed.data.type).toBe("decision");
      expect(parsed.data.status).toBe("accepted");
      expect(parsed.data["superseded-by"]).toBeNull();
    });

    it("creates a pattern without date prefix", async () => {
      const store = createStore(root);
      const entry = await store.create({
        type: "pattern",
        slugSuffix: "circuit-breaker",
        title: "Circuit breaker",
      });
      expect(entry.slug).toBe("patterns/circuit-breaker");
      const parsed = matter(readFileSync(entry.filePath, "utf-8"));
      expect(parsed.data.source).toBe("mcp-memory");
      expect(parsed.data.occurrences).toBe(0);
    });

    it("rejects invalid type", async () => {
      const store = createStore(root);
      await expect(
        store.create({ type: "wishlist", slugSuffix: "x", title: "T" }),
      ).rejects.toThrow(/Invalid type/);
    });

    it("rejects invalid slug (not kebab-case)", async () => {
      const store = createStore(root);
      await expect(
        store.create({ type: "pattern", slugSuffix: "Bad_Slug", title: "T" }),
      ).rejects.toThrow(/Invalid slugSuffix/);
    });

    it("rejects creation when file already exists", async () => {
      const store = createStore(root);
      await store.create({ type: "pattern", slugSuffix: "dup", title: "Dup" });
      await expect(
        store.create({ type: "pattern", slugSuffix: "dup", title: "Dup" }),
      ).rejects.toThrow(/already exists/);
    });

    it("merges extraFrontmatter without losing defaults", async () => {
      const store = createStore(root);
      const entry = await store.create({
        type: "preference",
        slugSuffix: "use-typescript",
        title: "Prefer TS",
        extraFrontmatter: { rationale: "type safety", confidence: "high" },
      });
      const parsed = matter(readFileSync(entry.filePath, "utf-8"));
      expect(parsed.data.confidence).toBe("high");
      expect(parsed.data.rationale).toBe("type safety");
      expect(parsed.data.source).toBe("mcp-memory");
    });
  });

  describe("link()", () => {
    beforeEach(() => {
      makeVault(root);
      seedFile(
        root,
        "decisions/2026-04-12-postgres.md",
        { type: "decision", date: "2026-04-12", status: "accepted", tags: [] },
        "# Use Postgres\n\nBody.",
      );
      seedFile(
        root,
        "patterns/migrations.md",
        { type: "pattern", date: "2026-04-13", status: "active", tags: [] },
        "# Migrations pattern",
      );
    });

    it("appends a cross-folder link with relative ../ path", async () => {
      const store = createStore(root);
      const from = "decisions/2026-04-12-postgres";
      const to = "patterns/migrations";
      const updated = await store.link(from, to);
      const body = readFileSync(updated.filePath, "utf-8");
      expect(body).toMatch(/\]\(\.\.\/patterns\/migrations\.md\)/);
    });

    it("is idempotent: same target twice does not duplicate", async () => {
      const store = createStore(root);
      const from = "decisions/2026-04-12-postgres";
      const to = "patterns/migrations";
      await store.link(from, to);
      await store.link(from, to);
      const body = readFileSync(join(root, "memory", "decisions/2026-04-12-postgres.md"), "utf-8");
      const matches = body.match(/\]\(\.\.\/patterns\/migrations\.md\)/g) ?? [];
      expect(matches).toHaveLength(1);
    });

    it("rejects when source or target missing", async () => {
      const store = createStore(root);
      await expect(store.link("decisions/missing", "patterns/migrations")).rejects.toThrow(
        /Source entry not found/,
      );
      await expect(
        store.link("decisions/2026-04-12-postgres", "patterns/missing"),
      ).rejects.toThrow(/Target entry not found/);
    });
  });

  describe("supersede()", () => {
    beforeEach(() => {
      makeVault(root);
      seedFile(
        root,
        "decisions/2026-01-01-old.md",
        { type: "decision", date: "2026-01-01", status: "accepted", tags: [] },
        "# Old decision",
      );
      seedFile(
        root,
        "decisions/2026-06-01-new.md",
        { type: "decision", date: "2026-06-01", status: "accepted", tags: [] },
        "# New decision",
      );
      seedFile(
        root,
        "patterns/not-a-decision.md",
        { type: "pattern", date: "2026-02-01", status: "active", tags: [] },
        "# Pattern",
      );
    });

    it("sets status=superseded and superseded-by on the old decision", async () => {
      const store = createStore(root);
      await store.supersede("decisions/2026-01-01-old", "decisions/2026-06-01-new");
      const parsed = matter(readFileSync(join(root, "memory", "decisions/2026-01-01-old.md"), "utf-8"));
      expect(parsed.data.status).toBe("superseded");
      expect(parsed.data["superseded-by"]).toBe("decisions/2026-06-01-new.md");
    });

    it("rejects superseding a non-decision entry", async () => {
      const store = createStore(root);
      await expect(
        store.supersede("patterns/not-a-decision", "decisions/2026-06-01-new"),
      ).rejects.toThrow(/Only decisions can be superseded/);
    });

    it("rejects when either decision is missing", async () => {
      const store = createStore(root);
      await expect(
        store.supersede("decisions/missing", "decisions/2026-06-01-new"),
      ).rejects.toThrow(/not found/);
    });
  });

  describe("backlinks / forwardLinks", () => {
    it("returns [] when no link-graph.json exists", () => {
      makeVault(root);
      const store = createStore(root);
      expect(store.backlinks("patterns/anything")).toEqual([]);
      expect(store.forwardLinks("patterns/anything")).toEqual([]);
    });

    it("reads forward and back links from a seeded graph", () => {
      makeVault(root);
      const graph = {
        generated: new Date().toISOString(),
        total_files: 2,
        total_links: 1,
        forward_links: { "postgres.md": ["migrations.md"] },
        back_links: { "migrations.md": ["postgres.md"] },
      };
      writeFileSync(join(root, "memory", ".link-graph.json"), JSON.stringify(graph), "utf-8");
      const store = createStore(root);
      expect(store.forwardLinks("postgres")).toEqual(["migrations"]);
      expect(store.backlinks("migrations")).toEqual(["postgres"]);
    });
  });

  it("survives entries with no frontmatter (list does not throw)", async () => {
    makeVault(root);
    writeFileSync(
      join(root, "memory", "patterns", "no-frontmatter.md"),
      "Just markdown, no frontmatter block.\n",
      "utf-8",
    );
    const store = createStore(root);
    const entries = await store.list();
    expect(entries.some((e) => e.slug === "patterns/no-frontmatter")).toBe(true);
  });

  it("sanity: vault directory exists after makeVault", () => {
    makeVault(root);
    expect(existsSync(join(root, "memory"))).toBe(true);
  });
});
