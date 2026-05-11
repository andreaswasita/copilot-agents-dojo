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
