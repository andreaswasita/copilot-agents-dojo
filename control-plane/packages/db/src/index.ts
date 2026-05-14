import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/index.js";

export function createDb(url?: string) {
  const connectionString = url || process.env.DATABASE_URL || "postgresql://dojo:dojo@localhost:5432/dojo";
  const client = postgres(connectionString);
  return drizzle(client, { schema });
}

export type Db = ReturnType<typeof createDb>;

export * from "./schema/index.js";
