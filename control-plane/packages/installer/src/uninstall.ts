/**
 * `copilot-dojo uninstall` — preserve-modified removal of an install.
 *
 * Safety is the whole point of this command, so it is conservative:
 *   - Only files listed in the manifest are ever touched.
 *   - Every manifest path is resolved through `safeResolve()` (no escapes).
 *   - A tracked file is removed only if it is a *regular file* whose checksum
 *     still matches the manifest. A user-modified file is PRESERVED by default;
 *     `--force` removes it. Symlinks/directories that replaced a tracked file
 *     are preserved (a `--force` unlink only ever removes a symlink itself,
 *     never its target).
 *   - Content is deleted FIRST. The manifest and profile are removed only on a
 *     clean run (no preserved files, no errors) so a partial/aborted uninstall
 *     can always be retried from the surviving manifest.
 *   - Empty directories are pruned only when they are ancestors of a file we
 *     removed, never recursively, and never under `.dojo/installer-backups`.
 */
import { confirm } from "@inquirer/prompts";
import { lstat, readdir, rm, rmdir, unlink } from "node:fs/promises";
import { dirname, join, relative, resolve, sep } from "node:path";

import {
  MANIFEST_BASENAME,
  MANIFEST_DIRNAME,
  readManifest,
  safeResolve,
  sha256File,
  toPosixRel,
} from "./manifest.js";
import { PROFILE_FILENAME } from "./profile.js";

const BACKUPS_MARKER = "installer-backups";

export interface UninstallOptions {
  targetDir: string;
  yes?: boolean;
  force?: boolean;
  dryRun?: boolean;
  /** When true, never prompt. Used by tests. */
  nonInteractive?: boolean;
}

export interface UninstallResult {
  removed: string[];
  preserved: string[];
  missing: string[];
  removedDirs: string[];
  errors: { path: string; message: string }[];
  manifestKept: boolean;
  dryRun: boolean;
}

interface Target {
  abs: string;
  rel: string;
}

/**
 * Prune directories that became empty after removing `removedAbs` files.
 * Only ancestors of removed files are considered; pruning stops at the target
 * root, skips the backups tree, and uses `rmdir` (never recursive).
 */
async function pruneEmptyDirs(
  targetDir: string,
  removedAbs: string[],
): Promise<string[]> {
  const rootRes = resolve(targetDir);
  const candidates = new Set<string>();
  for (const abs of removedAbs) {
    let dir = dirname(abs);
    while (true) {
      const dr = resolve(dir);
      if (dr === rootRes) break;
      if (relative(rootRes, dr).startsWith("..")) break;
      candidates.add(dr);
      dir = dirname(dir);
    }
  }
  // Deepest first, so children are removed before their parents.
  const ordered = [...candidates].sort(
    (a, b) => b.split(sep).length - a.split(sep).length,
  );
  const removed: string[] = [];
  for (const dir of ordered) {
    if (dir.includes(BACKUPS_MARKER)) continue;
    try {
      const st = await lstat(dir);
      if (!st.isDirectory() || st.isSymbolicLink()) continue;
      const entries = await readdir(dir);
      if (entries.length === 0) {
        await rmdir(dir);
        removed.push(toPosixRel(targetDir, dir));
      }
    } catch {
      /* ignore — best-effort pruning */
    }
  }
  return removed;
}

export async function runUninstall(
  opts: UninstallOptions,
): Promise<UninstallResult | null> {
  const { targetDir } = opts;
  const manifest = await readManifest(targetDir); // throws ManifestError if corrupt
  if (!manifest) return null;

  const toRemove: Target[] = [];
  const preserved: string[] = [];
  const missing: string[] = [];
  const errors: { path: string; message: string }[] = [];

  for (const entry of manifest.files) {
    let abs: string;
    try {
      abs = safeResolve(targetDir, entry.path);
    } catch (err) {
      preserved.push(entry.path);
      errors.push({
        path: entry.path,
        message: err instanceof Error ? err.message : String(err),
      });
      continue;
    }
    let st;
    try {
      st = await lstat(abs);
    } catch {
      missing.push(entry.path);
      continue;
    }
    if (!st.isFile()) {
      // Symlink or directory replaced the tracked file.
      if (opts.force && st.isSymbolicLink()) toRemove.push({ abs, rel: entry.path });
      else preserved.push(entry.path);
      continue;
    }
    const sum = await sha256File(abs);
    if (sum === entry.sha256) toRemove.push({ abs, rel: entry.path });
    else if (opts.force) toRemove.push({ abs, rel: entry.path });
    else preserved.push(entry.path);
  }

  if (opts.dryRun) {
    return {
      removed: toRemove.map((t) => t.rel),
      preserved,
      missing,
      removedDirs: [],
      errors,
      manifestKept: true,
      dryRun: true,
    };
  }

  if (!opts.yes && !opts.nonInteractive) {
    const proceed = await confirm({
      message: `Remove ${toRemove.length} installed file(s)? (${preserved.length} modified will be preserved)`,
      default: false,
    });
    if (!proceed) throw new Error("Aborted by user.");
  }

  const removed: string[] = [];
  const removedAbs: string[] = [];
  for (const { abs, rel } of toRemove) {
    try {
      await unlink(abs); // unlink removes a symlink itself, never its target
      removed.push(rel);
      removedAbs.push(abs);
    } catch (err) {
      errors.push({
        path: rel,
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const removedDirs = await pruneEmptyDirs(targetDir, removedAbs);

  // Only retire the installer's own metadata on a fully clean run, so a
  // partial uninstall (or one that preserved modified files) can be retried.
  const manifestKept = preserved.length > 0 || errors.length > 0;
  if (!manifestKept) {
    await rm(join(targetDir, PROFILE_FILENAME), { force: true });
    await rm(join(targetDir, MANIFEST_DIRNAME, MANIFEST_BASENAME), {
      force: true,
    });
    // Remove `.dojo` only if now empty (e.g. no backups present).
    try {
      await rmdir(join(targetDir, MANIFEST_DIRNAME));
    } catch {
      /* keep .dojo when backups or other state remain */
    }
  }

  return {
    removed,
    preserved,
    missing,
    removedDirs,
    errors,
    manifestKept,
    dryRun: false,
  };
}
