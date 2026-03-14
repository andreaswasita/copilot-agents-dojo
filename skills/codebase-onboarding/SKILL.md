---
name: codebase-onboarding
description: >-
  Guides the agent in rapidly understanding an unfamiliar codebase — its structure,
  conventions, dependencies, and key patterns. Use this skill when working in a new
  repository for the first time, when the agent needs to understand how a project is
  organized before making changes, when onboarding to a codebase with no documentation,
  or when the user says "look at this repo" or "understand this project."
---

# Codebase Onboarding

Understand the codebase before you change it. A 10-minute investigation prevents a 2-hour mess.

## When to Use

- Working in a new or unfamiliar repository
- Before making changes to code you haven't read
- When a project lacks documentation
- User asks you to understand a project or repo
- When subagents need context about the codebase

## How to Use

### Step 1: Survey the Landscape

Get the big picture in 60 seconds:

```bash
# Project structure (top 2 levels)
find . -maxdepth 2 -type f | head -50
# or: tree -L 2

# What language/framework?
cat package.json 2>/dev/null    # Node.js
cat requirements.txt 2>/dev/null # Python
cat go.mod 2>/dev/null          # Go
cat pom.xml 2>/dev/null         # Java
cat *.csproj 2>/dev/null        # .NET

# README — the author's intent
cat README.md | head -100
```

### Step 2: Identify the Architecture

Look for these patterns:

| Signal | What It Tells You |
|--------|-------------------|
| `src/controllers/` or `src/routes/` | MVC or route-based architecture |
| `src/features/` or `src/modules/` | Feature-based / domain-driven |
| `packages/` or `apps/` | Monorepo |
| `src/components/` | Component-based frontend |
| `cmd/` and `internal/` | Go standard layout |
| `src/main/java/` | Java/Spring project |
| `Dockerfile` + `docker-compose.yml` | Containerized services |

### Step 3: Understand the Build and Run

Find the entry points:

```bash
# How to install
cat Makefile 2>/dev/null
cat package.json | grep -A5 '"scripts"' 2>/dev/null

# How to run
grep -r "main\|entry" package.json tsconfig.json webpack.config.* 2>/dev/null

# How to test
grep -r "test\|spec" package.json Makefile 2>/dev/null
```

### Step 4: Read the Key Files

Priority reading order:
1. **Config files** — `.env.example`, config/, settings — understand the knobs
2. **Entry point** — `main.ts`, `app.py`, `cmd/main.go` — follow the startup path
3. **Routes/API** — How the outside world interacts with the system
4. **Models/Types** — The data structures that drive the domain
5. **Tests** — Tests tell you what the code is *supposed* to do

### Step 5: Map the Conventions

Before making changes, note:
- **Naming conventions** — camelCase? snake_case? How are files named?
- **Error handling pattern** — Exceptions? Result types? Error codes?
- **Testing pattern** — Co-located? Separate `__tests__/` directory? What framework?
- **Import style** — Absolute? Relative? Path aliases?
- **State management** — Where does state live? How is it shared?

### Step 6: Document for Future You

If the project lacks a CONTRIBUTING.md or architecture doc, create a brief mental model:

```markdown
## Quick Map

- **Language**: TypeScript (strict mode)
- **Framework**: Next.js 14 (App Router)
- **Testing**: Vitest, co-located test files
- **Key patterns**: Server Components default, Server Actions for mutations
- **Entry point**: src/app/layout.tsx
- **API layer**: src/app/api/
- **Data models**: src/lib/models/
- **Build**: `npm run build`, Deploy: Vercel
```

## Examples

**Bad — Blind Editing:**
> User: "Add a new API endpoint to this project"
> Agent: *Creates a file in the wrong directory, wrong naming convention, wrong framework patterns*

**Good — Onboard First:**
> User: "Add a new API endpoint to this project"
> Agent: "Let me understand the project first. This is a FastAPI app with routes in `src/api/routes/`, models in `src/models/`, and a consistent pattern of Pydantic schemas for request/response. Tests are co-located. I'll follow the existing pattern in `src/api/routes/users.py` as a template for the new endpoint."

## Guidelines

- Reading code is faster than guessing and rewriting
- Match existing patterns even if you'd do it differently
- When uncertain, look at 3 similar examples in the codebase before writing code
- Use subagents for parallel codebase exploration when the project is large

## Anti-Patterns

- **Assuming project structure** — Not all Python projects use Django patterns
- **Ignoring conventions** — Introducing camelCase into a snake_case codebase
- **Skipping the README** — Authors usually explain the important things
- **Reading every file** — Survey strategically, don't read the entire codebase linearly
- **Asking the user what you could discover yourself** — "What framework is this?" when `package.json` is right there
