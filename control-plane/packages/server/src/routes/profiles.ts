import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { profiles } from "@dojo/db";
import type { Db } from "@dojo/db";

export function profileRoutes(db: Db) {
  const router = new Hono();

  router.get("/", async (c) => {
    const results = await db.select().from(profiles).orderBy(profiles.name);
    return c.json(results);
  });

  router.get("/:id", async (c) => {
    const id = c.req.param("id");
    const result = await db.select().from(profiles).where(eq(profiles.id, id)).limit(1);
    if (result.length === 0) return c.json({ error: "Profile not found" }, 404);
    return c.json(result[0]);
  });

  router.post("/", async (c) => {
    const body = await c.req.json();
    const result = await db.insert(profiles).values(body).returning();
    return c.json(result[0], 201);
  });

  router.put("/:id", async (c) => {
    const id = c.req.param("id");
    const body = await c.req.json();
    const result = await db
      .update(profiles)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(profiles.id, id))
      .returning();
    if (result.length === 0) return c.json({ error: "Profile not found" }, 404);
    return c.json(result[0]);
  });

  router.delete("/:id", async (c) => {
    const id = c.req.param("id");
    const result = await db.delete(profiles).where(eq(profiles.id, id)).returning();
    if (result.length === 0) return c.json({ error: "Profile not found" }, 404);
    return c.json({ deleted: true });
  });

  return router;
}
