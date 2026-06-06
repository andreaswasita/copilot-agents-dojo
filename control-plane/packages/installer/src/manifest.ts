/**
 * Install manifest — a checksummed record of every file the installer wrote.
 *
 * Stored at `<target>/.dojo/install-manifest.json`. It is the authoritative
 * source for drift detection (`doctor`) and preserve-modified `uninstall`.
 *
 * Schema v1:
 *   { version: 1, installer_version, preset, ref, generated_at,
 *     files: [ { path: <posix-rel-to-target>, sha256, bytes }, ... ] }
 *
 * `files` is sorted by path. The manifest tracks installed *content* only —
 * the volatile `.dojo-profile.yml` and the backups directory are deliberately
 * excluded (the profile carries a per-install timestamp; backups are sacred).
 *
 * SECURITY: every path read back from a manifest is treated as untrusted —
 * `doctor`/`uninstall` must resolve it through `safeResolve()` before touching
 * the filesystem, so a tampered manifest cannot escape the target directory.
 */
import { createHash } from "node:crypto";
import { lstat, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";

export const MANIFEST_DIRNAME = ".dojo";
export const MANIFEST_BASENAME = "install-manifest.json";
export const MANIFEST_FILENAME = `${MANIFEST_DIRNAME}/${MANIFEST_BASENAME}`;

export interface ManifestFile {
  path: string; // POSIX, relative to target
  sha256: string;
  bytes: number;
}

export interface InstallManifest {
  version: 1;
  installer_version: string;
  preset: string;
  ref: string;
  generated_at: string;
  files: ManifestFile[];
}

/** Thrown when a manifest exists but cannot be trusted (bad JSON / shape). */
export class ManifestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ManifestError";
  }
}

/** Convert an absolute path to a POSIX path relative to `targetDir`. */
export function toPosixRel(targetDir: string, absPath: string): string {
  return relative(targetDir, absPath).split(sep).join("/");
}

/**
 * Reject anything that is not a plain, descending, relative POSIX path.
 * Blocks absolutes, drive letters, UNC, backslashes, NULs, empty/`.`/`..`
 * segments — the building blocks of a path-traversal escape.
 */
export function isSafeRelPath(p: string): boolean {
  if (!p || p.includes("\0")) return false;
  if (p.startsWith("/") || p.startsWith("\\")) return false;
  if (/^[A-Za-z]:/.test(p)) return false;
  if (p.includes("\\")) return false;
  for (const seg of p.split("/")) {
    if (seg === "" || seg === "." || seg === "..") return false;
  }
  return true;
}

/**
 * Resolve a manifest-relative path against `targetDir`, throwing if the path
 * is unsafe or would escape the target tree. Callers MUST use this before any
 * filesystem mutation driven by manifest contents.
 */
export function safeResolve(targetDir: string, relPosix: string): string {
  if (!isSafeRelPath(relPosix)) {
    throw new ManifestError(`unsafe manifest path: ${relPosix}`);
  }
  const rootRes = resolve(targetDir);
  const abs = resolve(rootRes, relPosix);
  const back = relative(rootRes, abs);
  if (back.startsWith("..") || isAbsolute(back)) {
    throw new ManifestError(`manifest path escapes target: ${relPosix}`);
  }
  return abs;
}

/** sha256 (hex) of a file's bytes. Caller must lstat-guard against symlinks. */
export async function sha256File(absPath: string): Promise<string> {
  const buf = await readFile(absPath);
  return createHash("sha256").update(buf).digest("hex");
}

export interface BuildManifestArgs {
  targetDir: string;
  absFiles: string[];
  installerVersion: string;
  preset: string;
  ref: string;
  /** Override for deterministic tests. */
  generatedAt?: string;
}

/** Compute a manifest from a set of just-written absolute file paths. */
export async function buildManifest(
  args: BuildManifestArgs,
): Promise<InstallManifest> {
  const seen = new Set<string>();
  const files: ManifestFile[] = [];
  for (const abs of args.absFiles) {
    const relPosix = toPosixRel(args.targetDir, abs);
    if (!isSafeRelPath(relPosix) || seen.has(relPosix)) continue;
    let st;
    try {
      st = await lstat(abs);
    } catch {
      continue; // skip vanished entries rather than failing the install
    }
    if (!st.isFile()) continue; // regular files only
    seen.add(relPosix);
    files.push({
      path: relPosix,
      sha256: await sha256File(abs),
      bytes: st.size,
    });
  }
  files.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
  return {
    version: 1,
    installer_version: args.installerVersion,
    preset: args.preset,
    ref: args.ref,
    generated_at: args.generatedAt ?? new Date().toISOString(),
    files,
  };
}

/** Write the manifest atomically (temp file + rename). Returns its path. */
export async function writeManifest(
  targetDir: string,
  manifest: InstallManifest,
): Promise<string> {
  const path = join(targetDir, MANIFEST_DIRNAME, MANIFEST_BASENAME);
  await mkdir(dirname(path), { recursive: true });
  const body = JSON.stringify(manifest, null, 2) + "\n";
  const tmp = `${path}.tmp-${process.pid}`;
  await writeFile(tmp, body, "utf8");
  await rename(tmp, path);
  return path;
}

/**
 * Read and validate the manifest. Returns `null` when absent; throws
 * `ManifestError` when present but corrupt or malformed.
 */
export async function readManifest(
  targetDir: string,
): Promise<InstallManifest | null> {
  const path = join(targetDir, MANIFEST_DIRNAME, MANIFEST_BASENAME);
  let raw: string;
  try {
    raw = await readFile(path, "utf8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new ManifestError("install-manifest.json is not valid JSON");
  }
  if (
    !parsed ||
    typeof parsed !== "object" ||
    (parsed as InstallManifest).version !== 1 ||
    !Array.isArray((parsed as InstallManifest).files)
  ) {
    throw new ManifestError("install-manifest.json is malformed");
  }
  for (const f of (parsed as InstallManifest).files) {
    if (!f || typeof f.path !== "string" || typeof f.sha256 !== "string") {
      throw new ManifestError("install-manifest.json has a malformed file entry");
    }
  }
  return parsed as InstallManifest;
}
