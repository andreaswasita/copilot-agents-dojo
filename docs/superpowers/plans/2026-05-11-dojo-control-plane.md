# Dojo Control Plane — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a localhost web control plane for the Copilot Agents Dojo — a React + Vite + Hono + Drizzle + PostgreSQL application that replaces the terminal-only CLI marketplace with a visual skill browser, agent catalog, profile builder, and installer.

**Architecture:** TypeScript pnpm monorepo under `control-plane/` with three packages: `db` (Drizzle ORM + PostgreSQL schema), `server` (Hono API on :3131), and `ui` (React + Vite SPA on :5173). The server scans `skills/*/SKILL.md` and `agents/*.md` on startup, upserts into PostgreSQL, and serves a REST API. The UI renders a dojo-themed marketplace with search, filter, and install-to-project flow.

**Tech Stack:** TypeScript, pnpm workspaces, React 19, Vite 6, Hono, Drizzle ORM, PostgreSQL 16, Tailwind CSS 4, React Router 7, react-markdown

**Spec:** `docs/superpowers/specs/2026-05-11-dojo-control-plane-design.md`

---

## File Structure

```
control-plane/
├── package.json                      # pnpm workspace root
├── pnpm-workspace.yaml               # workspace config
├── tsconfig.base.json                # shared TS config
├── docker-compose.yml                # PostgreSQL 16 service
├── .env.example                      # env template
├── README.md                         # setup instructions
├── packages/
│   ├── db/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── drizzle.config.ts
│   │   ├── src/
│   │   │   ├── index.ts              # DB connection + re-exports
│   │   │   ├── schema/
│   │   │   │   ├── skills.ts
│   │   │   │   ├── agents.ts
│   │   │   │   ├── profiles.ts
│   │   │   │   ├── installs.ts
│   │   │   │   └── index.ts
│   │   │   └── seed.ts               # Preset profiles seeder
│   │   └── drizzle/                   # Generated migrations
│   ├── server/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── src/
│   │   │   ├── index.ts              # Hono app + startup scan
│   │   │   ├── scanner.ts            # Filesystem scanner
│   │   │   ├── generator.ts          # copilot-instructions.md builder
│   │   │   ├── installer.ts          # Copy files to target
│   │   │   ├── categories.ts         # Category definitions
│   │   │   └── routes/
│   │   │       ├── skills.ts
│   │   │       ├── agents.ts
│   │   │       ├── profiles.ts
│   │   │       ├── install.ts
│   │   │       └── meta.ts
│   │   └── tests/
│   │       ├── scanner.test.ts
│   │       ├── generator.test.ts
│   │       └── routes.test.ts
│   └── ui/
│       ├── package.json
│       ├── vite.config.ts
│       ├── index.html
│       ├── src/
│       │   ├── main.tsx
│       │   ├── App.tsx
│       │   ├── index.css
│       │   ├── lib/api.ts
│       │   ├── hooks/
│       │   │   ├── useSkills.ts
│       │   │   ├── useAgents.ts
│       │   │   ├── useProfiles.ts
│       │   │   └── useSelection.ts
│       │   ├── components/
│       │   │   ├── DojoHeader.tsx
│       │   │   ├── ThemeToggle.tsx
│       │   │   ├── SkillCard.tsx
│       │   │   ├── AgentCard.tsx
│       │   │   ├── SearchBar.tsx
│       │   │   ├── CategoryNav.tsx
│       │   │   ├── TagFilter.tsx
│       │   │   ├── SelectionTray.tsx
│       │   │   ├── MarkdownViewer.tsx
│       │   │   ├── ProfileBuilder.tsx
│       │   │   └── InstallPreview.tsx
│       │   └── pages/
│       │       ├── Home.tsx
│       │       ├── SkillBrowser.tsx
│       │       ├── SkillDetail.tsx
│       │       ├── AgentBrowser.tsx
│       │       ├── AgentDetail.tsx
│       │       ├── Profiles.tsx
│       │       └── Install.tsx
│       └── public/favicon.svg
```

---


### Task 1: Monorepo Scaffolding

**Files:**
- Create: `control-plane/package.json`
- Create: `control-plane/pnpm-workspace.yaml`
- Create: `control-plane/tsconfig.base.json`
- Create: `control-plane/docker-compose.yml`
- Create: `control-plane/.env.example`
- Create: `control-plane/packages/db/package.json`
- Create: `control-plane/packages/db/tsconfig.json`
- Create: `control-plane/packages/server/package.json`
- Create: `control-plane/packages/server/tsconfig.json`
- Create: `control-plane/packages/ui/package.json`
- Create: `control-plane/packages/ui/tsconfig.json`
- Create: `control-plane/packages/ui/tsconfig.node.json`
- Create: `control-plane/packages/ui/vite.config.ts`
- Create: `control-plane/packages/ui/index.html`
- Create: `control-plane/packages/ui/postcss.config.js`

- [ ] **Step 1: Create root workspace files**

`control-plane/package.json`:
```json
{
  "name": "dojo-control-plane",
  "private": true,
  "scripts": {
    "dev": "pnpm -r --parallel dev",
    "build": "pnpm -r build",
    "db:generate": "pnpm --filter @dojo/db generate",
    "db:migrate": "pnpm --filter @dojo/db migrate",
    "db:seed": "pnpm --filter @dojo/db seed",
    "test": "pnpm -r test"
  },
  "engines": {
    "node": ">=20"
  }
}
```

`control-plane/pnpm-workspace.yaml`:
```yaml
packages:
  - "packages/*"
```

`control-plane/tsconfig.base.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "dist",
    "rootDir": "src",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

`control-plane/.env.example`:
```
DATABASE_URL=postgresql://dojo:dojo@localhost:5432/dojo
DOJO_ROOT=../
PORT=3131
```

- [ ] **Step 2: Create docker-compose.yml**

`control-plane/docker-compose.yml`:
```yaml
services:
  postgres:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: dojo
      POSTGRES_PASSWORD: dojo
      POSTGRES_DB: dojo
    volumes:
      - dojo_pgdata:/var/lib/postgresql/data

volumes:
  dojo_pgdata:
```

- [ ] **Step 3: Create db package**

`control-plane/packages/db/package.json`:
```json
{
  "name": "@dojo/db",
  "version": "0.0.1",
  "type": "module",
  "main": "src/index.ts",
  "scripts": {
    "generate": "drizzle-kit generate",
    "migrate": "drizzle-kit migrate",
    "seed": "tsx src/seed.ts"
  },
  "dependencies": {
    "drizzle-orm": "^0.44.0",
    "postgres": "^3.4.5"
  },
  "devDependencies": {
    "drizzle-kit": "^0.31.0",
    "tsx": "^4.19.0",
    "typescript": "^5.7.0"
  }
}
```

`control-plane/packages/db/tsconfig.json`:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

- [ ] **Step 4: Create server package**

`control-plane/packages/server/package.json`:
```json
{
  "name": "@dojo/server",
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@dojo/db": "workspace:*",
    "hono": "^4.7.0",
    "@hono/node-server": "^1.13.0",
    "gray-matter": "^4.0.3",
    "glob": "^11.0.0",
    "dotenv": "^16.4.0"
  },
  "devDependencies": {
    "tsx": "^4.19.0",
    "typescript": "^5.7.0",
    "vitest": "^3.1.0",
    "@types/node": "^22.0.0"
  }
}
```

`control-plane/packages/server/tsconfig.json`:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src", "tests"]
}
```

- [ ] **Step 5: Create UI package**

`control-plane/packages/ui/package.json`:
```json
{
  "name": "@dojo/ui",
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite --port 5173",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router": "^7.0.0",
    "react-markdown": "^9.0.0",
    "remark-gfm": "^4.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.7.0",
    "vite": "^6.0.0"
  }
}
```

`control-plane/packages/ui/vite.config.ts`:
```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3131",
        changeOrigin: true,
      },
    },
  },
});
```

`control-plane/packages/ui/index.html`:
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Dojo Control Plane</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  </head>
  <body class="bg-stone-50 text-stone-900 dark:bg-[#0a0a0f] dark:text-stone-100">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

`control-plane/packages/ui/postcss.config.js`:
```javascript
export default {
  plugins: {
    "@tailwindcss/postcss": {},
    autoprefixer: {},
  },
};
```

`control-plane/packages/ui/tsconfig.json`:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "outDir": "dist",
    "rootDir": "src",
    "noEmit": true
  },
  "include": ["src"]
}
```

`control-plane/packages/ui/tsconfig.node.json`:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 6: Install dependencies and verify**

Run:
```bash
cd control-plane && pnpm install
```
Expected: Lockfile created, all packages linked

- [ ] **Step 7: Start PostgreSQL**

Run:
```bash
cd control-plane && docker compose up -d
```
Expected: PostgreSQL running on port 5432

- [ ] **Step 8: Commit**

```bash
git add control-plane/
git commit -m "feat(control-plane): scaffold pnpm monorepo with db, server, ui packages"
```

---


### Task 2: Database Schema + Migrations

**Files:**
- Create: `control-plane/packages/db/drizzle.config.ts`
- Create: `control-plane/packages/db/src/schema/skills.ts`
- Create: `control-plane/packages/db/src/schema/agents.ts`
- Create: `control-plane/packages/db/src/schema/profiles.ts`
- Create: `control-plane/packages/db/src/schema/installs.ts`
- Create: `control-plane/packages/db/src/schema/index.ts`
- Create: `control-plane/packages/db/src/index.ts`
- Create: `control-plane/packages/db/src/seed.ts`

- [ ] **Step 1: Create Drizzle config**

`control-plane/packages/db/drizzle.config.ts`:
```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgresql://dojo:dojo@localhost:5432/dojo",
  },
});
```

- [ ] **Step 2: Create skills schema**

`control-plane/packages/db/src/schema/skills.ts`:
```typescript
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
```

- [ ] **Step 3: Create agents schema**

`control-plane/packages/db/src/schema/agents.ts`:
```typescript
import { pgTable, uuid, text, jsonb, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const agents = pgTable(
  "agents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    agentType: text("agent_type").notNull().default(""),
    activation: text("activation").notNull().default(""),
    applyTo: jsonb("apply_to").$type<string[]>().notNull().default([]),
    markdown: text("markdown").notNull().default(""),
    filePath: text("file_path").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("agents_slug_idx").on(table.slug)]
);

export type Agent = typeof agents.$inferSelect;
export type NewAgent = typeof agents.$inferInsert;
```

- [ ] **Step 4: Create profiles schema**

`control-plane/packages/db/src/schema/profiles.ts`:
```typescript
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
```

- [ ] **Step 5: Create install_history schema**

`control-plane/packages/db/src/schema/installs.ts`:
```typescript
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
```

- [ ] **Step 6: Create barrel export**

`control-plane/packages/db/src/schema/index.ts`:
```typescript
export { skills, type Skill, type NewSkill } from "./skills.js";
export { agents, type Agent, type NewAgent } from "./agents.js";
export { profiles, type Profile, type NewProfile } from "./profiles.js";
export { installHistory, type InstallRecord, type NewInstallRecord } from "./installs.js";
```

- [ ] **Step 7: Create DB connection module**

`control-plane/packages/db/src/index.ts`:
```typescript
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
```

- [ ] **Step 8: Create seed script with 5 presets**

`control-plane/packages/db/src/seed.ts`:
```typescript
import { createDb, profiles } from "./index.js";
import { eq } from "drizzle-orm";

const PRESETS = [
  {
    name: "Full Dojo \u{1f3ef}",
    isPreset: true,
    skills: [
      "plan-before-code", "subagent-strategy", "self-improvement",
      "verify-before-done", "demand-elegance", "autonomous-bug-fix",
      "brainstorming", "using-git-worktrees", "executing-plans",
      "requesting-code-review", "receiving-code-review",
      "finishing-a-development-branch", "dispatching-parallel-agents",
      "code-review", "refactoring", "test-writing",
      "pr-workflow", "debugging", "codebase-onboarding",
      "skill-creator", "using-superpowers", "writing-skills",
    ],
    agents: ["software-engineer", "code-reviewer"],
    instructions: {},
  },
  {
    name: "Lean \u26a1",
    isPreset: true,
    skills: [
      "plan-before-code", "verify-before-done", "demand-elegance",
      "executing-plans", "finishing-a-development-branch",
      "code-review", "test-writing", "debugging",
    ],
    agents: ["software-engineer"],
    instructions: {},
  },
  {
    name: "TDD Focus \u{1f9ea}",
    isPreset: true,
    skills: [
      "plan-before-code", "verify-before-done",
      "test-writing", "debugging", "executing-plans",
      "autonomous-bug-fix",
    ],
    agents: ["software-engineer"],
    instructions: {},
  },
  {
    name: "Code Review Focus \u{1f50d}",
    isPreset: true,
    skills: [
      "code-review", "requesting-code-review",
      "receiving-code-review", "demand-elegance",
      "pr-workflow", "refactoring",
    ],
    agents: ["code-reviewer"],
    instructions: {},
  },
  {
    name: "Onboarding \u{1f4d6}",
    isPreset: true,
    skills: [
      "codebase-onboarding", "plan-before-code",
      "verify-before-done", "using-superpowers",
    ],
    agents: ["software-engineer"],
    instructions: {},
  },
];

async function seed() {
  const db = createDb();

  for (const preset of PRESETS) {
    const existing = await db
      .select()
      .from(profiles)
      .where(eq(profiles.name, preset.name))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(profiles).values(preset);
      console.log(`Seeded preset: ${preset.name}`);
    } else {
      console.log(`Preset already exists: ${preset.name}`);
    }
  }

  console.log("Seed complete");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
```

- [ ] **Step 9: Generate migration and run**

Run:
```bash
cd control-plane && pnpm db:generate
```
Expected: Migration SQL files created in `packages/db/drizzle/`

Run:
```bash
cd control-plane && pnpm db:migrate
```
Expected: Tables created in PostgreSQL

- [ ] **Step 10: Run seed**

Run:
```bash
cd control-plane && pnpm db:seed
```
Expected: 5 preset profiles inserted

- [ ] **Step 11: Commit**

```bash
git add control-plane/packages/db/
git commit -m "feat(control-plane): add Drizzle schema, migrations, and preset seed"
```

---


### Task 3: Categories + Scanner (Port of scanner.py)

**Files:**
- Create: `control-plane/packages/server/src/categories.ts`
- Create: `control-plane/packages/server/src/scanner.ts`
- Create: `control-plane/packages/server/tests/scanner.test.ts`

- [ ] **Step 1: Write the categories module**

`control-plane/packages/server/src/categories.ts`:
```typescript
export interface CategoryDef {
  icon: string;
  label: string;
  skills: string[];
}

export const CATEGORIES: Record<string, CategoryDef> = {
  "core-kata": {
    icon: "\u{1f94b}",
    label: "Core Kata \u2014 \u57fa\u672c\u578b",
    skills: [
      "plan-before-code",
      "subagent-strategy",
      "self-improvement",
      "verify-before-done",
      "demand-elegance",
      "autonomous-bug-fix",
    ],
  },
  "flow-waza": {
    icon: "\u{1f504}",
    label: "Flow Waza \u2014 \u6d41\u308c\u6280",
    skills: [
      "brainstorming",
      "using-git-worktrees",
      "executing-plans",
      "requesting-code-review",
      "receiving-code-review",
      "finishing-a-development-branch",
      "dispatching-parallel-agents",
    ],
  },
  "practical-kumite": {
    icon: "\u2694\ufe0f",
    label: "Practical Kumite \u2014 \u5b9f\u8df5\u7d44\u624b",
    skills: [
      "code-review",
      "refactoring",
      "test-writing",
      "pr-workflow",
      "debugging",
      "codebase-onboarding",
    ],
  },
  "meta-do": {
    icon: "\u9053",
    label: "Meta D\u014d \u2014 \u9053",
    skills: ["skill-creator", "using-superpowers", "writing-skills"],
  },
};

export function categoryForSkill(slug: string): {
  category: string;
  icon: string;
  label: string;
} {
  for (const [category, def] of Object.entries(CATEGORIES)) {
    if (def.skills.includes(slug)) {
      return { category, icon: def.icon, label: def.label };
    }
  }
  return { category: "uncategorized", icon: "\u{1f4e6}", label: "Uncategorized" };
}
```

- [ ] **Step 2: Write failing scanner test**

`control-plane/packages/server/tests/scanner.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { parseFrontmatter, scanSkillDir, scanAgentFile } from "../src/scanner.js";

describe("parseFrontmatter", () => {
  it("extracts YAML frontmatter from markdown", () => {
    const content = `---
name: test-skill
description: A test skill
---

# Body content`;

    const result = parseFrontmatter(content);
    expect(result.data.name).toBe("test-skill");
    expect(result.data.description).toBe("A test skill");
    expect(result.content).toContain("# Body content");
  });

  it("returns empty data for content without frontmatter", () => {
    const result = parseFrontmatter("# Just markdown");
    expect(result.data).toEqual({});
    expect(result.content).toContain("# Just markdown");
  });
});

describe("scanSkillDir", () => {
  it("parses a SKILL.md file into a NewSkill object", () => {
    const skillMd = `---
name: plan-before-code
description: >-
  Think before you code. Create a plan.
---

# Plan Before Code

Detailed instructions here.`;

    const result = scanSkillDir("plan-before-code", skillMd, "skills/plan-before-code");
    expect(result.slug).toBe("plan-before-code");
    expect(result.name).toBe("plan-before-code");
    expect(result.description).toBe("Think before you code. Create a plan.");
    expect(result.category).toBe("core-kata");
    expect(result.categoryIcon).toBe("\u{1f94b}");
    expect(result.markdown).toContain("# Plan Before Code");
  });

  it("assigns uncategorized to unknown skills", () => {
    const skillMd = `---
name: unknown-skill
description: Something new
---
# New`;

    const result = scanSkillDir("unknown-skill", skillMd, "skills/unknown-skill");
    expect(result.category).toBe("uncategorized");
  });
});

describe("scanAgentFile", () => {
  it("parses an agent markdown file", () => {
    const agentMd = `---
name: Software Engineer
type: development
description: Implements features and fixes bugs
activation: Always active
applyTo:
  - "**/*.ts"
  - "**/*.py"
---

# Software Engineer Agent`;

    const result = scanAgentFile("software-engineer", agentMd, "agents/software-engineer.md");
    expect(result.slug).toBe("software-engineer");
    expect(result.name).toBe("Software Engineer");
    expect(result.agentType).toBe("development");
    expect(result.applyTo).toEqual(["**/*.ts", "**/*.py"]);
    expect(result.markdown).toContain("# Software Engineer Agent");
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd control-plane && pnpm --filter @dojo/server test`
Expected: FAIL \u2014 cannot resolve `../src/scanner.js`

- [ ] **Step 4: Implement scanner**

`control-plane/packages/server/src/scanner.ts`:
```typescript
import matter from "gray-matter";
import { glob } from "glob";
import { readFileSync, readdirSync } from "node:fs";
import { join, basename, dirname } from "node:path";
import { categoryForSkill } from "./categories.js";
import type { NewSkill, NewAgent } from "@dojo/db";

export function parseFrontmatter(content: string): { data: Record<string, unknown>; content: string } {
  try {
    const parsed = matter(content);
    return { data: parsed.data as Record<string, unknown>, content: parsed.content };
  } catch {
    return { data: {}, content };
  }
}

function generateTags(description: string): string[] {
  const stopWords = new Set([
    "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "is", "it", "that", "this", "from", "as", "be",
    "are", "was", "were", "been", "has", "have", "had", "do", "does",
    "did", "will", "would", "could", "should", "may", "might",
  ]);
  return description
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w))
    .slice(0, 8);
}

function getFileInventory(dirPath: string): string[] {
  try {
    return readdirSync(dirPath, { recursive: true })
      .map(String)
      .filter((f) => !f.startsWith("."));
  } catch {
    return [];
  }
}

export function scanSkillDir(slug: string, content: string, dirPath: string): NewSkill {
  const { data, content: body } = parseFrontmatter(content);
  const name = (data.name as string) || slug;
  const description = (data.description as string) || "";
  const { category, icon, label } = categoryForSkill(slug);

  return {
    slug,
    name,
    description,
    category,
    categoryIcon: icon,
    categoryLabel: label,
    markdown: body.trim(),
    tags: generateTags(description),
    filePath: dirPath,
    fileInventory: getFileInventory(dirPath),
    lastScannedAt: new Date(),
  };
}

export function scanAgentFile(slug: string, content: string, filePath: string): NewAgent {
  const { data, content: body } = parseFrontmatter(content);
  return {
    slug,
    name: (data.name as string) || slug,
    description: (data.description as string) || "",
    agentType: (data.type as string) || "",
    activation: (data.activation as string) || "",
    applyTo: (data.applyTo as string[]) || [],
    markdown: body.trim(),
    filePath,
  };
}

export async function scanAllSkills(dojoRoot: string): Promise<NewSkill[]> {
  const skillsDir = join(dojoRoot, "skills");
  const dirs = readdirSync(skillsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  const results: NewSkill[] = [];
  for (const dir of dirs) {
    const skillFile = join(skillsDir, dir, "SKILL.md");
    try {
      const content = readFileSync(skillFile, "utf-8");
      results.push(scanSkillDir(dir, content, join(skillsDir, dir)));
    } catch {
      // Skip dirs without SKILL.md
    }
  }
  return results;
}

export async function scanAllAgents(dojoRoot: string): Promise<NewAgent[]> {
  const agentsDir = join(dojoRoot, "agents");
  const files = await glob("*.md", { cwd: agentsDir });

  return files.map((file) => {
    const content = readFileSync(join(agentsDir, file), "utf-8");
    const slug = basename(file, ".md");
    return scanAgentFile(slug, content, join(agentsDir, file));
  });
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd control-plane && pnpm --filter @dojo/server test`
Expected: All scanner tests PASS

- [ ] **Step 6: Commit**

```bash
git add control-plane/packages/server/src/categories.ts control-plane/packages/server/src/scanner.ts control-plane/packages/server/tests/scanner.test.ts
git commit -m "feat(control-plane): add categories + filesystem scanner (port of scanner.py)"
```

---


### Task 4: Generator + Installer (Port of generator.py)

**Files:**
- Create: `control-plane/packages/server/src/generator.ts`
- Create: `control-plane/packages/server/src/installer.ts`
- Create: `control-plane/packages/server/tests/generator.test.ts`

- [ ] **Step 1: Write failing generator test**

`control-plane/packages/server/tests/generator.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { generateInstructions, CODE_STANDARDS } from "../src/generator.js";

describe("CODE_STANDARDS", () => {
  it("has entries for typescript, python, java, go, dotnet", () => {
    expect(Object.keys(CODE_STANDARDS)).toEqual(
      expect.arrayContaining(["typescript", "python", "java", "go", "dotnet"])
    );
  });
});

describe("generateInstructions", () => {
  it("generates markdown with skill sections", () => {
    const skills = [
      { slug: "plan-before-code", name: "plan-before-code", markdown: "# Plan\n\nAlways plan first." },
      { slug: "verify-before-done", name: "verify-before-done", markdown: "# Verify\n\nCheck your work." },
    ];
    const agents = [
      { slug: "software-engineer", name: "Software Engineer", markdown: "# SE\n\nBuild things." },
    ];

    const result = generateInstructions(skills, agents, {});

    expect(result).toContain("# Plan");
    expect(result).toContain("Always plan first.");
    expect(result).toContain("# Verify");
    expect(result).toContain("# SE");
  });

  it("includes code standards when provided", () => {
    const result = generateInstructions([], [], { typescript: true });
    expect(result).toContain("TypeScript");
  });

  it("returns empty-ish doc for no skills or agents", () => {
    const result = generateInstructions([], [], {});
    expect(typeof result).toBe("string");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd control-plane && pnpm --filter @dojo/server test`
Expected: FAIL -- cannot resolve `../src/generator.js`

- [ ] **Step 3: Implement generator**

`control-plane/packages/server/src/generator.ts`:
```typescript
export const CODE_STANDARDS: Record<string, string> = {
  typescript: `## TypeScript Standards
- Use strict mode, no \`any\` types
- Prefer \`const\` over \`let\`, never use \`var\`
- Use async/await over raw Promises
- Export explicit types for all public APIs
- Use template literals over string concatenation`,

  python: `## Python Standards
- Follow PEP 8, use type hints on all functions
- Use pathlib over os.path
- Prefer f-strings over .format()
- Use dataclasses or Pydantic for data structures
- Run black + ruff before committing`,

  java: `## Java Standards
- Follow Google Java Style Guide
- Use records for immutable data
- Prefer Optional over null returns
- Use try-with-resources for AutoCloseable
- Write Javadoc for all public methods`,

  go: `## Go Standards
- Follow Effective Go guidelines
- Use \`errors.Is\`/\`errors.As\` for error checking
- Prefer table-driven tests
- Use context.Context for cancellation
- Run \`go vet\` and \`golangci-lint\` before committing`,

  dotnet: `## .NET Standards
- Follow Microsoft C# coding conventions
- Use nullable reference types
- Prefer pattern matching over type checking
- Use \`IAsyncEnumerable\` for streaming
- Use \`record\` types for DTOs`,
};

interface SkillInput {
  slug: string;
  name: string;
  markdown: string;
}

interface AgentInput {
  slug: string;
  name: string;
  markdown: string;
}

export function generateInstructions(
  skills: SkillInput[],
  agents: AgentInput[],
  codeStandards: Record<string, boolean>
): string {
  const sections: string[] = [];

  sections.push("# Copilot Instructions\n");
  sections.push("> Generated by Dojo Control Plane\n");

  // Code standards
  const activeStandards = Object.entries(codeStandards)
    .filter(([, enabled]) => enabled)
    .map(([lang]) => CODE_STANDARDS[lang])
    .filter(Boolean);

  if (activeStandards.length > 0) {
    sections.push("---\n");
    sections.push("# Code Standards\n");
    sections.push(activeStandards.join("\n\n"));
    sections.push("");
  }

  // Skills
  if (skills.length > 0) {
    sections.push("---\n");
    sections.push("# Skills\n");
    for (const skill of skills) {
      sections.push(skill.markdown);
      sections.push("");
    }
  }

  // Agents
  if (agents.length > 0) {
    sections.push("---\n");
    sections.push("# Agents\n");
    for (const agent of agents) {
      sections.push(agent.markdown);
      sections.push("");
    }
  }

  return sections.join("\n");
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd control-plane && pnpm --filter @dojo/server test`
Expected: All generator tests PASS

- [ ] **Step 5: Implement installer**

`control-plane/packages/server/src/installer.ts`:
```typescript
import { writeFileSync, mkdirSync, copyFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";

export interface InstallOptions {
  targetPath: string;
  dojoRoot: string;
  skills: string[];
  agents: string[];
  instructionsContent: string;
}

export interface InstallResult {
  copiedSkills: string[];
  copiedAgents: string[];
  instructionsPath: string;
  errors: string[];
}

export function installToProject(options: InstallOptions): InstallResult {
  const { targetPath, dojoRoot, skills, agents, instructionsContent } = options;
  const result: InstallResult = {
    copiedSkills: [],
    copiedAgents: [],
    instructionsPath: "",
    errors: [],
  };

  // Write copilot-instructions.md
  const githubDir = join(targetPath, ".github");
  mkdirSync(githubDir, { recursive: true });
  const instructionsPath = join(githubDir, "copilot-instructions.md");
  writeFileSync(instructionsPath, instructionsContent, "utf-8");
  result.instructionsPath = instructionsPath;

  // Copy skill directories
  const targetSkillsDir = join(githubDir, "skills");
  for (const slug of skills) {
    const srcDir = join(dojoRoot, "skills", slug);
    if (!existsSync(srcDir)) {
      result.errors.push(`Skill not found: ${slug}`);
      continue;
    }
    const destDir = join(targetSkillsDir, slug);
    mkdirSync(destDir, { recursive: true });
    copyDirRecursive(srcDir, destDir);
    result.copiedSkills.push(slug);
  }

  // Copy agent files
  const targetAgentsDir = join(githubDir, "agents");
  for (const slug of agents) {
    const srcFile = join(dojoRoot, "agents", `${slug}.md`);
    if (!existsSync(srcFile)) {
      result.errors.push(`Agent not found: ${slug}`);
      continue;
    }
    mkdirSync(targetAgentsDir, { recursive: true });
    copyFileSync(srcFile, join(targetAgentsDir, `${slug}.md`));
    result.copiedAgents.push(slug);
  }

  return result;
}

function copyDirRecursive(src: string, dest: string): void {
  const entries = readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);
    if (entry.isDirectory()) {
      mkdirSync(destPath, { recursive: true });
      copyDirRecursive(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}
```

- [ ] **Step 6: Commit**

```bash
git add control-plane/packages/server/src/generator.ts control-plane/packages/server/src/installer.ts control-plane/packages/server/tests/generator.test.ts
git commit -m "feat(control-plane): add generator + installer (port of generator.py)"
```

---


### Task 5: Hono Server + API Routes

**Files:**
- Create: `control-plane/packages/server/src/index.ts`
- Create: `control-plane/packages/server/src/routes/skills.ts`
- Create: `control-plane/packages/server/src/routes/agents.ts`
- Create: `control-plane/packages/server/src/routes/profiles.ts`
- Create: `control-plane/packages/server/src/routes/install.ts`
- Create: `control-plane/packages/server/src/routes/meta.ts`
- Create: `control-plane/packages/server/tests/routes.test.ts`

- [ ] **Step 1: Write failing routes test**

`control-plane/packages/server/tests/routes.test.ts`:
```typescript
import { describe, it, expect, beforeAll } from "vitest";
import { app } from "../src/index.js";

describe("API Routes", () => {
  describe("GET /api/skills", () => {
    it("returns an array", async () => {
      const res = await app.request("/api/skills");
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(Array.isArray(body)).toBe(true);
    });
  });

  describe("GET /api/agents", () => {
    it("returns an array", async () => {
      const res = await app.request("/api/agents");
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(Array.isArray(body)).toBe(true);
    });
  });

  describe("GET /api/categories", () => {
    it("returns category definitions", async () => {
      const res = await app.request("/api/categories");
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty("core-kata");
      expect(body["core-kata"]).toHaveProperty("icon");
      expect(body["core-kata"]).toHaveProperty("label");
    });
  });

  describe("GET /api/stats", () => {
    it("returns stats object", async () => {
      const res = await app.request("/api/stats");
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty("skillCount");
      expect(body).toHaveProperty("agentCount");
      expect(body).toHaveProperty("profileCount");
    });
  });

  describe("GET /api/skills/tags", () => {
    it("returns array of tag strings", async () => {
      const res = await app.request("/api/skills/tags");
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(Array.isArray(body)).toBe(true);
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd control-plane && pnpm --filter @dojo/server test`
Expected: FAIL -- cannot resolve `../src/index.js`

- [ ] **Step 3: Implement skills routes**

`control-plane/packages/server/src/routes/skills.ts`:
```typescript
import { Hono } from "hono";
import { eq, ilike, sql, and, inArray } from "drizzle-orm";
import { skills } from "@dojo/db";
import type { Db } from "@dojo/db";

export function skillRoutes(db: Db) {
  const router = new Hono();

  // GET /api/skills?category=X&search=X&tag=X
  router.get("/", async (c) => {
    const category = c.req.query("category");
    const search = c.req.query("search");
    const tag = c.req.query("tag");

    const conditions = [];
    if (category) conditions.push(eq(skills.category, category));
    if (search) conditions.push(ilike(skills.name, `%${search}%`));

    let query = db.select().from(skills);
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    let results = await query.orderBy(skills.category, skills.name);

    if (tag) {
      results = results.filter((s) => s.tags.includes(tag));
    }

    return c.json(results);
  });

  // GET /api/skills/tags
  router.get("/tags", async (c) => {
    const allSkills = await db.select({ tags: skills.tags }).from(skills);
    const tagSet = new Set<string>();
    for (const s of allSkills) {
      for (const t of s.tags) tagSet.add(t);
    }
    return c.json([...tagSet].sort());
  });

  // GET /api/skills/:slug
  router.get("/:slug", async (c) => {
    const slug = c.req.param("slug");
    const result = await db.select().from(skills).where(eq(skills.slug, slug)).limit(1);
    if (result.length === 0) return c.json({ error: "Skill not found" }, 404);
    return c.json(result[0]);
  });

  // POST /api/skills/scan
  router.post("/scan", async (c) => {
    // Trigger re-scan -- delegated to index.ts scanAndUpsert
    return c.json({ message: "Scan triggered" });
  });

  return router;
}
```

- [ ] **Step 4: Implement agents routes**

`control-plane/packages/server/src/routes/agents.ts`:
```typescript
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
```

- [ ] **Step 5: Implement profiles routes**

`control-plane/packages/server/src/routes/profiles.ts`:
```typescript
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
```

- [ ] **Step 6: Implement install routes**

`control-plane/packages/server/src/routes/install.ts`:
```typescript
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
      body.codeStandards || {}
    );

    const result = installToProject({
      targetPath: body.targetPath,
      dojoRoot,
      skills: body.skills,
      agents: body.agents,
      instructionsContent,
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
```

- [ ] **Step 7: Implement meta routes**

`control-plane/packages/server/src/routes/meta.ts`:
```typescript
import { Hono } from "hono";
import { sql } from "drizzle-orm";
import { skills, agents, profiles } from "@dojo/db";
import type { Db } from "@dojo/db";
import { CATEGORIES } from "../categories.js";

export function metaRoutes(db: Db) {
  const router = new Hono();

  router.get("/categories", async (c) => {
    return c.json(CATEGORIES);
  });

  router.get("/presets", async (c) => {
    const presets = await db
      .select()
      .from(profiles)
      .where(sql`${profiles.isPreset} = true`)
      .orderBy(profiles.name);
    return c.json(presets);
  });

  router.get("/stats", async (c) => {
    const [skillResult] = await db.select({ count: sql<number>`count(*)` }).from(skills);
    const [agentResult] = await db.select({ count: sql<number>`count(*)` }).from(agents);
    const [profileResult] = await db.select({ count: sql<number>`count(*)` }).from(profiles);

    return c.json({
      skillCount: Number(skillResult.count),
      agentCount: Number(agentResult.count),
      profileCount: Number(profileResult.count),
      categories: Object.keys(CATEGORIES).length,
    });
  });

  return router;
}
```

- [ ] **Step 8: Implement main server entry**

`control-plane/packages/server/src/index.ts`:
```typescript
import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { createDb, skills, agents } from "@dojo/db";
import { eq } from "drizzle-orm";
import { skillRoutes } from "./routes/skills.js";
import { agentRoutes } from "./routes/agents.js";
import { profileRoutes } from "./routes/profiles.js";
import { installRoutes } from "./routes/install.js";
import { metaRoutes } from "./routes/meta.js";
import { scanAllSkills, scanAllAgents } from "./scanner.js";

const PORT = Number(process.env.PORT) || 3131;
const DOJO_ROOT = process.env.DOJO_ROOT || "../";

const db = createDb();
export const app = new Hono();

app.use("/*", cors());

// Mount routes
app.route("/api/skills", skillRoutes(db));
app.route("/api/agents", agentRoutes(db));
app.route("/api/profiles", profileRoutes(db));
app.route("/api/install", installRoutes(db, DOJO_ROOT));
app.route("/api", metaRoutes(db));

// Health check
app.get("/api/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }));

// Scan and upsert on startup
async function scanAndUpsert() {
  console.log("Scanning skills and agents...");

  const scannedSkills = await scanAllSkills(DOJO_ROOT);
  for (const skill of scannedSkills) {
    const existing = await db.select().from(skills).where(eq(skills.slug, skill.slug)).limit(1);
    if (existing.length > 0) {
      await db.update(skills).set({ ...skill, updatedAt: new Date() }).where(eq(skills.slug, skill.slug));
    } else {
      await db.insert(skills).values(skill);
    }
  }
  console.log(`Scanned ${scannedSkills.length} skills`);

  const scannedAgents = await scanAllAgents(DOJO_ROOT);
  for (const agent of scannedAgents) {
    const existing = await db.select().from(agents).where(eq(agents.slug, agent.slug)).limit(1);
    if (existing.length > 0) {
      await db.update(agents).set({ ...agent, updatedAt: new Date() }).where(eq(agents.slug, agent.slug));
    } else {
      await db.insert(agents).values(agent);
    }
  }
  console.log(`Scanned ${scannedAgents.length} agents`);
}

// Only start server when run directly (not imported for testing)
if (process.argv[1]?.endsWith("index.ts") || process.argv[1]?.endsWith("index.js")) {
  scanAndUpsert()
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
```

- [ ] **Step 9: Run tests to verify all pass**

Run: `cd control-plane && pnpm --filter @dojo/server test`
Expected: All route tests PASS (tests use `app.request()` without starting a server)

- [ ] **Step 10: Commit**

```bash
git add control-plane/packages/server/
git commit -m "feat(control-plane): add Hono server with all API routes"
```

---


### Task 6: UI Foundation — Theme, Layout, Router

**Files:**
- Create: `control-plane/packages/ui/src/main.tsx`
- Create: `control-plane/packages/ui/src/App.tsx`
- Create: `control-plane/packages/ui/src/index.css`
- Create: `control-plane/packages/ui/src/lib/api.ts`
- Create: `control-plane/packages/ui/src/components/DojoHeader.tsx`
- Create: `control-plane/packages/ui/src/components/ThemeToggle.tsx`
- Create: `control-plane/packages/ui/public/favicon.svg`

- [ ] **Step 1: Create Tailwind CSS with dojo theme tokens**

`control-plane/packages/ui/src/index.css`:
```css
@import "tailwindcss";

@theme {
  --color-dojo-bg: #0a0a0f;
  --color-dojo-surface: #16161d;
  --color-dojo-primary: #06b6d4;
  --color-dojo-accent: #d4a406;
  --color-dojo-border: #2a2a35;
  --color-dojo-muted: #9ca3af;

  --color-dojo-kata: #6366f1;
  --color-dojo-waza: #06b6d4;
  --color-dojo-kumite: #ef4444;
  --color-dojo-do: #f59e0b;

  --font-family-jp: "Noto Sans JP", system-ui, sans-serif;
}

@layer base {
  :root {
    --bg: #fafaf9;
    --surface: #ffffff;
    --text: #1c1917;
    --primary: #0891b2;
    --accent: #b45309;
    --border: #e7e5e4;
    --muted: #78716c;
  }
  .dark {
    --bg: #0a0a0f;
    --surface: #16161d;
    --text: #fafaf9;
    --primary: #06b6d4;
    --accent: #d4a406;
    --border: #2a2a35;
    --muted: #9ca3af;
  }
  body {
    background-color: var(--bg);
    color: var(--text);
    font-family: system-ui, -apple-system, sans-serif;
  }
}
```

- [ ] **Step 2: Create API client**

`control-plane/packages/ui/src/lib/api.ts`:
```typescript
const BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

export const api = {
  skills: {
    list: (params?: Record<string, string>) => {
      const qs = params ? "?" + new URLSearchParams(params).toString() : "";
      return request<any[]>(`/skills${qs}`);
    },
    get: (slug: string) => request<any>(`/skills/${slug}`),
    tags: () => request<string[]>("/skills/tags"),
    scan: () => request<any>("/skills/scan", { method: "POST" }),
  },
  agents: {
    list: () => request<any[]>("/agents"),
    get: (slug: string) => request<any>(`/agents/${slug}`),
  },
  profiles: {
    list: () => request<any[]>("/profiles"),
    get: (id: string) => request<any>(`/profiles/${id}`),
    create: (data: any) => request<any>("/profiles", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      request<any>(`/profiles/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => request<any>(`/profiles/${id}`, { method: "DELETE" }),
  },
  install: {
    run: (data: any) => request<any>("/install", { method: "POST", body: JSON.stringify(data) }),
    preview: (skills: string[], agents: string[]) =>
      request<any>(`/install/preview?skills=${skills.join(",")}&agents=${agents.join(",")}`),
    history: () => request<any[]>("/install/history"),
  },
  meta: {
    categories: () => request<any>("/categories"),
    presets: () => request<any[]>("/presets"),
    stats: () => request<any>("/stats"),
  },
};
```

- [ ] **Step 3: Create ThemeToggle component**

`control-plane/packages/ui/src/components/ThemeToggle.tsx`:
```tsx
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("dojo-theme") !== "light";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("dojo-theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      className="p-2 rounded-lg hover:bg-[var(--surface)] transition-colors"
      aria-label="Toggle theme"
    >
      {dark ? "\u2600\ufe0f" : "\ud83c\udf19"}
    </button>
  );
}
```

- [ ] **Step 4: Create DojoHeader component**

`control-plane/packages/ui/src/components/DojoHeader.tsx`:
```tsx
import { Link, useLocation } from "react-router";
import { ThemeToggle } from "./ThemeToggle.js";

const NAV_ITEMS = [
  { path: "/", label: "Home", icon: "\ud83c\udfe0" },
  { path: "/skills", label: "Skills", icon: "\u{1f94b}" },
  { path: "/agents", label: "Agents", icon: "\ud83e\udd16" },
  { path: "/profiles", label: "Profiles", icon: "\ud83d\udccb" },
  { path: "/install", label: "Install", icon: "\ud83d\udce6" },
];

export function DojoHeader() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">\u{1f94b}</span>
            <span className="text-xl font-bold text-[var(--primary)]">
              Dojo <span className="text-[var(--muted)] font-normal text-sm">Control Plane</span>
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.path === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                      : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)]"
                  }`}
                >
                  <span className="mr-1">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 5: Create App router + main entry**

`control-plane/packages/ui/src/App.tsx`:
```tsx
import { BrowserRouter, Routes, Route } from "react-router";
import { DojoHeader } from "./components/DojoHeader.js";
import { Home } from "./pages/Home.js";
import { SkillBrowser } from "./pages/SkillBrowser.js";
import { SkillDetail } from "./pages/SkillDetail.js";
import { AgentBrowser } from "./pages/AgentBrowser.js";
import { AgentDetail } from "./pages/AgentDetail.js";
import { Profiles } from "./pages/Profiles.js";
import { Install } from "./pages/Install.js";

export function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <DojoHeader />
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/skills" element={<SkillBrowser />} />
            <Route path="/skills/:slug" element={<SkillDetail />} />
            <Route path="/agents" element={<AgentBrowser />} />
            <Route path="/agents/:slug" element={<AgentDetail />} />
            <Route path="/profiles" element={<Profiles />} />
            <Route path="/install" element={<Install />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
```

`control-plane/packages/ui/src/main.tsx`:
```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.js";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

- [ ] **Step 6: Create favicon**

`control-plane/packages/ui/public/favicon.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <text y=".9em" font-size="90">&#x1F94B;</text>
</svg>
```

- [ ] **Step 7: Create placeholder pages (stubs)**

Create minimal placeholder components for all pages so the router works. Each page will be fully implemented in subsequent tasks.

`control-plane/packages/ui/src/pages/Home.tsx`:
```tsx
export function Home() {
  return <div><h1 className="text-3xl font-bold">Dojo Control Plane</h1><p className="text-[var(--muted)] mt-2">Welcome to the dojo.</p></div>;
}
```

`control-plane/packages/ui/src/pages/SkillBrowser.tsx`:
```tsx
export function SkillBrowser() {
  return <div><h1 className="text-2xl font-bold">Skills</h1></div>;
}
```

`control-plane/packages/ui/src/pages/SkillDetail.tsx`:
```tsx
export function SkillDetail() {
  return <div><h1 className="text-2xl font-bold">Skill Detail</h1></div>;
}
```

`control-plane/packages/ui/src/pages/AgentBrowser.tsx`:
```tsx
export function AgentBrowser() {
  return <div><h1 className="text-2xl font-bold">Agents</h1></div>;
}
```

`control-plane/packages/ui/src/pages/AgentDetail.tsx`:
```tsx
export function AgentDetail() {
  return <div><h1 className="text-2xl font-bold">Agent Detail</h1></div>;
}
```

`control-plane/packages/ui/src/pages/Profiles.tsx`:
```tsx
export function Profiles() {
  return <div><h1 className="text-2xl font-bold">Profiles</h1></div>;
}
```

`control-plane/packages/ui/src/pages/Install.tsx`:
```tsx
export function Install() {
  return <div><h1 className="text-2xl font-bold">Install</h1></div>;
}
```

- [ ] **Step 8: Verify UI dev server starts**

Run: `cd control-plane && pnpm --filter @dojo/ui dev`
Expected: Vite dev server at http://localhost:5173, renders DojoHeader with nav

- [ ] **Step 9: Commit**

```bash
git add control-plane/packages/ui/
git commit -m "feat(control-plane): add UI foundation with dojo theme, router, header"
```

---


### Task 7: Data Hooks

**Files:**
- Create: `control-plane/packages/ui/src/hooks/useSkills.ts`
- Create: `control-plane/packages/ui/src/hooks/useAgents.ts`
- Create: `control-plane/packages/ui/src/hooks/useProfiles.ts`
- Create: `control-plane/packages/ui/src/hooks/useSelection.ts`

- [ ] **Step 1: Create useSkills hook**

`control-plane/packages/ui/src/hooks/useSkills.ts`:
```typescript
import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api.js";

export function useSkills(filters?: { category?: string; search?: string; tag?: string }) {
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSkills = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (filters?.category) params.category = filters.category;
      if (filters?.search) params.search = filters.search;
      if (filters?.tag) params.tag = filters.tag;
      const data = await api.skills.list(Object.keys(params).length > 0 ? params : undefined);
      setSkills(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch skills");
    } finally {
      setLoading(false);
    }
  }, [filters?.category, filters?.search, filters?.tag]);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  return { skills, loading, error, refetch: fetchSkills };
}

export function useSkill(slug: string) {
  const [skill, setSkill] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.skills
      .get(slug)
      .then(setSkill)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  return { skill, loading, error };
}

export function useTags() {
  const [tags, setTags] = useState<string[]>([]);
  useEffect(() => {
    api.skills.tags().then(setTags).catch(() => {});
  }, []);
  return tags;
}
```

- [ ] **Step 2: Create useAgents hook**

`control-plane/packages/ui/src/hooks/useAgents.ts`:
```typescript
import { useState, useEffect } from "react";
import { api } from "../lib/api.js";

export function useAgents() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.agents
      .list()
      .then(setAgents)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { agents, loading, error };
}

export function useAgent(slug: string) {
  const [agent, setAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.agents
      .get(slug)
      .then(setAgent)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  return { agent, loading, error };
}
```

- [ ] **Step 3: Create useProfiles hook**

`control-plane/packages/ui/src/hooks/useProfiles.ts`:
```typescript
import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api.js";

export function useProfiles() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.profiles.list();
      setProfiles(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  return { profiles, loading, refetch: fetchProfiles };
}
```

- [ ] **Step 4: Create useSelection hook (selection tray state)**

`control-plane/packages/ui/src/hooks/useSelection.ts`:
```typescript
import { useState, useCallback, useMemo } from "react";

interface Selection {
  skills: Set<string>;
  agents: Set<string>;
}

export function useSelection() {
  const [selection, setSelection] = useState<Selection>({
    skills: new Set(),
    agents: new Set(),
  });

  const toggleSkill = useCallback((slug: string) => {
    setSelection((prev) => {
      const next = new Set(prev.skills);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return { ...prev, skills: next };
    });
  }, []);

  const toggleAgent = useCallback((slug: string) => {
    setSelection((prev) => {
      const next = new Set(prev.agents);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return { ...prev, agents: next };
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelection({ skills: new Set(), agents: new Set() });
  }, []);

  const loadFromProfile = useCallback((skills: string[], agents: string[]) => {
    setSelection({
      skills: new Set(skills),
      agents: new Set(agents),
    });
  }, []);

  const totalSelected = useMemo(
    () => selection.skills.size + selection.agents.size,
    [selection.skills.size, selection.agents.size]
  );

  return {
    selectedSkills: selection.skills,
    selectedAgents: selection.agents,
    toggleSkill,
    toggleAgent,
    clearSelection,
    loadFromProfile,
    totalSelected,
    skillSlugs: [...selection.skills],
    agentSlugs: [...selection.agents],
  };
}
```

- [ ] **Step 5: Commit**

```bash
git add control-plane/packages/ui/src/hooks/
git commit -m "feat(control-plane): add React data hooks for skills, agents, profiles, selection"
```

---


### Task 8: Skill Browser Components + Page

**Files:**
- Create: `control-plane/packages/ui/src/components/SkillCard.tsx`
- Create: `control-plane/packages/ui/src/components/SearchBar.tsx`
- Create: `control-plane/packages/ui/src/components/CategoryNav.tsx`
- Create: `control-plane/packages/ui/src/components/TagFilter.tsx`
- Modify: `control-plane/packages/ui/src/pages/SkillBrowser.tsx`

- [ ] **Step 1: Create SearchBar component**

`control-plane/packages/ui/src/components/SearchBar.tsx`:
```tsx
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = "Search skills..." }: SearchBarProps) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">
        &#x1F50D;
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 focus:border-[var(--primary)] transition-all"
      />
    </div>
  );
}
```

- [ ] **Step 2: Create CategoryNav component**

`control-plane/packages/ui/src/components/CategoryNav.tsx`:
```tsx
const CATEGORY_COLORS: Record<string, string> = {
  "core-kata": "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
  "flow-waza": "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
  "practical-kumite": "bg-red-500/10 text-red-400 border-red-500/30",
  "meta-do": "bg-amber-500/10 text-amber-400 border-amber-500/30",
  uncategorized: "bg-gray-500/10 text-gray-400 border-gray-500/30",
};

interface CategoryNavProps {
  categories: Record<string, { icon: string; label: string }>;
  selected: string | null;
  onSelect: (category: string | null) => void;
}

export function CategoryNav({ categories, selected, onSelect }: CategoryNavProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(null)}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
          selected === null
            ? "bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/30"
            : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]"
        }`}
      >
        All
      </button>
      {Object.entries(categories).map(([key, { icon, label }]) => (
        <button
          key={key}
          onClick={() => onSelect(key === selected ? null : key)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
            key === selected
              ? CATEGORY_COLORS[key] || CATEGORY_COLORS.uncategorized
              : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]"
          }`}
        >
          {icon} {label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Create TagFilter component**

`control-plane/packages/ui/src/components/TagFilter.tsx`:
```tsx
interface TagFilterProps {
  tags: string[];
  selected: string | null;
  onSelect: (tag: string | null) => void;
}

export function TagFilter({ tags, selected, onSelect }: TagFilterProps) {
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.slice(0, 20).map((tag) => (
        <button
          key={tag}
          onClick={() => onSelect(tag === selected ? null : tag)}
          className={`px-2 py-0.5 rounded-md text-xs font-medium transition-all ${
            tag === selected
              ? "bg-[var(--primary)] text-white"
              : "bg-[var(--surface)] text-[var(--muted)] border border-[var(--border)] hover:text-[var(--text)]"
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Create SkillCard component**

`control-plane/packages/ui/src/components/SkillCard.tsx`:
```tsx
import { Link } from "react-router";

const CATEGORY_ACCENT: Record<string, string> = {
  "core-kata": "border-l-indigo-500",
  "flow-waza": "border-l-cyan-500",
  "practical-kumite": "border-l-red-500",
  "meta-do": "border-l-amber-500",
  uncategorized: "border-l-gray-500",
};

interface SkillCardProps {
  skill: {
    slug: string;
    name: string;
    description: string;
    category: string;
    categoryIcon: string;
    categoryLabel: string;
    tags: string[];
  };
  selected: boolean;
  onToggle: () => void;
}

export function SkillCard({ skill, selected, onToggle }: SkillCardProps) {
  const accent = CATEGORY_ACCENT[skill.category] || CATEGORY_ACCENT.uncategorized;

  return (
    <div
      className={`group relative rounded-xl border-l-4 ${accent} border border-[var(--border)] bg-[var(--surface)] p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg ${
        selected ? "ring-2 ring-[var(--primary)]" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <Link to={`/skills/${skill.slug}`} className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">
            {skill.name}
          </h3>
          <p className="text-xs text-[var(--muted)] mt-1 line-clamp-2">{skill.description}</p>
        </Link>

        <button
          onClick={(e) => {
            e.preventDefault();
            onToggle();
          }}
          className={`shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
            selected
              ? "bg-[var(--primary)] border-[var(--primary)] text-white"
              : "border-[var(--border)] hover:border-[var(--primary)]"
          }`}
          aria-label={selected ? "Deselect skill" : "Select skill"}
        >
          {selected && (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
      </div>

      <div className="flex items-center gap-2 mt-3">
        <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--bg)] text-[var(--muted)]">
          {skill.categoryIcon} {skill.categoryLabel}
        </span>
        {skill.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="text-xs text-[var(--muted)]">
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Implement SkillBrowser page**

Modify `control-plane/packages/ui/src/pages/SkillBrowser.tsx`:
```tsx
import { useState, useEffect } from "react";
import { useSkills, useTags } from "../hooks/useSkills.js";
import { useSelection } from "../hooks/useSelection.js";
import { SkillCard } from "../components/SkillCard.js";
import { SearchBar } from "../components/SearchBar.js";
import { CategoryNav } from "../components/CategoryNav.js";
import { TagFilter } from "../components/TagFilter.js";
import { SelectionTray } from "../components/SelectionTray.js";
import { api } from "../lib/api.js";

export function SkillBrowser() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [tag, setTag] = useState<string | null>(null);
  const [categories, setCategories] = useState<Record<string, { icon: string; label: string }>>({});

  const { skills, loading } = useSkills({
    search: search || undefined,
    category: category || undefined,
    tag: tag || undefined,
  });
  const tags = useTags();
  const selection = useSelection();

  useEffect(() => {
    api.meta.categories().then(setCategories).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Skills Marketplace</h1>
        <p className="text-[var(--muted)] mt-1">Browse, search, and select skills for your project</p>
      </div>

      <div className="space-y-4">
        <SearchBar value={search} onChange={setSearch} />
        <CategoryNav categories={categories} selected={category} onSelect={setCategory} />
        <TagFilter tags={tags} selected={tag} onSelect={setTag} />
      </div>

      {loading ? (
        <div className="text-center py-12 text-[var(--muted)]">Loading skills...</div>
      ) : skills.length === 0 ? (
        <div className="text-center py-12 text-[var(--muted)]">No skills found</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill) => (
            <SkillCard
              key={skill.slug}
              skill={skill}
              selected={selection.selectedSkills.has(skill.slug)}
              onToggle={() => selection.toggleSkill(skill.slug)}
            />
          ))}
        </div>
      )}

      {selection.totalSelected > 0 && (
        <SelectionTray
          skillCount={selection.selectedSkills.size}
          agentCount={selection.selectedAgents.size}
          onClear={selection.clearSelection}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 6: Create SelectionTray component (stub for now, full in Task 10)**

`control-plane/packages/ui/src/components/SelectionTray.tsx`:
```tsx
import { Link } from "react-router";

interface SelectionTrayProps {
  skillCount: number;
  agentCount: number;
  onClear: () => void;
}

export function SelectionTray({ skillCount, agentCount, onClear }: SelectionTrayProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-[var(--text)]">
            {skillCount} skills, {agentCount} agents selected
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onClear}
            className="px-3 py-1.5 text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors"
          >
            Clear
          </button>
          <Link
            to="/install"
            className="px-4 py-1.5 rounded-lg text-sm font-medium bg-[var(--primary)] text-white hover:opacity-90 transition-opacity"
          >
            Install &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Verify SkillBrowser renders**

Run: `cd control-plane && pnpm --filter @dojo/ui dev`
Navigate to http://localhost:5173/skills
Expected: Category nav, search bar, tag filter, skill cards grid render correctly

- [ ] **Step 8: Commit**

```bash
git add control-plane/packages/ui/src/components/ control-plane/packages/ui/src/pages/SkillBrowser.tsx
git commit -m "feat(control-plane): add skill browser with search, filter, category nav"
```

---


### Task 9: Skill Detail + Markdown Viewer

**Files:**
- Create: `control-plane/packages/ui/src/components/MarkdownViewer.tsx`
- Modify: `control-plane/packages/ui/src/pages/SkillDetail.tsx`

- [ ] **Step 1: Create MarkdownViewer component**

`control-plane/packages/ui/src/components/MarkdownViewer.tsx`:
```tsx
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownViewerProps {
  content: string;
}

export function MarkdownViewer({ content }: MarkdownViewerProps) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-[var(--text)] prose-p:text-[var(--text)] prose-code:text-[var(--primary)] prose-pre:bg-[var(--bg)] prose-pre:border prose-pre:border-[var(--border)]">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
```

- [ ] **Step 2: Implement SkillDetail page**

`control-plane/packages/ui/src/pages/SkillDetail.tsx`:
```tsx
import { useParams, Link } from "react-router";
import { useSkill } from "../hooks/useSkills.js";
import { MarkdownViewer } from "../components/MarkdownViewer.js";

export function SkillDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { skill, loading, error } = useSkill(slug!);

  if (loading) return <div className="text-center py-12 text-[var(--muted)]">Loading...</div>;
  if (error || !skill) return <div className="text-center py-12 text-red-400">Skill not found</div>;

  return (
    <div className="space-y-6">
      <div>
        <Link to="/skills" className="text-sm text-[var(--primary)] hover:underline">
          &larr; Back to Skills
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <div>
          <h1 className="text-3xl font-bold">{skill.name}</h1>
          <p className="text-[var(--muted)] mt-2">{skill.description}</p>
          <div className="mt-6 border-t border-[var(--border)] pt-6">
            <MarkdownViewer content={skill.markdown} />
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 space-y-3">
            <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider">Details</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-[var(--muted)]">Category:</span>{" "}
                <span>{skill.categoryIcon} {skill.categoryLabel}</span>
              </div>
              <div>
                <span className="text-[var(--muted)]">Slug:</span>{" "}
                <code className="text-xs bg-[var(--bg)] px-1.5 py-0.5 rounded">{skill.slug}</code>
              </div>
              <div>
                <span className="text-[var(--muted)]">Path:</span>{" "}
                <code className="text-xs bg-[var(--bg)] px-1.5 py-0.5 rounded break-all">{skill.filePath}</code>
              </div>
            </div>
          </div>

          {skill.tags.length > 0 && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">Tags</h3>
              <div className="flex flex-wrap gap-1.5">
                {skill.tags.map((tag: string) => (
                  <span key={tag} className="text-xs px-2 py-0.5 rounded-md bg-[var(--bg)] text-[var(--muted)]">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {skill.fileInventory?.length > 0 && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">Files</h3>
              <ul className="text-xs space-y-1 text-[var(--muted)]">
                {skill.fileInventory.map((f: string) => (
                  <li key={f} className="font-mono">{f}</li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify detail page**

Navigate to http://localhost:5173/skills/plan-before-code
Expected: Full markdown rendering with sidebar metadata

- [ ] **Step 4: Commit**

```bash
git add control-plane/packages/ui/src/components/MarkdownViewer.tsx control-plane/packages/ui/src/pages/SkillDetail.tsx
git commit -m "feat(control-plane): add skill detail page with markdown viewer"
```

---

### Task 10: Agent Browser + Detail Pages

**Files:**
- Create: `control-plane/packages/ui/src/components/AgentCard.tsx`
- Modify: `control-plane/packages/ui/src/pages/AgentBrowser.tsx`
- Modify: `control-plane/packages/ui/src/pages/AgentDetail.tsx`

- [ ] **Step 1: Create AgentCard component**

`control-plane/packages/ui/src/components/AgentCard.tsx`:
```tsx
import { Link } from "react-router";

interface AgentCardProps {
  agent: {
    slug: string;
    name: string;
    description: string;
    agentType: string;
    activation: string;
  };
  selected: boolean;
  onToggle: () => void;
}

export function AgentCard({ agent, selected, onToggle }: AgentCardProps) {
  return (
    <div
      className={`group rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg ${
        selected ? "ring-2 ring-[var(--primary)]" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <Link to={`/agents/${agent.slug}`} className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">&#x1F916;</span>
            <h3 className="text-sm font-semibold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">
              {agent.name}
            </h3>
          </div>
          <p className="text-xs text-[var(--muted)] mt-1 line-clamp-2">{agent.description}</p>
        </Link>

        <button
          onClick={(e) => {
            e.preventDefault();
            onToggle();
          }}
          className={`shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
            selected
              ? "bg-[var(--primary)] border-[var(--primary)] text-white"
              : "border-[var(--border)] hover:border-[var(--primary)]"
          }`}
        >
          {selected && (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
      </div>

      <div className="flex items-center gap-2 mt-3">
        <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--bg)] text-[var(--muted)]">
          {agent.agentType}
        </span>
        <span className="text-xs text-[var(--muted)]">{agent.activation}</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Implement AgentBrowser page**

`control-plane/packages/ui/src/pages/AgentBrowser.tsx`:
```tsx
import { useAgents } from "../hooks/useAgents.js";
import { useSelection } from "../hooks/useSelection.js";
import { AgentCard } from "../components/AgentCard.js";
import { SelectionTray } from "../components/SelectionTray.js";

export function AgentBrowser() {
  const { agents, loading } = useAgents();
  const selection = useSelection();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Agents</h1>
        <p className="text-[var(--muted)] mt-1">Browse available coding agents</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-[var(--muted)]">Loading agents...</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <AgentCard
              key={agent.slug}
              agent={agent}
              selected={selection.selectedAgents.has(agent.slug)}
              onToggle={() => selection.toggleAgent(agent.slug)}
            />
          ))}
        </div>
      )}

      {selection.totalSelected > 0 && (
        <SelectionTray
          skillCount={selection.selectedSkills.size}
          agentCount={selection.selectedAgents.size}
          onClear={selection.clearSelection}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 3: Implement AgentDetail page**

`control-plane/packages/ui/src/pages/AgentDetail.tsx`:
```tsx
import { useParams, Link } from "react-router";
import { useAgent } from "../hooks/useAgents.js";
import { MarkdownViewer } from "../components/MarkdownViewer.js";

export function AgentDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { agent, loading, error } = useAgent(slug!);

  if (loading) return <div className="text-center py-12 text-[var(--muted)]">Loading...</div>;
  if (error || !agent) return <div className="text-center py-12 text-red-400">Agent not found</div>;

  return (
    <div className="space-y-6">
      <Link to="/agents" className="text-sm text-[var(--primary)] hover:underline">&larr; Back to Agents</Link>

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <span>&#x1F916;</span> {agent.name}
          </h1>
          <p className="text-[var(--muted)] mt-2">{agent.description}</p>
          <div className="mt-6 border-t border-[var(--border)] pt-6">
            <MarkdownViewer content={agent.markdown} />
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 space-y-3">
            <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider">Details</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-[var(--muted)]">Type:</span> <span>{agent.agentType}</span>
              </div>
              <div>
                <span className="text-[var(--muted)]">Activation:</span> <span>{agent.activation}</span>
              </div>
              {agent.applyTo?.length > 0 && (
                <div>
                  <span className="text-[var(--muted)]">Applies to:</span>
                  <ul className="mt-1 space-y-0.5">
                    {agent.applyTo.map((pattern: string) => (
                      <li key={pattern} className="font-mono text-xs text-[var(--muted)]">{pattern}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add control-plane/packages/ui/src/components/AgentCard.tsx control-plane/packages/ui/src/pages/AgentBrowser.tsx control-plane/packages/ui/src/pages/AgentDetail.tsx
git commit -m "feat(control-plane): add agent browser and detail pages"
```

---


### Task 11: Profiles Page + Profile Builder

**Files:**
- Create: `control-plane/packages/ui/src/components/ProfileBuilder.tsx`
- Modify: `control-plane/packages/ui/src/pages/Profiles.tsx`

- [ ] **Step 1: Create ProfileBuilder component**

`control-plane/packages/ui/src/components/ProfileBuilder.tsx`:
```tsx
import { useState } from "react";
import { api } from "../lib/api.js";

interface ProfileBuilderProps {
  existingSkills: { slug: string; name: string }[];
  existingAgents: { slug: string; name: string }[];
  onCreated: () => void;
}

export function ProfileBuilder({ existingSkills, existingAgents, onCreated }: ProfileBuilderProps) {
  const [name, setName] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [selectedAgents, setSelectedAgents] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const toggleSkill = (slug: string) => {
    setSelectedSkills((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const toggleAgent = (slug: string) => {
    setSelectedAgents((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await api.profiles.create({
        name: name.trim(),
        skills: [...selectedSkills],
        agents: [...selectedAgents],
        instructions: {},
      });
      setName("");
      setSelectedSkills(new Set());
      setSelectedAgents(new Set());
      onCreated();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
      <h3 className="text-lg font-semibold">Create New Profile</h3>

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Profile name..."
        className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder-[var(--muted)]"
      />

      <div>
        <h4 className="text-sm font-medium text-[var(--muted)] mb-2">Skills ({selectedSkills.size})</h4>
        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
          {existingSkills.map((s) => (
            <button
              key={s.slug}
              onClick={() => toggleSkill(s.slug)}
              className={`text-xs px-2 py-1 rounded-md border transition-all ${
                selectedSkills.has(s.slug)
                  ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                  : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-[var(--muted)] mb-2">Agents ({selectedAgents.size})</h4>
        <div className="flex flex-wrap gap-1.5">
          {existingAgents.map((a) => (
            <button
              key={a.slug}
              onClick={() => toggleAgent(a.slug)}
              className={`text-xs px-2 py-1 rounded-md border transition-all ${
                selectedAgents.has(a.slug)
                  ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                  : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              {a.name}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving || !name.trim()}
        className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--primary)] text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {saving ? "Saving..." : "Create Profile"}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Implement Profiles page**

`control-plane/packages/ui/src/pages/Profiles.tsx`:
```tsx
import { useEffect, useState } from "react";
import { useProfiles } from "../hooks/useProfiles.js";
import { ProfileBuilder } from "../components/ProfileBuilder.js";
import { api } from "../lib/api.js";

export function Profiles() {
  const { profiles, loading, refetch } = useProfiles();
  const [skills, setSkills] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [showBuilder, setShowBuilder] = useState(false);

  useEffect(() => {
    api.skills.list().then(setSkills).catch(() => {});
    api.agents.list().then(setAgents).catch(() => {});
  }, []);

  const handleDelete = async (id: string) => {
    await api.profiles.delete(id);
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Profiles</h1>
          <p className="text-[var(--muted)] mt-1">Manage skill & agent profiles</p>
        </div>
        <button
          onClick={() => setShowBuilder(!showBuilder)}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--primary)] text-white hover:opacity-90"
        >
          {showBuilder ? "Cancel" : "+ New Profile"}
        </button>
      </div>

      {showBuilder && (
        <ProfileBuilder
          existingSkills={skills}
          existingAgents={agents}
          onCreated={() => {
            setShowBuilder(false);
            refetch();
          }}
        />
      )}

      {loading ? (
        <div className="text-center py-12 text-[var(--muted)]">Loading...</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{profile.name}</h3>
                  {profile.isPreset && (
                    <span className="text-xs text-[var(--accent)] font-medium">Preset</span>
                  )}
                </div>
                {!profile.isPreset && (
                  <button
                    onClick={() => handleDelete(profile.id)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                )}
              </div>
              <div className="text-xs text-[var(--muted)]">
                {profile.skills?.length || 0} skills, {profile.agents?.length || 0} agents
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add control-plane/packages/ui/src/components/ProfileBuilder.tsx control-plane/packages/ui/src/pages/Profiles.tsx
git commit -m "feat(control-plane): add profiles page with profile builder"
```

---

### Task 12: Install Page

**Files:**
- Create: `control-plane/packages/ui/src/components/InstallPreview.tsx`
- Modify: `control-plane/packages/ui/src/pages/Install.tsx`

- [ ] **Step 1: Create InstallPreview component**

`control-plane/packages/ui/src/components/InstallPreview.tsx`:
```tsx
import { MarkdownViewer } from "./MarkdownViewer.js";

interface InstallPreviewProps {
  preview: string;
  skillCount: number;
  agentCount: number;
}

export function InstallPreview({ preview, skillCount, agentCount }: InstallPreviewProps) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider">
          Preview: copilot-instructions.md
        </h3>
        <span className="text-xs text-[var(--muted)]">
          {skillCount} skills, {agentCount} agents
        </span>
      </div>
      <div className="max-h-96 overflow-y-auto border border-[var(--border)] rounded-lg p-4 bg-[var(--bg)]">
        <MarkdownViewer content={preview} />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Implement Install page**

`control-plane/packages/ui/src/pages/Install.tsx`:
```tsx
import { useState, useEffect } from "react";
import { api } from "../lib/api.js";
import { InstallPreview } from "../components/InstallPreview.js";

export function Install() {
  const [targetPath, setTargetPath] = useState("");
  const [skills, setSkills] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [preview, setPreview] = useState<{ preview: string; skillCount: number; agentCount: number } | null>(null);
  const [installing, setInstalling] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    api.skills.list().then(setSkills).catch(() => {});
    api.agents.list().then(setAgents).catch(() => {});
    api.install.history().then(setHistory).catch(() => {});
  }, []);

  const handlePreview = async () => {
    if (selectedSkills.length === 0 && selectedAgents.length === 0) return;
    const data = await api.install.preview(selectedSkills, selectedAgents);
    setPreview(data);
  };

  const handleInstall = async () => {
    if (!targetPath.trim()) return;
    setInstalling(true);
    try {
      const data = await api.install.run({
        targetPath: targetPath.trim(),
        skills: selectedSkills,
        agents: selectedAgents,
        codeStandards: {},
      });
      setResult(data);
      api.install.history().then(setHistory).catch(() => {});
    } finally {
      setInstalling(false);
    }
  };

  const toggleSkill = (slug: string) => {
    setSelectedSkills((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const toggleAgent = (slug: string) => {
    setSelectedAgents((prev) =>
      prev.includes(slug) ? prev.filter((a) => a !== slug) : [...prev, slug]
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Install to Project</h1>
        <p className="text-[var(--muted)] mt-1">Select skills and agents, then install to a target project</p>
      </div>

      {/* Target path */}
      <div>
        <label className="block text-sm font-medium mb-1">Target project path</label>
        <input
          type="text"
          value={targetPath}
          onChange={(e) => setTargetPath(e.target.value)}
          placeholder="/path/to/your/project"
          className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] placeholder-[var(--muted)]"
        />
      </div>

      {/* Skill selection */}
      <div>
        <h3 className="text-sm font-medium mb-2">Skills ({selectedSkills.length} selected)</h3>
        <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
          {skills.map((s) => (
            <button
              key={s.slug}
              onClick={() => toggleSkill(s.slug)}
              className={`text-xs px-2 py-1 rounded-md border transition-all ${
                selectedSkills.includes(s.slug)
                  ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                  : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              {s.categoryIcon} {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Agent selection */}
      <div>
        <h3 className="text-sm font-medium mb-2">Agents ({selectedAgents.length} selected)</h3>
        <div className="flex flex-wrap gap-1.5">
          {agents.map((a) => (
            <button
              key={a.slug}
              onClick={() => toggleAgent(a.slug)}
              className={`text-xs px-2 py-1 rounded-md border transition-all ${
                selectedAgents.includes(a.slug)
                  ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                  : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              &#x1F916; {a.name}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handlePreview}
          disabled={selectedSkills.length === 0 && selectedAgents.length === 0}
          className="px-4 py-2 rounded-lg text-sm font-medium border border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface)] disabled:opacity-50"
        >
          Preview
        </button>
        <button
          onClick={handleInstall}
          disabled={installing || !targetPath.trim() || (selectedSkills.length === 0 && selectedAgents.length === 0)}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--primary)] text-white hover:opacity-90 disabled:opacity-50"
        >
          {installing ? "Installing..." : "Install"}
        </button>
      </div>

      {/* Preview */}
      {preview && (
        <InstallPreview
          preview={preview.preview}
          skillCount={preview.skillCount}
          agentCount={preview.agentCount}
        />
      )}

      {/* Result */}
      {result && (
        <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-4">
          <h3 className="text-sm font-semibold text-green-400">Installation Complete</h3>
          <p className="text-xs text-[var(--muted)] mt-1">
            {result.result.copiedSkills.length} skills, {result.result.copiedAgents.length} agents installed to {targetPath}
          </p>
          {result.result.errors.length > 0 && (
            <ul className="mt-2 text-xs text-red-400">
              {result.result.errors.map((e: string, i: number) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[var(--muted)] mb-2 uppercase tracking-wider">Install History</h3>
          <div className="space-y-2">
            {history.map((h) => (
              <div
                key={h.id}
                className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-xs"
              >
                <div className="flex justify-between">
                  <span className="font-mono text-[var(--muted)]">{h.targetPath}</span>
                  <span className="text-[var(--muted)]">
                    {new Date(h.installedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-[var(--muted)] mt-1">
                  {h.skillsInstalled?.length || 0} skills, {h.agentsInstalled?.length || 0} agents — {h.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add control-plane/packages/ui/src/components/InstallPreview.tsx control-plane/packages/ui/src/pages/Install.tsx
git commit -m "feat(control-plane): add install page with preview, history, and install action"
```

---


### Task 13: Home Dashboard

**Files:**
- Modify: `control-plane/packages/ui/src/pages/Home.tsx`

- [ ] **Step 1: Implement Home dashboard**

`control-plane/packages/ui/src/pages/Home.tsx`:
```tsx
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { api } from "../lib/api.js";

interface Stats {
  skillCount: number;
  agentCount: number;
  profileCount: number;
  categories: number;
}

export function Home() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [presets, setPresets] = useState<any[]>([]);
  const [categories, setCategories] = useState<Record<string, { icon: string; label: string }>>({});

  useEffect(() => {
    api.meta.stats().then(setStats).catch(() => {});
    api.meta.presets().then(setPresets).catch(() => {});
    api.meta.categories().then(setCategories).catch(() => {});
  }, []);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold">
          <span className="text-[var(--primary)]">\u{1f94b}</span> Dojo Control Plane
        </h1>
        <p className="text-[var(--muted)] mt-2 text-lg" style={{ fontFamily: "var(--font-family-jp)" }}>
          \u9053\u5834 \u2014 The Way of Copilot Mastery
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Skills", value: stats.skillCount, icon: "\u{1f94b}", link: "/skills" },
            { label: "Agents", value: stats.agentCount, icon: "\ud83e\udd16", link: "/agents" },
            { label: "Profiles", value: stats.profileCount, icon: "\ud83d\udccb", link: "/profiles" },
            { label: "Categories", value: stats.categories, icon: "\ud83d\udcca", link: "/skills" },
          ].map((stat) => (
            <Link
              key={stat.label}
              to={stat.link}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 hover:-translate-y-0.5 hover:shadow-lg transition-all"
            >
              <div className="text-2xl">{stat.icon}</div>
              <div className="text-3xl font-bold mt-2">{stat.value}</div>
              <div className="text-sm text-[var(--muted)]">{stat.label}</div>
            </Link>
          ))}
        </div>
      )}

      {/* Categories */}
      <div>
        <h2 className="text-xl font-bold mb-4">Categories</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(categories).map(([key, { icon, label }]) => (
            <Link
              key={key}
              to={`/skills?category=${key}`}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 hover:-translate-y-0.5 hover:shadow-lg transition-all"
            >
              <div className="text-2xl">{icon}</div>
              <div className="text-sm font-medium mt-2">{label}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Presets */}
      <div>
        <h2 className="text-xl font-bold mb-4">Quick Start Presets</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {presets.map((preset) => (
            <Link
              key={preset.id}
              to="/install"
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 hover:-translate-y-0.5 hover:shadow-lg transition-all"
            >
              <h3 className="font-semibold">{preset.name}</h3>
              <p className="text-xs text-[var(--muted)] mt-1">
                {preset.skills?.length || 0} skills, {preset.agents?.length || 0} agents
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add control-plane/packages/ui/src/pages/Home.tsx
git commit -m "feat(control-plane): add home dashboard with stats, categories, presets"
```

---

### Task 14: Integration Test + README

**Files:**
- Create: `control-plane/README.md`
- Verify end-to-end flow

- [ ] **Step 1: Write README**

`control-plane/README.md`:
```markdown
# Dojo Control Plane

A web-based control plane for the [Copilot Agents Dojo](https://github.com/user/copilot-agents-dojo) \u2014 browse, search, filter, and install skills + agents visually.

## Quick Start

```bash
# 1. Start PostgreSQL
docker compose up -d

# 2. Install dependencies
pnpm install

# 3. Run migrations + seed presets
pnpm db:migrate
pnpm db:seed

# 4. Start dev servers
pnpm dev
```

- **API:** http://localhost:3131
- **UI:** http://localhost:5173

## Architecture

```
packages/
  db/       \u2192 Drizzle ORM schema + PostgreSQL migrations
  server/   \u2192 Hono API server (scans skills/agents on startup)
  ui/       \u2192 React + Vite SPA with dojo theme
```

## Environment

Copy `.env.example` to `.env` and adjust if needed:

```
DATABASE_URL=postgresql://dojo:dojo@localhost:5432/dojo
DOJO_ROOT=../
PORT=3131
```

## Development

- `pnpm dev` \u2014 starts both server and UI in parallel
- `pnpm test` \u2014 runs all tests
- `pnpm db:generate` \u2014 generates new migration after schema changes
- `pnpm db:migrate` \u2014 applies pending migrations
- `pnpm db:seed` \u2014 seeds preset profiles
```

- [ ] **Step 2: End-to-end verification**

Run the full stack and verify:

```bash
cd control-plane
docker compose up -d
pnpm install
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Open http://localhost:5173 and verify:
1. Home page shows stats (skill count, agent count, etc.)
2. Skills page lists all skills with category filtering and search
3. Clicking a skill card opens the detail page with full markdown
4. Agents page lists all agents
5. Profiles page shows 5 presets
6. Install page allows selecting skills/agents, previewing, and installing to a target path

- [ ] **Step 3: Commit**

```bash
git add control-plane/README.md
git commit -m "docs(control-plane): add README with quick start guide"
```

- [ ] **Step 4: Final commit \u2014 merge all remaining changes**

```bash
git add -A
git commit -m "feat(control-plane): complete Dojo Control Plane MVP

- Monorepo: pnpm workspaces with db, server, ui packages
- Database: Drizzle ORM + PostgreSQL with skills, agents, profiles, install_history
- Server: Hono API with filesystem scanner, generator, installer
- UI: React + Vite with dojo theme, skill browser, agent browser, profiles, install wizard
- 5 preset profiles seeded on startup
- Dark/light theme with Japanese typography touches"
```

---

