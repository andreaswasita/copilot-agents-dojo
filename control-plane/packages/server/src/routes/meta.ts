import { Hono } from "hono";
import { sql } from "drizzle-orm";
import { skills, agents, profiles } from "@dojo/db";
import type { Db } from "@dojo/db";
import { CATEGORIES } from "../categories.js";

export function metaRoutes(db: Db) {
  const router = new Hono();

  router.get("/categories", async (c) => {
    return c.json(CATEGORIES);
  });

  router.get("/presets", async (c) => {
    const presets = await db
      .select()
      .from(profiles)
      .where(sql`${profiles.isPreset} = true`)
      .orderBy(profiles.name);
    return c.json(presets);
  });

  router.get("/stats", async (c) => {
    const [skillResult] = await db.select({ count: sql<number>`count(*)` }).from(skills);
    const [agentResult] = await db.select({ count: sql<number>`count(*)` }).from(agents);
    const [profileResult] = await db.select({ count: sql<number>`count(*)` }).from(profiles);

    return c.json({
      skillCount: Number(skillResult.count),
      agentCount: Number(agentResult.count),
      profileCount: Number(profileResult.count),
      categories: Object.keys(CATEGORIES).length,
    });
  });

  return router;
}
