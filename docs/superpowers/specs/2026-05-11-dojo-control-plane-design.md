# Dojo Control Plane — Design Spec

> A web-based skill marketplace and control plane for the Copilot Agents Dojo, inspired by Paperclip AI's agent management UX. Replaces the terminal-only CLI marketplace with a rich, searchable, visual experience while preserving the dojo's martial-arts identity.

---

## Problem

The current CLI marketplace (`cli/dojo_cli/marketplace.py`) forces users through a sequential, category-by-category checkbox flow. Users can't search, can't filter, can't see full skill descriptions before selecting, and have no way to know which skills are recommended for their use case. The result: new users are overwhelmed, experienced users are frustrated, and skill discoverability is poor.

## Proposed Solution

Build a **localhost web control plane** inside `copilot-agents-dojo/control-plane/` — a TypeScript monorepo with a React + Vite frontend, Hono API server, and Drizzle ORM + PostgreSQL backend. The server scans the dojo filesystem on startup, indexes skills and agents into PostgreSQL, and serves a visual marketplace where users can browse, search, filter, and install skills to any project.

## Design Principles

1. **Dojo theme intact** — clean minimal design with Japanese typography, category icons (🥋🔄⚔️道), light/dark toggle, belt-level progression
2. **Filesystem as source of truth** — skills and agents always come from `skills/*/SKILL.md` and `agents/*.md`; the database is a cache/index
3. **Same output** — generates identical `copilot-instructions.md`, copies identical files as the current CLI
4. **CLI coexistence** — the Python CLI continues to work; the control plane is an alternative, not a replacement

---

## Architecture

### Monorepo Structure

```
control-plane/
├── package.json              # pnpm workspace root
├── pnpm-workspace.yaml
├── packages/
│   ├── db/                   # Drizzle ORM + PostgreSQL schema
│   │   ├── src/
│   │   │   ├── schema/
│   │   │   │   ├── skills.ts
│   │   │   │   ├── agents.ts
│   │   │   │   ├── profiles.ts
│   │   │   │   └── installs.ts
│   │   │   ├── index.ts
│   │   │   └── migrate.ts
│   │   └── drizzle.config.ts
│   ├── server/               # Hono API server
│   │   ├── src/
│   │   │   ├── index.ts      # Server entry, startup scan
│   │   │   ├── scanner.ts    # Filesystem → DB sync
│   │   │   ├── generator.ts  # copilot-instructions.md builder
│   │   │   ├── installer.ts  # Copy skills/agents to target
│   │   │   └── routes/
│   │   │       ├── skills.ts
│   │   │       ├── agents.ts
│   │   │       ├── profiles.ts
│   │   │       ├── install.ts
│   │   │       └── stats.ts
│   │   └── package.json
│   └── ui/                   # React + Vite SPA
│       ├── src/
│       │   ├── main.tsx
│       │   ├── App.tsx
│       │   ├── pages/
│       │   │   ├── Home.tsx          # Dashboard / marketplace home
│       │   │   ├── SkillBrowser.tsx  # Search + filter + card grid
│       │   │   ├── SkillDetail.tsx   # Full SKILL.md rendered
│       │   │   ├── AgentBrowser.tsx  # Agent cards
│       │   │   ├── AgentDetail.tsx   # Full agent .md rendered
│       │   │   ├── Profiles.tsx      # Profile manager
│       │   │   └── Install.tsx       # Install wizard
│       │   ├── components/
│       │   │   ├── DojoHeader.tsx
│       │   │   ├── SkillCard.tsx
│       │   │   ├── AgentCard.tsx
│       │   │   ├── SearchBar.tsx
│       │   │   ├── CategoryNav.tsx
│       │   │   ├── TagFilter.tsx
│       │   │   ├── SelectionTray.tsx
│       │   │   ├── MarkdownViewer.tsx
│       │   │   ├── ProfileBuilder.tsx
│       │   │   ├── InstallPreview.tsx
│       │   │   └── ThemeToggle.tsx
│       │   ├── theme/
│       │   │   ├── tokens.ts         # Color, spacing, typography
│       │   │   └── dojo-theme.css    # Custom CSS, Japanese accents
│       │   ├── hooks/
│       │   │   ├── useSkills.ts
│       │   │   ├── useAgents.ts
│       │   │   ├── useProfiles.ts
│       │   │   └── useSelection.ts
│       │   └── lib/
│       │       └── api.ts            # API client
│       ├── index.html
│       └── package.json
├── docker-compose.yml        # PostgreSQL service
└── README.md
```

### Data Flow

```
┌─────────────────────┐     startup scan      ┌──────────────┐
│  skills/*/SKILL.md  │ ──────────────────────▸│              │
│  agents/*.md        │                        │  PostgreSQL  │
└─────────────────────┘                        │              │
                                               └──────┬───────┘
                                                      │
                                               ┌──────┴───────┐
┌─────────────────────┐      REST API          │  Hono Server │
│  React UI (Vite)    │ ◂────────────────────▸ │  :3131       │
│  :5173 (dev)        │                        └──────────────┘
└─────────────────────┘
        │
        │ install action
        ▾
┌─────────────────────┐
│  Target project/    │
│  ├── skills/        │
│  ├── agents/        │
│  ├── .github/       │
│  └── .dojo-profile  │
└─────────────────────┘
```

---

## Database Schema

### `skills` table

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | Auto-generated |
| slug | text (unique) | e.g. `plan-before-code` |
| name | text | From SKILL.md frontmatter |
| description | text | From SKILL.md frontmatter |
| category | text | `core-kata`, `flow-waza`, `practical-kumite`, `meta-do` |
| category_icon | text | 🥋, 🔄, ⚔️, 道 |
| category_label | text | e.g. `Core Kata — 基本型` |
| markdown | text | Full SKILL.md body content |
| tags | jsonb | `["planning", "discipline", "workflow"]` |
| file_path | text | Relative path in dojo repo |
| file_inventory | jsonb | Array of files in the skill folder |
| last_scanned_at | timestamp | |
| created_at | timestamp | |
| updated_at | timestamp | |

### `agents` table

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| slug | text (unique) | e.g. `software-engineer` |
| name | text | |
| description | text | |
| agent_type | text | `general`, `specialist` |
| activation | text | `manual`, `auto` |
| apply_to | jsonb | Skill slugs array |
| markdown | text | Full agent .md content |
| file_path | text | |
| created_at | timestamp | |
| updated_at | timestamp | |

### `profiles` table

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| name | text | e.g. `My TDD Setup` |
| is_preset | boolean | `true` for built-in presets |
| skills | jsonb | `{ "core-kata": ["plan-before-code", ...] }` |
| agents | jsonb | `["software-engineer"]` |
| instructions | jsonb | `["typescript", "python"]` |
| target_path | text (nullable) | Last installed path |
| created_at | timestamp | |
| updated_at | timestamp | |

### `install_history` table

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| profile_id | uuid (FK → profiles) | |
| target_path | text | |
| skills_installed | jsonb | Snapshot of what was installed |
| agents_installed | jsonb | |
| installed_at | timestamp | |
| status | text | `success`, `failed` |

---

## API Routes

### Skills
```
GET    /api/skills              — List all (supports ?category=&tag=&search=&sort=)
GET    /api/skills/:slug        — Full detail + rendered markdown
GET    /api/skills/tags         — Unique tags with counts
POST   /api/skills/scan         — Trigger filesystem re-scan
```

### Agents
```
GET    /api/agents              — List all
GET    /api/agents/:slug        — Full detail + markdown
```

### Profiles
```
GET    /api/profiles            — List all (presets + custom)
GET    /api/profiles/:id        — Detail
POST   /api/profiles            — Create custom
PUT    /api/profiles/:id        — Update
DELETE /api/profiles/:id        — Delete (not presets)
```

### Install
```
POST   /api/install             — Install profile to target
GET    /api/install/preview     — Preview files to be created
GET    /api/install/history     — Past installations
```

### Meta
```
GET    /api/categories          — Category metadata
GET    /api/presets             — Built-in presets
GET    /api/stats               — Dashboard stats
```

---

## UI Pages

### 1. `/` — Marketplace Home

- Hero banner with 🏯 branding
- Stats row: skill count, agent count, category count, preset count
- Category cards — click to jump to filtered skill browser
- Preset quick-start buttons

### 2. `/skills` — Skill Browser (core page)

- **Left sidebar:** Category nav with icons and counts
- **Top bar:** Search input + tag filter chips + sort dropdown
- **Main area:** Responsive card grid of `SkillCard` components
- **Sticky bottom:** `SelectionTray` with selected count, names, and "Build Profile →" action
- Each `SkillCard` shows: icon, name, truncated description, tags, category badge, select toggle, "View →" link

### 3. `/skills/:slug` — Skill Detail

- Full SKILL.md rendered with syntax highlighting
- Metadata sidebar: category, tags, file inventory, related skills
- "Part of presets" list
- Select/deselect toggle
- Back to browser link

### 4. `/agents` — Agent Browser

- Card grid with agent type, activation mode, linked skills
- Select toggle per agent

### 5. `/agents/:slug` — Agent Detail

- Full agent markdown rendered
- Shows skills this agent works with

### 6. `/profiles` — Profile Manager

- List of saved profiles with skill/agent counts
- Preset profiles shown first (not deletable)
- Create new, edit, duplicate, delete actions
- "Install to project" button per profile

### 7. `/install` — Install Wizard

- Step 1: Select or create profile
- Step 2: Choose target directory (text input with path validation)
- Step 3: Preview generated `copilot-instructions.md` + file list
- Step 4: Confirm and install
- Shows diff if target already has dojo files

---

## Visual Design — Dojo Theme

### Direction
Clean minimal with dojo touches. Not a full Japanese aesthetic — subtle and professional.

### Elements
- **Typography:** System font stack + `Noto Sans JP` for Japanese text (category labels)
- **Colors (dark mode):** Background `#0a0a0f`, surface `#16161d`, primary cyan `#06b6d4`, accent gold `#d4a406`, text `#e4e4e7`
- **Colors (light mode):** Background `#fafaf9`, surface `#ffffff`, primary cyan `#0891b2`, accent gold `#b45309`, text `#18181b`
- **Category badges:** Colored chips with icons — 🥋 indigo, 🔄 cyan, ⚔️ red, 道 amber
- **Cards:** Subtle border, hover lift shadow, category color accent on left edge
- **Belt progression visual:** Category cards show progression Core → Flow → Practical → Meta

### Key Visual Patterns
- Light/dark toggle in header
- Category icon appears in all contexts (cards, nav, detail, breadcrumbs)
- Japanese category names always shown alongside English (e.g. "Core Kata — 基本型")
- Selection state uses checkmark badges on cards, not checkboxes
- Sticky selection tray uses glass-morphism (frosted background)

---

## Startup & Launch

```bash
cd copilot-agents-dojo/control-plane

# First time setup
docker compose up -d          # Start PostgreSQL
pnpm install
pnpm db:migrate               # Run Drizzle migrations

# Development
pnpm dev                      # Starts server (:3131) + UI (:5173)

# Production
pnpm build
pnpm start                    # Serves built UI + API on :3131
```

### Environment Variables
```
DATABASE_URL=postgresql://dojo:dojo@localhost:5432/dojo
DOJO_ROOT=../                 # Points to dojo repo root (auto-detected)
PORT=3131
```

---

## Scope Boundaries

### In scope (MVP)
- Skill browser with search, filter, tags, detail view
- Agent browser with detail view
- Profile creation, saving, editing
- Install to target project (same output as CLI)
- Install history
- Preset profiles seeded from current presets
- Filesystem scan on startup + manual re-scan button
- Light/dark theme toggle

### Out of scope (future)
- Dashboard with KPI cards and activity feeds
- Org chart visualization for agents
- Stack auto-detection
- Slash-command generator (`.github/prompts/`)
- Cross-repo lesson sharing
- Real-time agent monitoring
- Multi-user / auth
- VS Code extension integration

---

## Relationship to Existing CLI

The Python CLI (`cli/`) continues to work unchanged. The control plane is an independent, parallel path to the same outcome. Both:
- Read from the same `skills/` and `agents/` directories
- Generate identical `copilot-instructions.md` output
- Support `.dojo-profile.yml` for profile sharing

Users choose their preferred interface. The control plane is the recommended path for visual browsing and discovery; the CLI remains for scripting and automation.
