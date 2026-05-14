import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { createDb, skills, agents } from "@dojo/db";
import { eq } from "drizzle-orm";
import type { Db } from "@dojo/db";
import { skillRoutes } from "./routes/skills.js";
import { agentRoutes } from "./routes/agents.js";
import { profileRoutes } from "./routes/profiles.js";
import { installRoutes } from "./routes/install.js";
import { metaRoutes } from "./routes/meta.js";
import { memoryRoutes } from "./routes/memory.js";
import { scanAllSkills, scanAllAgents } from "./scanner.js";
import { scanAllMemory } from "./memory-scanner.js";
import { memoryEntries } from "@dojo/db";

const PORT = Number(process.env.PORT) || 3131;
const DOJO_ROOT = process.env.DOJO_ROOT || "../../";

// Factory function to create app with injectable DB
export function createApp(db: Db, dojoRoot = DOJO_ROOT) {
  const app = new Hono();

  app.use("/*", cors());

  app.onError((err, c) => {
    console.error("API error:", err);
    return c.json({ error: "Internal server error" }, 500);
  });

  // Mount routes
  app.route("/api/skills", skillRoutes(db, dojoRoot));
  app.route("/api/agents", agentRoutes(db));
  app.route("/api/profiles", profileRoutes(db));
  app.route("/api/install", installRoutes(db, dojoRoot));
  app.route("/api/memory", memoryRoutes(db, dojoRoot));
  app.route("/api", metaRoutes(db));

  // Health check
  app.get("/api/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }));

  return app;
}

// Lazy app getter for production (only connects when accessed)
let _app: ReturnType<typeof createApp> | null = null;
export function getApp() {
  if (!_app) _app = createApp(createDb());
  return _app;
}

// Scan and upsert on startup
async function scanAndUpsert(db: Db, dojoRoot: string) {
  console.log("Scanning skills and agents...");

  const scannedSkills = await scanAllSkills(dojoRoot);
  for (const skill of scannedSkills) {
    const existing = await db.select().from(skills).where(eq(skills.slug, skill.slug)).limit(1);
    if (existing.length > 0) {
      await db.update(skills).set({ ...skill, updatedAt: new Date() }).where(eq(skills.slug, skill.slug));
    } else {
      await db.insert(skills).values(skill);
    }
  }
  console.log(`Scanned ${scannedSkills.length} skills`);

  const scannedAgents = await scanAllAgents(dojoRoot);
  for (const agent of scannedAgents) {
    const existing = await db.select().from(agents).where(eq(agents.slug, agent.slug)).limit(1);
    if (existing.length > 0) {
      await db.update(agents).set({ ...agent, updatedAt: new Date() }).where(eq(agents.slug, agent.slug));
    } else {
      await db.insert(agents).values(agent);
    }
  }
  console.log(`Scanned ${scannedAgents.length} agents`);

  const scannedMemory = await scanAllMemory(dojoRoot);
  for (const entry of scannedMemory) {
    const existing = await db.select().from(memoryEntries).where(eq(memoryEntries.slug, entry.slug)).limit(1);
    if (existing.length > 0) {
      await db.update(memoryEntries).set({ ...entry, updatedAt: new Date() }).where(eq(memoryEntries.slug, entry.slug));
    } else {
      await db.insert(memoryEntries).values(entry);
    }
  }
  console.log(`Scanned ${scannedMemory.length} memory entries`);
}

// Only start server when run directly (not imported for testing)
if (import.meta.url === `file://${process.argv[1]}`) {
  const db = createDb();
  const app = createApp(db);
  scanAndUpsert(db, DOJO_ROOT)
    .then(() => {
      serve({ fetch: app.fetch, port: PORT }, (info) => {
        console.log(`Dojo Control Plane running on http://localhost:${info.port}`);
      });
    })
    .catch((err) => {
      console.error("Startup failed:", err);
      process.exit(1);
    });
}
