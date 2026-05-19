import { pgTable, uuid, text, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  isPreset: boolean("is_preset").notNull().default(false),
  skills: jsonb("skills").$type<string[]>().notNull().default([]),
  agents: jsonb("agents").$type<string[]>().notNull().default([]),
  instructions: jsonb("instructions").$type<Record<string, string>>().notNull().default({}),
  targetPath: text("target_path"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
