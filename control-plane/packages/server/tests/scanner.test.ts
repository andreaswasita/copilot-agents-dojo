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
    expect(result.categoryIcon).toBe("🥋");
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
