import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { profiles } from "@dojo/db";
import type { Db } from "@dojo/db";

interface ProfileInput {
  name: string;
  skills: string[];
  agents: string[];
  instructions: Record<string, unknown>;
  targetPath?: string;
}

function validateProfile(body: unknown): ProfileInput | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  if (typeof b.name !== "string" || b.name.trim().length === 0) return null;
  if (!Array.isArray(b.skills)) return null;
  if (!Array.isArray(b.agents)) return null;
  return {
    name: b.name.trim(),
    skills: b.skills.filter((s): s is string => typeof s === "string"),
    agents: b.agents.filter((a): a is string => typeof a === "string"),
    instructions: (typeof b.instructions === "object" && b.instructions !== null) ? b.instructions as Record<string, unknown> : {},
    targetPath: typeof b.targetPath === "string" ? b.targetPath : undefined,
  };
}

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
    const parsed = validateProfile(await c.req.json());
    if (!parsed) return c.json({ error: "Invalid profile data. Required: name (string), skills (array), agents (array)" }, 400);
    const result = await db.insert(profiles).values({ ...parsed, isPreset: false }).returning();
    return c.json(result[0], 201);
  });

  router.put("/:id", async (c) => {
    const id = c.req.param("id");
    const parsed = validateProfile(await c.req.json());
    if (!parsed) return c.json({ error: "Invalid profile data" }, 400);
    const result = await db
      .update(profiles)
      .set({ ...parsed, updatedAt: new Date() })
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
