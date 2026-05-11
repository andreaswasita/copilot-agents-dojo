export interface CategoryDef {
  icon: string;
  label: string;
  skills: string[];
}

export const CATEGORIES: Record<string, CategoryDef> = {
  "core-kata": {
    icon: "🥋",
    label: "Core Kata — 基本型",
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
    icon: "🔄",
    label: "Flow Waza — 流れ技",
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
    icon: "⚔️",
    label: "Practical Kumite — 実践組手",
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
    icon: "道",
    label: "Meta Dō — 道",
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
  return { category: "uncategorized", icon: "📦", label: "Uncategorized" };
}
