/**
 * Preset profiles — selectable skill/agent bundles that mirror the Python
 * dojo CLI's PRESETS table (cli/dojo_cli/profiles.py). Keep these in sync
 * when adding new presets to either side.
 */

export type PresetId =
  | "full-dojo"
  | "lean"
  | "tdd-focus"
  | "code-review-focus"
  | "onboarding"
  | "requirements-first";

export interface Preset {
  id: PresetId;
  label: string;
  description: string;
  skills: string[];
  agents: string[];
}

export const PRESETS: Record<PresetId, Preset> = {
  "full-dojo": {
    id: "full-dojo",
    label: "🏯 Full Dojo",
    description: "All core + practical + optional skills",
    skills: [
      "plan-before-code",
      "subagent-strategy",
      "self-improvement",
      "verify-before-done",
      "demand-elegance",
      "autonomous-bug-fix",
      "using-superpowers",
      "durable-work",
      "brainstorming",
      "using-git-worktrees",
      "executing-plans",
      "requesting-code-review",
      "receiving-code-review",
      "finishing-a-development-branch",
      "dispatching-parallel-agents",
      "code-review",
      "refactoring",
      "test-writing",
      "pr-workflow",
      "debugging",
      "codebase-onboarding",
      "requirements-elicitation",
    ],
    agents: [
      "software-engineer",
      "architect",
      "security-engineer",
      "test-engineer",
      "technical-program-manager",
    ],
  },
  lean: {
    id: "lean",
    label: "⚡ Lean",
    description: "Core kata + essential waza only",
    skills: [
      "plan-before-code",
      "verify-before-done",
      "self-improvement",
      "autonomous-bug-fix",
      "durable-work",
      "brainstorming",
      "executing-plans",
      "finishing-a-development-branch",
    ],
    agents: ["software-engineer"],
  },
  "tdd-focus": {
    id: "tdd-focus",
    label: "🧪 TDD Focus",
    description: "Test-driven, plan-first workflow",
    skills: [
      "plan-before-code",
      "verify-before-done",
      "demand-elegance",
      "executing-plans",
      "test-writing",
      "debugging",
    ],
    agents: ["software-engineer", "test-engineer"],
  },
  "code-review-focus": {
    id: "code-review-focus",
    label: "🔍 Code Review",
    description: "Review and PR excellence",
    skills: [
      "demand-elegance",
      "verify-before-done",
      "requesting-code-review",
      "receiving-code-review",
      "code-review",
      "pr-workflow",
      "refactoring",
    ],
    agents: ["software-engineer", "security-engineer"],
  },
  onboarding: {
    id: "onboarding",
    label: "📖 Onboarding",
    description: "Understand a new codebase fast",
    skills: [
      "plan-before-code",
      "subagent-strategy",
      "codebase-onboarding",
      "debugging",
      "requirements-elicitation",
    ],
    agents: ["software-engineer", "architect"],
  },
  "requirements-first": {
    id: "requirements-first",
    label: "📋 Requirements First",
    description: "TPM + Architect with elicitation gate",
    skills: [
      "plan-before-code",
      "self-improvement",
      "brainstorming",
      "requirements-elicitation",
      "codebase-onboarding",
    ],
    agents: ["technical-program-manager", "architect"],
  },
};

export const PRESET_IDS = Object.keys(PRESETS) as PresetId[];
