import { pgTable, uuid, text, jsonb, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const memoryEntries = pgTable(
  "memory_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    type: text("type").notNull(),
    title: text("title").notNull(),
    date: text("date"),
    status: text("status"),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    frontmatter: jsonb("frontmatter").$type<Record<string, unknown>>().notNull().default({}),
    markdown: text("markdown").notNull().default(""),
    filePath: text("file_path").notNull(),
    lastScannedAt: timestamp("last_scanned_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("memory_entries_slug_idx").on(table.slug)]
);

export type MemoryEntry = typeof memoryEntries.$inferSelect;
export type NewMemoryEntry = typeof memoryEntries.$inferInsert;
