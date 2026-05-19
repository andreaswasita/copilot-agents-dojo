---
name: codebase-onboarding
description: Maps an unfamiliar repo before touching its code.
tier: practical
category: workflow
created_by: human
platforms: [windows, macos, linux]
tags: [onboarding, exploration, conventions]
author: Andreas Wasita (@andreaswasita)
---

# Codebase Onboarding Skill

Builds a working mental model of an unfamiliar repository before making changes: language, framework, structure, conventions, entry points, and test pattern. Does NOT exhaustively read every file — surveys strategically, then drills in where the work demands it.

## When to Use

- Working in a new or unfamiliar repository.
- Before making changes to code you have not read.
- When a project lacks documentation.
- User asks you to "look at this repo" or "understand this project".
- Briefing a sub-agent on context before delegating.
- NOT when you already have a recent mental model of this repo — re-onboarding wastes turns.

## Prerequisites

- Read access to the repository.
- The `view`, `grep`, and `glob` Copilot tools.
- The `powershell` tool to inspect files outside the source tree (lockfiles, etc.).
- Ability to run the project's test command (later, optional).

## How to Run

```text
1. Survey the top-level layout with `glob`.
2. Read manifest files (package.json, pyproject.toml, go.mod, *.csproj, pom.xml).
3. Read the README.
4. Identify the architecture pattern from directory names.
5. Open the entry point and one representative test.
6. Note conventions: naming, imports, error handling, test layout.
7. Write a short Quick Map (5–10 lines) for your future self.
```

## Quick Reference

| Survey target | Tool | Why |
|---|---|---|
| Top-level layout | `glob '*'` | Frames the project |
| Source layout | `glob 'src/**'` (or repo equivalent) | Spots architecture pattern |
| Manifests | `view package.json` / `view pyproject.toml` | Language, framework, scripts |
| README | `view README.md` | Author's intent |
| Entry point | `view src/main.*` / `view cmd/main.go` | How startup actually works |
| Tests | `view` one representative test | Pattern + framework |

| Directory signal | Architecture clue |
|---|---|
| `src/controllers/` or `src/routes/` | MVC / route-based |
| `src/features/` or `src/modules/` | Feature / domain-driven |
| `packages/` or `apps/` | Monorepo |
| `src/components/` | Component-based frontend |
| `cmd/` and `internal/` | Go standard layout |
| `src/main/java/` | Java / Spring |
| `Dockerfile` + `docker-compose.yml` | Containerized service set |

## Procedure

### Step 1: Survey the Landscape

Use `glob` on `*`, then on `src/**` (or the equivalent). Note top-level files. Use `view` on the manifest file for the stack — `package.json`, `pyproject.toml`, `go.mod`, `*.csproj`, `pom.xml`.

### Step 2: Read the README

Open `README.md` with `view`. The author usually states the project's purpose, run instructions, and conventions in the first hundred lines.

### Step 3: Identify Architecture

Match the directory layout to the table above. Note any divergence — those are the "interesting" parts.

### Step 4: Read the Entry Point

Open the entry file with `view`: `src/main.ts`, `src/app.py`, `cmd/main.go`, `Program.cs`. Trace the startup path one level deep. You are mapping shape, not deeply auditing logic.

### Step 5: Sample One Test

Use `glob` to locate tests (`**/*.test.*`, `**/test_*.py`, `**/*_test.go`). Open one with `view`. Note framework, fixture style, and where tests live relative to source.

### Step 6: Capture the Quick Map

Write a 5–10 line summary for your own use (and to brief sub-agents):

```markdown
## Quick Map: <repo-name>
- Language: TypeScript (strict mode)
- Framework: Next.js 14 (App Router)
- Tests: Vitest, co-located `*.test.ts`
- Patterns: Server Components default, Server Actions for mutations
- Entry: `src/app/layout.tsx`
- API: `src/app/api/`
- Models: `src/lib/models/`
- Build: `npm run build`. Deploy: Vercel.
```

## Pitfalls

- **DO NOT** start editing before completing the survey. You will pick the wrong directory.
- **DO NOT** ask the user what stack it is when the manifest answers the question.
- **DO NOT** read the repo linearly file by file. Survey strategically.
- **DO NOT** impose your preferred conventions. Match the existing style even if you would do it differently.
- **DO NOT** skip reading at least one existing test — tests are executable docs.

## Verification

- [ ] Quick Map written (language, framework, tests, entry, build).
- [ ] At least one existing test file was opened with `view`.
- [ ] Architecture pattern is named (MVC / monorepo / etc.).
- [ ] Run command is identified and recorded.
- [ ] Naming/convention rules are noted before any new file is created.
