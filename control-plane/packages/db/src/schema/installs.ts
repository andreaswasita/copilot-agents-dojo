import { pgTable, uuid, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { profiles } from "./profiles.js";

export const installHistory = pgTable("install_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id").references(() => profiles.id),
  targetPath: text("target_path").notNull(),
  skillsInstalled: jsonb("skills_installed").$type<string[]>().notNull().default([]),
  agentsInstalled: jsonb("agents_installed").$type<string[]>().notNull().default([]),
  installedAt: timestamp("installed_at", { withTimezone: true }).notNull().defaultNow(),
  status: text("status").notNull().default("completed"),
});

export type InstallRecord = typeof installHistory.$inferSelect;
export type NewInstallRecord = typeof installHistory.$inferInsert;
