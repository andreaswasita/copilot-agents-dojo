import { mkdtemp, readFile, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { runInit } from "../src/init.js";
import { PROFILE_FILENAME, readProfile } from "../src/profile.js";

const FIXTURE = pathToFileURL(
  resolve(__dirname, "fixtures", "dojo-fixture.tar.gz"),
).toString();

const VERSION = "0.0.0-test";

let prevUrl: string | undefined;

beforeEach(() => {
  prevUrl = process.env.DOJO_TARBALL_URL;
  process.env.DOJO_TARBALL_URL = FIXTURE;
});

afterEach(() => {
  if (prevUrl === undefined) delete process.env.DOJO_TARBALL_URL;
  else process.env.DOJO_TARBALL_URL = prevUrl;
});

async function mkTmp(): Promise<string> {
  return mkdtemp(join(tmpdir(), "copilot-dojo-init-"));
}

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

describe("runInit (lean preset, fixture tarball)", () => {
  it("writes selected skills, agents, profile, and instructions", async () => {
    const target = await mkTmp();
    const result = await runInit({
      targetDir: target,
      presetId: "lean",
      ref: "main",
      yes: true,
      nonInteractive: true,
      installerVersion: VERSION,
    });

    expect(result.dryRun).toBe(false);
    expect(result.preset.id).toBe("lean");
    expect(result.writtenFiles.length).toBeGreaterThan(0);

    // Lean preset's first three skills
    for (const id of ["plan-before-code", "verify-before-done", "durable-work"]) {
      expect(await exists(join(target, "skills", id, "SKILL.md"))).toBe(true);
    }
    expect(await exists(join(target, "agents", "software-engineer.md"))).toBe(true);

    // Generated artefacts
    const profile = await readProfile(target);
    expect(profile).not.toBeNull();
    expect(profile?.preset).toBe("lean");
    expect(profile?.ref).toBe("main");
    expect(profile?.skills).toContain("plan-before-code");
    expect(profile?.agents).toContain("software-engineer");
    expect(profile?.installer_version).toBe(VERSION);

    const instr = await readFile(
      join(target, ".github", "copilot-instructions.md"),
      "utf8",
    );
    expect(instr).toContain("Copilot Agents — Project Instructions");
    expect(instr).toContain("plan-before-code");
    expect(instr).toContain("Fixture description for plan-before-code.");
  });

  it("--dry-run writes nothing", async () => {
    const target = await mkTmp();
    const result = await runInit({
      targetDir: target,
      presetId: "lean",
      yes: true,
      dryRun: true,
      nonInteractive: true,
      installerVersion: VERSION,
    });
    expect(result.dryRun).toBe(true);
    expect(await exists(join(target, "skills"))).toBe(false);
    expect(await exists(join(target, PROFILE_FILENAME))).toBe(false);
    expect(await exists(join(target, ".github"))).toBe(false);
  });

  it("re-running over an existing profile creates a backup of clobbered files", async () => {
    const target = await mkTmp();
    await runInit({
      targetDir: target,
      presetId: "lean",
      yes: true,
      nonInteractive: true,
      installerVersion: VERSION,
    });
    const second = await runInit({
      targetDir: target,
      presetId: "lean",
      yes: true,
      nonInteractive: true,
      installerVersion: VERSION,
    });
    expect(second.backupRoot).toBeDefined();
    expect(await exists(second.backupRoot!)).toBe(true);
    // The profile file from run 1 must be inside the backup tree
    expect(await exists(join(second.backupRoot!, PROFILE_FILENAME))).toBe(true);
  });

  it("rejects --preset custom in v1", async () => {
    const target = await mkTmp();
    await expect(
      runInit({
        targetDir: target,
        presetId: "custom",
        yes: true,
        nonInteractive: true,
        installerVersion: VERSION,
      }),
    ).rejects.toThrow(/custom/);
  });

  it("defaults to lean when --yes given without --preset", async () => {
    const target = await mkTmp();
    const result = await runInit({
      targetDir: target,
      yes: true,
      nonInteractive: true,
      installerVersion: VERSION,
    });
    expect(result.preset.id).toBe("lean");
  });
});

describe("preset table", () => {
  it("every preset references only known skills (light schema check)", async () => {
    const { PRESETS } = await import("../src/presets.js");
    for (const id of Object.keys(PRESETS)) {
      const p = PRESETS[id as keyof typeof PRESETS];
      expect(p.skills.length).toBeGreaterThan(0);
      // Skill IDs are kebab-case slugs
      for (const s of p.skills) {
        expect(s).toMatch(/^[a-z][a-z0-9-]+$/);
      }
      for (const a of p.agents) {
        expect(a).toMatch(/^[a-z][a-z0-9-]+$/);
      }
    }
  });
});
