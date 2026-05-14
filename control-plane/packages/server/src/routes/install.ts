import { Hono } from "hono";
import { desc, eq } from "drizzle-orm";
import { installHistory, skills, agents, profiles } from "@dojo/db";
import type { Db } from "@dojo/db";
import { generateInstructions } from "../generator.js";
import { installToProject } from "../installer.js";

export function installRoutes(db: Db, dojoRoot: string) {
  const router = new Hono();

  // POST /api/install
  router.post("/", async (c) => {
    const body = await c.req.json<{
      targetPath: string;
      skills: string[];
      agents: string[];
      codeStandards?: Record<string, boolean>;
      profileId?: string;
      includeMemory?: boolean;
      wireMcp?: boolean;
    }>();

    // Fetch skill/agent markdown from DB
    const allSkills = await db.select().from(skills);
    const allAgents = await db.select().from(agents);

    const selectedSkills = allSkills
      .filter((s) => body.skills.includes(s.slug))
      .map((s) => ({ slug: s.slug, name: s.name, markdown: s.markdown }));

    const selectedAgents = allAgents
      .filter((a) => body.agents.includes(a.slug))
      .map((a) => ({ slug: a.slug, name: a.name, markdown: a.markdown }));

    const instructionsContent = generateInstructions(
      selectedSkills,
      selectedAgents,
      body.codeStandards || {},
      { memoryEnabled: Boolean(body.includeMemory) }
    );

    const result = installToProject({
      targetPath: body.targetPath,
      dojoRoot,
      skills: body.skills,
      agents: body.agents,
      instructionsContent,
      includeMemory: body.includeMemory,
      wireMcp: body.wireMcp,
    });

    // Record in history
    const record = await db
      .insert(installHistory)
      .values({
        profileId: body.profileId || null,
        targetPath: body.targetPath,
        skillsInstalled: result.copiedSkills,
        agentsInstalled: result.copiedAgents,
        status: result.errors.length > 0 ? "partial" : "completed",
      })
      .returning();

    return c.json({ install: record[0], result });
  });

  // GET /api/install/preview
  router.get("/preview", async (c) => {
    const skillSlugs = c.req.query("skills")?.split(",").filter(Boolean) || [];
    const agentSlugs = c.req.query("agents")?.split(",").filter(Boolean) || [];

    const allSkills = await db.select().from(skills);
    const allAgents = await db.select().from(agents);

    const selectedSkills = allSkills
      .filter((s) => skillSlugs.includes(s.slug))
      .map((s) => ({ slug: s.slug, name: s.name, markdown: s.markdown }));
    const selectedAgents = allAgents
      .filter((a) => agentSlugs.includes(a.slug))
      .map((a) => ({ slug: a.slug, name: a.name, markdown: a.markdown }));

    const preview = generateInstructions(selectedSkills, selectedAgents, {});
    return c.json({ preview, skillCount: selectedSkills.length, agentCount: selectedAgents.length });
  });

  // GET /api/install/history
  router.get("/history", async (c) => {
    const results = await db
      .select()
      .from(installHistory)
      .orderBy(desc(installHistory.installedAt))
      .limit(50);
    return c.json(results);
  });

  return router;
}
