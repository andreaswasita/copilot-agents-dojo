/**
 * Fetch a subtree from the dojo repo into a target directory.
 *
 * Strategy: download the GitHub tarball for the requested ref, stream it
 * through tar's extractor, and write only the entries that match the
 * caller's selection set. No git binary required — works inside a sandbox.
 *
 * Source URL shape:
 *   https://codeload.github.com/<owner>/<repo>/tar.gz/<ref>
 * Entries inside the tarball are prefixed `<repo>-<sha>/...`; we strip the
 * first path component when matching.
 *
 * Override with `DOJO_TARBALL_URL` to point at a local fixture file
 * (`file:///path/to/fixture.tar.gz`) for offline / CI tests.
 */
import { createReadStream } from "node:fs";
import { mkdir, rm } from "node:fs/promises";
import { dirname, join, posix } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";

import { extract } from "tar";

export interface FetchOptions {
  owner: string;
  repo: string;
  ref: string;
  /** Top-level path prefixes to keep (e.g. ["skills/plan-before-code", "agents/architect.md"]). */
  include: string[];
  /** Destination directory on disk (will be created). */
  destDir: string;
}

export interface FetchResult {
  /** Absolute paths of files written under destDir. */
  written: string[];
  /** Source URL used (for diagnostics). */
  source: string;
}

function tarballUrl(owner: string, repo: string, ref: string): string {
  const override = process.env.DOJO_TARBALL_URL;
  if (override && override.length > 0) return override;
  return `https://codeload.github.com/${owner}/${repo}/tar.gz/${ref}`;
}

function matchesInclude(stripped: string, include: string[]): boolean {
  // posix-style comparison; tar paths are always forward-slash.
  for (const prefix of include) {
    if (stripped === prefix) return true;
    if (stripped.startsWith(prefix + "/")) return true;
  }
  return false;
}

async function openSource(url: string): Promise<Readable> {
  if (url.startsWith("file://")) {
    return createReadStream(fileURLToPath(url));
  }
  if (url.startsWith("/") || /^[A-Za-z]:/.test(url)) {
    return createReadStream(url);
  }
  const res = await fetch(url, {
    headers: {
      "user-agent": "copilot-dojo-installer",
      accept: "application/octet-stream",
    },
    redirect: "follow",
  });
  if (!res.ok || !res.body) {
    throw new Error(`fetch ${url} failed: ${res.status} ${res.statusText}`);
  }
  return Readable.fromWeb(res.body as never);
}

export async function fetchSubtree(opts: FetchOptions): Promise<FetchResult> {
  const source = tarballUrl(opts.owner, opts.repo, opts.ref);
  await mkdir(opts.destDir, { recursive: true });
  const written: string[] = [];

  const input = await openSource(source);

  // tar.extract is a writable stream that processes the archive.
  // Note: node-tar passes the *original* (pre-strip) path to filter().
  // The first path component is "<repo>-<ref>/" and gets dropped by strip:1.
  const extractor = extract({
    cwd: opts.destDir,
    strip: 1,
    filter: (path: string) => {
      // Drop the first path component before matching includes.
      const normalised = posix.normalize(path).replace(/^\.?\/?/, "");
      const firstSlash = normalised.indexOf("/");
      if (firstSlash < 0) return false; // top-level dir entry itself
      const stripped = normalised.slice(firstSlash + 1);
      if (stripped.length === 0) return false;
      return matchesInclude(stripped, opts.include);
    },
    onentry: (entry) => {
      if (entry.type === "File" || entry.type === "OldFile" || entry.type === "ContiguousFile") {
        const normalised = posix.normalize(entry.path).replace(/^\.?\/?/, "");
        const firstSlash = normalised.indexOf("/");
        const stripped = firstSlash >= 0 ? normalised.slice(firstSlash + 1) : normalised;
        written.push(join(opts.destDir, stripped));
      }
    },
  });

  await pipeline(input, extractor);
  return { written, source };
}

/**
 * Convenience: rewrite the layout of installed paths so each skill folder
 * lands at `<projectRoot>/skills/<id>/` and agent files at
 * `<projectRoot>/agents/<id>.md`.
 *
 * The tarball naturally extracts them there, so this is currently a
 * no-op — kept as the integration point for future layout rewrites
 * (e.g. nesting under `.copilot/dojo/`).
 */
export async function _placeholder_reshape(_destDir: string): Promise<void> {
  void _destDir;
}

/** Remove a directory tree; ignore "not found". */
export async function rmIfExists(path: string): Promise<void> {
  try {
    await rm(path, { recursive: true, force: true });
  } catch {
    /* ignore */
  }
}

/** Ensure parent dir of a file path exists. */
export async function ensureParent(filePath: string): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });
}
