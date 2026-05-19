import { createDb, profiles } from "./index.js";
import { eq } from "drizzle-orm";

const PRESETS = [
  {
    name: "Full Dojo 🏯",
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
    name: "Lean ⚡",
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
    name: "TDD Focus 🧪",
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
    name: "Code Review Focus 🔍",
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
    name: "Onboarding 📖",
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
