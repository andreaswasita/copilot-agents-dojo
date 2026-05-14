import { pgTable, uuid, text, jsonb, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const skills = pgTable(
  "skills",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    category: text("category").notNull().default("uncategorized"),
    categoryIcon: text("category_icon").notNull().default(""),
    categoryLabel: text("category_label").notNull().default(""),
    markdown: text("markdown").notNull().default(""),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    filePath: text("file_path").notNull(),
    fileInventory: jsonb("file_inventory").$type<string[]>().notNull().default([]),
    lastScannedAt: timestamp("last_scanned_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("skills_slug_idx").on(table.slug)]
);

export type Skill = typeof skills.$inferSelect;
export type NewSkill = typeof skills.$inferInsert;
