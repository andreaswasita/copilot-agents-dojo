/**
 * `copilot-dojo doctor` — drift detection against the install manifest.
 *
 * Recomputes each tracked file's checksum and classifies it:
 *   - ok       regular file, checksum matches the manifest
 *   - modified regular file, checksum differs (user edited it)
 *   - missing  the file is gone
 *   - unsafe   not a regular file (symlink / directory) or an unsafe path
 *
 * It also sanity-checks `.dojo-profile.yml` (presence + agreement with the
 * manifest's preset/ref) and surfaces those as separate warnings rather than
 * content drift.
 */
import { lstat } from "node:fs/promises";

import {
  readManifest,
  safeResolve,
  sha256File,
  type InstallManifest,
} from "./manifest.js";
import { readProfile } from "./profile.js";

export interface DoctorReport {
  ok: string[];
  modified: string[];
  missing: string[];
  unsafe: string[];
  profileWarnings: string[];
  healthy: boolean;
  manifest: InstallManifest;
}

export interface DoctorOptions {
  targetDir: string;
}

/**
 * Run drift detection. Returns `null` when no manifest is present.
 * Throws `ManifestError` (from `readManifest`) when the manifest is corrupt.
 */
export async function runDoctor(
  opts: DoctorOptions,
): Promise<DoctorReport | null> {
  const manifest = await readManifest(opts.targetDir);
  if (!manifest) return null;

  const report: DoctorReport = {
    ok: [],
    modified: [],
    missing: [],
    unsafe: [],
    profileWarnings: [],
    healthy: true,
    manifest,
  };

  for (const entry of manifest.files) {
    let abs: string;
    try {
      abs = safeResolve(opts.targetDir, entry.path);
    } catch {
      report.unsafe.push(entry.path);
      continue;
    }
    let st;
    try {
      st = await lstat(abs);
    } catch {
      report.missing.push(entry.path);
      continue;
    }
    if (!st.isFile()) {
      report.unsafe.push(entry.path);
      continue;
    }
    const sum = await sha256File(abs);
    if (sum === entry.sha256) report.ok.push(entry.path);
    else report.modified.push(entry.path);
  }

  // Profile sanity (separate from content drift).
  let profile = null;
  try {
    profile = await readProfile(opts.targetDir);
  } catch {
    report.profileWarnings.push(".dojo-profile.yml is present but unreadable");
  }
  if (!profile) {
    report.profileWarnings.push(".dojo-profile.yml is missing or unreadable");
  } else {
    if (profile.preset !== manifest.preset) {
      report.profileWarnings.push(
        `profile preset (${profile.preset}) disagrees with manifest (${manifest.preset})`,
      );
    }
    if (profile.ref !== manifest.ref) {
      report.profileWarnings.push(
        `profile ref (${profile.ref}) disagrees with manifest (${manifest.ref})`,
      );
    }
  }

  report.healthy =
    report.modified.length === 0 &&
    report.missing.length === 0 &&
    report.unsafe.length === 0;
  return report;
}
