import { Hono } from "hono";
import { eq, ilike, sql, and, inArray } from "drizzle-orm";
import { skills } from "@dojo/db";
import type { Db } from "@dojo/db";
import { scanAllSkills } from "../scanner.js";

export function skillRoutes(db: Db, dojoRoot: string) {
  const router = new Hono();

  // GET /api/skills?category=X&search=X&tag=X
  router.get("/", async (c) => {
    const category = c.req.query("category");
    const search = c.req.query("search");
    const tag = c.req.query("tag");

    const conditions = [];
    if (category) conditions.push(eq(skills.category, category));
    if (search) conditions.push(ilike(skills.name, `%${search}%`));

    let query = db.select().from(skills);
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    let results = await query.orderBy(skills.category, skills.name);

    if (tag) {
      results = results.filter((s) => s.tags.includes(tag));
    }

    return c.json(results);
  });

  // GET /api/skills/tags
  router.get("/tags", async (c) => {
    const allSkills = await db.select({ tags: skills.tags }).from(skills);
    const tagSet = new Set<string>();
    for (const s of allSkills) {
      for (const t of s.tags) tagSet.add(t);
    }
    return c.json([...tagSet].sort());
  });

  // GET /api/skills/:slug
  router.get("/:slug", async (c) => {
    const slug = c.req.param("slug");
    const result = await db.select().from(skills).where(eq(skills.slug, slug)).limit(1);
    if (result.length === 0) return c.json({ error: "Skill not found" }, 404);
    return c.json(result[0]);
  });

  // POST /api/skills/scan
  router.post("/scan", async (c) => {
    const scannedSkills = await scanAllSkills(dojoRoot);
    for (const skill of scannedSkills) {
      const existing = await db.select().from(skills).where(eq(skills.slug, skill.slug)).limit(1);
      if (existing.length > 0) {
        await db.update(skills).set({ ...skill, updatedAt: new Date() }).where(eq(skills.slug, skill.slug));
      } else {
        await db.insert(skills).values(skill);
      }
    }
    return c.json({ message: "Scan complete", count: scannedSkills.length });
  });

  return router;
}
