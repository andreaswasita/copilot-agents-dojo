import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { agents } from "@dojo/db";
import type { Db } from "@dojo/db";

export function agentRoutes(db: Db) {
  const router = new Hono();

  router.get("/", async (c) => {
    const results = await db.select().from(agents).orderBy(agents.name);
    return c.json(results);
  });

  router.get("/:slug", async (c) => {
    const slug = c.req.param("slug");
    const result = await db.select().from(agents).where(eq(agents.slug, slug)).limit(1);
    if (result.length === 0) return c.json({ error: "Agent not found" }, 404);
    return c.json(result[0]);
  });

  return router;
}
