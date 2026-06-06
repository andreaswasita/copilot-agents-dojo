import {
  lstat,
  mkdir,
  readFile,
  rm,
  stat,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { mkdtemp } from "node:fs/promises";
import { pathToFileURL } from "node:url";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { runInit } from "../src/init.js";
import { runDoctor } from "../src/doctor.js";
import { runUninstall } from "../src/uninstall.js";
import {
  MANIFEST_FILENAME,
  ManifestError,
  isSafeRelPath,
  readManifest,
  safeResolve,
  writeManifest,
  type InstallManifest,
} from "../src/manifest.js";
import { PROFILE_FILENAME } from "../src/profile.js";

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
  return mkdtemp(join(tmpdir(), "copilot-dojo-g2-"));
}

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function freshInstall(): Promise<string> {
  const target = await mkTmp();
  await runInit({
    targetDir: target,
    presetId: "lean",
    ref: "main",
    yes: true,
    nonInteractive: true,
    installerVersion: VERSION,
  });
  return target;
}

/** Symlink creation needs privilege on Windows; detect and skip if unavailable. */
async function symlinkSupported(): Promise<boolean> {
  const dir = await mkTmp();
  try {
    await writeFile(join(dir, "a"), "x");
    await symlink(join(dir, "a"), join(dir, "b"));
    return true;
  } catch {
    return false;
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

describe("install manifest", () => {
  it("init writes a checksummed manifest of installed content", async () => {
    const target = await freshInstall();
    const manifest = await readManifest(target);
    expect(manifest).not.toBeNull();
    expect(manifest!.version).toBe(1);
    expect(manifest!.preset).toBe("lean");
    expect(manifest!.installer_version).toBe(VERSION);
    expect(manifest!.files.length).toBeGreaterThan(0);

    // Tracks installed content + the generated instructions, but not the
    // volatile profile or the manifest itself.
    const paths = manifest!.files.map((f) => f.path);
    expect(paths).toContain("skills/plan-before-code/SKILL.md");
    expect(paths).toContain(".github/copilot-instructions.md");
    expect(paths).not.toContain(PROFILE_FILENAME);
    expect(paths).not.toContain(MANIFEST_FILENAME);

    // Every entry has a real sha256 and is sorted.
    for (const f of manifest!.files) {
      expect(f.sha256).toMatch(/^[0-9a-f]{64}$/);
      expect(f.bytes).toBeGreaterThanOrEqual(0);
    }
    const sorted = [...paths].sort();
    expect(paths).toEqual(sorted);
  });
});

describe("path-safety helpers", () => {
  it("isSafeRelPath rejects traversal and absolute paths", () => {
    for (const bad of [
      "../escape.txt",
      "/etc/passwd",
      "C:\\Windows\\x",
      "a\\b",
      "a/../../b",
      "",
      "./x",
      "a//b",
      "a/\0/b",
    ]) {
      expect(isSafeRelPath(bad)).toBe(false);
    }
    expect(isSafeRelPath("skills/x/SKILL.md")).toBe(true);
  });

  it("safeResolve throws when a path escapes the target", () => {
    const root = resolve(tmpdir(), "some-target");
    expect(() => safeResolve(root, "../outside")).toThrow(ManifestError);
    expect(() => safeResolve(root, "/abs")).toThrow(ManifestError);
    expect(safeResolve(root, "a/b.txt")).toBe(resolve(root, "a/b.txt"));
  });
});

describe("doctor (drift detection)", () => {
  it("reports healthy immediately after install", async () => {
    const target = await freshInstall();
    const report = await runDoctor({ targetDir: target });
    expect(report).not.toBeNull();
    expect(report!.healthy).toBe(true);
    expect(report!.modified).toEqual([]);
    expect(report!.missing).toEqual([]);
    expect(report!.unsafe).toEqual([]);
  });

  it("flags a modified file", async () => {
    const target = await freshInstall();
    const f = join(target, "skills", "plan-before-code", "SKILL.md");
    await writeFile(f, "tampered\n", "utf8");
    const report = await runDoctor({ targetDir: target });
    expect(report!.healthy).toBe(false);
    expect(report!.modified).toContain("skills/plan-before-code/SKILL.md");
  });

  it("flags a missing file", async () => {
    const target = await freshInstall();
    await rm(join(target, "skills", "plan-before-code", "SKILL.md"));
    const report = await runDoctor({ targetDir: target });
    expect(report!.healthy).toBe(false);
    expect(report!.missing).toContain("skills/plan-before-code/SKILL.md");
  });

  it("returns null when there is no manifest", async () => {
    const target = await mkTmp();
    expect(await runDoctor({ targetDir: target })).toBeNull();
  });

  it("throws ManifestError on a corrupt manifest", async () => {
    const target = await mkTmp();
    await mkdir(join(target, ".dojo"), { recursive: true });
    await writeFile(join(target, MANIFEST_FILENAME), "{ not json", "utf8");
    await expect(runDoctor({ targetDir: target })).rejects.toThrow(ManifestError);
  });

  it("warns when the profile preset disagrees with the manifest", async () => {
    const target = await freshInstall();
    const manifest = (await readManifest(target)) as InstallManifest;
    await writeManifest(target, { ...manifest, preset: "tdd-focus" });
    const report = await runDoctor({ targetDir: target });
    expect(report!.profileWarnings.join(" ")).toMatch(/preset/);
  });
});

describe("uninstall (preserve-modified)", () => {
  it("removes unmodified files plus profile and manifest on a clean run", async () => {
    const target = await freshInstall();
    const skillFile = join(target, "skills", "plan-before-code", "SKILL.md");
    expect(await exists(skillFile)).toBe(true);

    const result = await runUninstall({
      targetDir: target,
      yes: true,
      nonInteractive: true,
    });
    expect(result).not.toBeNull();
    expect(result!.preserved).toEqual([]);
    expect(result!.errors).toEqual([]);
    expect(result!.manifestKept).toBe(false);
    expect(result!.removed).toContain("skills/plan-before-code/SKILL.md");

    expect(await exists(skillFile)).toBe(false);
    expect(await exists(join(target, PROFILE_FILENAME))).toBe(false);
    expect(await exists(join(target, MANIFEST_FILENAME))).toBe(false);
    // Empty skill dir was pruned.
    expect(await exists(join(target, "skills", "plan-before-code"))).toBe(false);
  });

  it("preserves a user-modified file and keeps the manifest", async () => {
    const target = await freshInstall();
    const f = join(target, "skills", "plan-before-code", "SKILL.md");
    await writeFile(f, "my edits\n", "utf8");

    const result = await runUninstall({
      targetDir: target,
      yes: true,
      nonInteractive: true,
    });
    expect(result!.preserved).toContain("skills/plan-before-code/SKILL.md");
    expect(result!.manifestKept).toBe(true);
    expect(await exists(f)).toBe(true);
    // Manifest survives for a later --force.
    expect(await exists(join(target, MANIFEST_FILENAME))).toBe(true);
    expect(await readFile(f, "utf8")).toBe("my edits\n");
  });

  it("--force removes a modified file too", async () => {
    const target = await freshInstall();
    const f = join(target, "skills", "plan-before-code", "SKILL.md");
    await writeFile(f, "my edits\n", "utf8");

    const result = await runUninstall({
      targetDir: target,
      yes: true,
      force: true,
      nonInteractive: true,
    });
    expect(result!.removed).toContain("skills/plan-before-code/SKILL.md");
    expect(result!.manifestKept).toBe(false);
    expect(await exists(f)).toBe(false);
  });

  it("--dry-run reports without deleting anything", async () => {
    const target = await freshInstall();
    const f = join(target, "skills", "plan-before-code", "SKILL.md");

    const result = await runUninstall({
      targetDir: target,
      dryRun: true,
      nonInteractive: true,
    });
    expect(result!.dryRun).toBe(true);
    expect(result!.removed.length).toBeGreaterThan(0);
    expect(await exists(f)).toBe(true);
    expect(await exists(join(target, MANIFEST_FILENAME))).toBe(true);
    expect(await exists(join(target, PROFILE_FILENAME))).toBe(true);
  });

  it("never deletes the installer-backups directory", async () => {
    // First install, then re-install to force a backup, then uninstall.
    const target = await freshInstall();
    await runInit({
      targetDir: target,
      presetId: "lean",
      yes: true,
      nonInteractive: true,
      installerVersion: VERSION,
    });
    const backupsRoot = join(target, ".dojo", "installer-backups");
    expect(await exists(backupsRoot)).toBe(true);

    await runUninstall({ targetDir: target, yes: true, nonInteractive: true });
    expect(await exists(backupsRoot)).toBe(true);
  });

  it("returns null when there is no manifest", async () => {
    const target = await mkTmp();
    expect(
      await runUninstall({ targetDir: target, yes: true, nonInteractive: true }),
    ).toBeNull();
  });

  it("refuses to delete a manifest path that escapes the target", async () => {
    const target = await freshInstall();
    const outside = await mkTmp();
    const victim = join(outside, "victim.txt");
    await writeFile(victim, "do not touch\n", "utf8");

    // Tamper the manifest with a traversal path.
    const manifest = (await readManifest(target)) as InstallManifest;
    manifest.files.push({ path: "../escape.txt", sha256: "0".repeat(64), bytes: 1 });
    await writeManifest(target, manifest);

    const result = await runUninstall({
      targetDir: target,
      yes: true,
      force: true,
      nonInteractive: true,
    });
    expect(result!.preserved).toContain("../escape.txt");
    expect(result!.errors.some((e) => e.path === "../escape.txt")).toBe(true);
    // The escaping path was never deleted; manifest kept due to the error.
    expect(result!.manifestKept).toBe(true);
    expect(await exists(victim)).toBe(true);
  });

  it("preserves a symlink that replaced a tracked file (default)", async () => {
    if (!(await symlinkSupported())) return; // skip where symlinks need privilege
    const target = await freshInstall();
    const f = join(target, "skills", "plan-before-code", "SKILL.md");
    const elsewhere = join(target, "external-secret.txt");
    await writeFile(elsewhere, "secret\n", "utf8");
    await rm(f);
    await symlink(elsewhere, f);

    const result = await runUninstall({
      targetDir: target,
      yes: true,
      nonInteractive: true,
    });
    expect(result!.preserved).toContain("skills/plan-before-code/SKILL.md");
    // The symlink target is untouched.
    expect(await exists(elsewhere)).toBe(true);
    expect(await readFile(elsewhere, "utf8")).toBe("secret\n");
  });

  it("--force unlinks a replacing symlink but never its target", async () => {
    if (!(await symlinkSupported())) return;
    const target = await freshInstall();
    const f = join(target, "skills", "plan-before-code", "SKILL.md");
    const elsewhere = join(target, "external-secret.txt");
    await writeFile(elsewhere, "secret\n", "utf8");
    await rm(f);
    await symlink(elsewhere, f);

    await runUninstall({
      targetDir: target,
      yes: true,
      force: true,
      nonInteractive: true,
    });
    // Link gone, target file intact.
    expect(await exists(f)).toBe(false);
    expect(await exists(elsewhere)).toBe(true);
    expect(await readFile(elsewhere, "utf8")).toBe("secret\n");
  });

  it("preserves a directory that replaced a tracked file", async () => {
    const target = await freshInstall();
    const f = join(target, "skills", "plan-before-code", "SKILL.md");
    await rm(f);
    await mkdir(f, { recursive: true });
    await writeFile(join(f, "user-file.txt"), "mine\n", "utf8");

    const result = await runUninstall({
      targetDir: target,
      yes: true,
      force: true,
      nonInteractive: true,
    });
    expect(result!.preserved).toContain("skills/plan-before-code/SKILL.md");
    // The directory and its content survive (no recursive delete).
    expect((await lstat(f)).isDirectory()).toBe(true);
    expect(await exists(join(f, "user-file.txt"))).toBe(true);
  });
});
