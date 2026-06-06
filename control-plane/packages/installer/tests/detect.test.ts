import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { detectStacks, recommendPreset, type Detection } from "../src/detect.js";
import { runInit } from "../src/init.js";
import { writeProfile, type DojoProfile } from "../src/profile.js";

const VERSION = "0.0.0-test";

async function mkTmp(): Promise<string> {
  return mkdtemp(join(tmpdir(), "copilot-dojo-detect-"));
}

async function write(dir: string, rel: string, content = ""): Promise<void> {
  const abs = join(dir, rel);
  await mkdir(join(abs, ".."), { recursive: true });
  await writeFile(abs, content, "utf8");
}

function detection(partial: Partial<Detection>): Detection {
  return {
    stacks: [],
    hasTests: false,
    hasCI: false,
    recommendedPreset: "lean",
    reason: "",
    warnings: [],
    ...partial,
  };
}

describe("detectStacks", () => {
  it("detects a typescript frontend node project with tests", async () => {
    const dir = await mkTmp();
    await write(
      dir,
      "package.json",
      JSON.stringify({
        dependencies: { react: "^18", "react-dom": "^18" },
        devDependencies: { typescript: "^5", vitest: "^1" },
      }),
    );
    await write(dir, "tsconfig.json", "{}");

    const d = await detectStacks(dir);
    const ids = d.stacks.map((s) => s.stack);
    expect(ids).toContain("node");
    expect(ids).toContain("typescript");
    expect(ids).toContain("frontend");
    expect(d.hasTests).toBe(true);
    expect(d.recommendedPreset).toBe("tdd-focus");
  });

  it("recommends onboarding for a populated stack with no test signal", async () => {
    const dir = await mkTmp();
    await write(dir, "go.mod", "module example.com/x\n");

    const d = await detectStacks(dir);
    expect(d.stacks.map((s) => s.stack)).toEqual(["go"]);
    expect(d.hasTests).toBe(false);
    expect(d.recommendedPreset).toBe("onboarding");
  });

  it("treats pytest in pyproject as a test signal (tdd-focus)", async () => {
    const dir = await mkTmp();
    await write(dir, "pyproject.toml", "[tool.pytest.ini_options]\n");

    const d = await detectStacks(dir);
    expect(d.stacks.map((s) => s.stack)).toContain("python");
    expect(d.hasTests).toBe(true);
    expect(d.recommendedPreset).toBe("tdd-focus");
  });

  it("recommends lean for an empty project", async () => {
    const dir = await mkTmp();
    const d = await detectStacks(dir);
    expect(d.stacks).toEqual([]);
    expect(d.recommendedPreset).toBe("lean");
  });

  it("recommends lean for an infra-only project (docker excluded from app stacks)", async () => {
    const dir = await mkTmp();
    await write(dir, "Dockerfile", "FROM node:20\n");

    const d = await detectStacks(dir);
    expect(d.stacks.map((s) => s.stack)).toEqual(["docker"]);
    expect(d.recommendedPreset).toBe("lean");
  });

  it("finds markers in a monorepo sub-package (directory depth)", async () => {
    const dir = await mkTmp();
    await write(dir, "apps/web/package.json", "{}");
    await write(dir, "services/api/go.mod", "module x\n");

    const d = await detectStacks(dir);
    const ids = d.stacks.map((s) => s.stack);
    expect(ids).toContain("node");
    expect(ids).toContain("go");
  });

  it("detects CI from .github/workflows", async () => {
    const dir = await mkTmp();
    await write(dir, ".github/workflows/ci.yml", "name: ci\n");

    const d = await detectStacks(dir);
    expect(d.hasCI).toBe(true);
  });

  it("never throws on malformed package.json and records a warning", async () => {
    const dir = await mkTmp();
    await write(dir, "package.json", "{ this is : not json");

    const d = await detectStacks(dir);
    expect(d.stacks.map((s) => s.stack)).toContain("node"); // marker still counts
    expect(d.warnings.some((w) => w.includes("package.json"))).toBe(true);
    expect(d.recommendedPreset).toBe("onboarding"); // node app stack, no tests
  });

  it("returns stacks in a stable order", async () => {
    const dir = await mkTmp();
    await write(dir, "go.mod", "module x\n");
    await write(dir, "package.json", "{}");

    const d = await detectStacks(dir);
    // node precedes go in the fixed STACK_ORDER regardless of filesystem order.
    expect(d.stacks.map((s) => s.stack)).toEqual(["node", "go"]);
  });
});

describe("recommendPreset (pure)", () => {
  it("tests present → tdd-focus", () => {
    expect(recommendPreset(detection({ hasTests: true })).recommendedPreset).toBe(
      "tdd-focus",
    );
  });

  it("app stack, no tests → onboarding", () => {
    const d = detection({
      stacks: [{ stack: "python", label: "Python", markers: ["pyproject.toml"] }],
    });
    expect(recommendPreset(d).recommendedPreset).toBe("onboarding");
  });

  it("infra-only, no tests → lean", () => {
    const d = detection({
      stacks: [{ stack: "docker", label: "Docker", markers: ["Dockerfile"] }],
    });
    expect(recommendPreset(d).recommendedPreset).toBe("lean");
  });

  it("nothing → lean", () => {
    expect(recommendPreset(detection({})).recommendedPreset).toBe("lean");
  });
});

describe("runInit precedence vs detection", () => {
  it("an explicit --preset beats detection", async () => {
    const dir = await mkTmp();
    await write(dir, "package.json", JSON.stringify({ devDependencies: { vitest: "^1" } }));
    const result = await runInit({
      targetDir: dir,
      presetId: "lean",
      nonInteractive: true,
      dryRun: true,
      installerVersion: VERSION,
    });
    expect(result.preset.id).toBe("lean");
  });

  it("an existing profile beats detection", async () => {
    const dir = await mkTmp();
    await write(dir, "package.json", JSON.stringify({ devDependencies: { vitest: "^1" } }));
    const profile: DojoProfile = {
      version: 1,
      preset: "code-review-focus",
      ref: "main",
      skills: [],
      agents: [],
      installed_at: new Date().toISOString(),
      installer_version: VERSION,
    };
    await writeProfile(dir, profile);

    const result = await runInit({
      targetDir: dir,
      nonInteractive: true,
      dryRun: true,
      installerVersion: VERSION,
    });
    expect(result.preset.id).toBe("code-review-focus");
  });

  it("non-interactive with no flag/profile uses the detected recommendation", async () => {
    const dir = await mkTmp();
    await write(dir, "pyproject.toml", "[tool.pytest.ini_options]\n");
    const result = await runInit({
      targetDir: dir,
      nonInteractive: true,
      dryRun: true,
      installerVersion: VERSION,
    });
    expect(result.preset.id).toBe("tdd-focus");
  });

  it("a malformed package.json does not fail init", async () => {
    const dir = await mkTmp();
    await write(dir, "package.json", "{ broken");
    const result = await runInit({
      targetDir: dir,
      nonInteractive: true,
      dryRun: true,
      installerVersion: VERSION,
    });
    expect(result.preset.id).toBe("onboarding");
  });
});
