import { execFileSync } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";
import { relative } from "node:path";

export interface GitCommit {
  sha: string;
  date: string;
  author: string;
  message: string;
  sessionId: string | null;
}

function isGitRepo(dojoRoot: string): boolean {
  try {
    execFileSync("git", ["rev-parse", "--is-inside-work-tree"], {
      cwd: dojoRoot,
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
}

function parseSessionId(message: string): string | null {
  const m = message.match(/session[:\s]+([a-z0-9-]{6,})/i);
  return m?.[1] ?? null;
}

export function getFileHistory(dojoRoot: string, filePath: string, limit = 50): GitCommit[] {
  if (!isGitRepo(dojoRoot)) return [];
  if (!existsSync(filePath)) return [];

  try {
    const out = execFileSync(
      "git",
      [
        "log",
        "--follow",
        `--max-count=${limit}`,
        "--pretty=format:%H%x00%aI%x00%an%x00%s",
        "--",
        filePath,
      ],
      { cwd: dojoRoot, encoding: "utf-8" },
    );
    return out
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const [sha, date, author, message] = line.split("\u0000");
        return {
          sha,
          date,
          author,
          message,
          sessionId: parseSessionId(message ?? ""),
        };
      });
  } catch {
    return [];
  }
}

export function getFileAtSha(
  dojoRoot: string,
  filePath: string,
  sha: string,
): string | null {
  if (!isGitRepo(dojoRoot)) return null;
  if (!/^[0-9a-f]{4,40}$/i.test(sha)) return null;
  const rel = relative(dojoRoot, filePath);
  try {
    return execFileSync("git", ["show", `${sha}:${rel}`], {
      cwd: dojoRoot,
      encoding: "utf-8",
    });
  } catch {
    return null;
  }
}

export function listVaultAtSha(
  dojoRoot: string,
  sha: string,
): Array<{ slug: string; type: string }> {
  if (!isGitRepo(dojoRoot)) return [];
  if (!/^[0-9a-f]{4,40}$/i.test(sha)) return [];

  try {
    const out = execFileSync(
      "git",
      ["ls-tree", "-r", "--name-only", sha, "memory/"],
      { cwd: dojoRoot, encoding: "utf-8" },
    );
    const entries: Array<{ slug: string; type: string }> = [];
    const valid = new Set(["decisions", "patterns", "preferences", "sessions"]);
    for (const line of out.split("\n").filter(Boolean)) {
      if (!line.endsWith(".md")) continue;
      const rel = line.replace(/^memory\//, "");
      const parts = rel.split("/");
      if (parts.length !== 2) continue;
      const [folder, file] = parts;
      if (!valid.has(folder)) continue;
      if (file === "_template.md") continue;
      const slug = `${folder}/${file.replace(/\.md$/, "")}`;
      entries.push({ slug, type: folder.replace(/s$/, "") });
    }
    return entries;
  } catch {
    return [];
  }
}

export function restoreFileFromSha(
  dojoRoot: string,
  filePath: string,
  sha: string,
  options: { commit?: boolean } = {},
): { restored: boolean; restoredSha: string | null; commitSha: string | null; error?: string } {
  if (!isGitRepo(dojoRoot)) {
    return { restored: false, restoredSha: null, commitSha: null, error: "Not a git repo" };
  }
  if (!/^[0-9a-f]{4,40}$/i.test(sha)) {
    return { restored: false, restoredSha: null, commitSha: null, error: "Invalid sha" };
  }

  const content = getFileAtSha(dojoRoot, filePath, sha);
  if (content === null) {
    return { restored: false, restoredSha: null, commitSha: null, error: `File not found at ${sha}` };
  }

  try {
    writeFileSync(filePath, content, "utf-8");
  } catch (err) {
    return {
      restored: false,
      restoredSha: null,
      commitSha: null,
      error: err instanceof Error ? err.message : String(err),
    };
  }

  if (!options.commit) {
    return { restored: true, restoredSha: sha, commitSha: null };
  }

  try {
    const rel = relative(dojoRoot, filePath);
    execFileSync("git", ["add", "--", rel], { cwd: dojoRoot, stdio: "ignore" });
    execFileSync(
      "git",
      ["commit", "-m", `chore(memory): restore ${rel} from ${sha.slice(0, 8)}`],
      { cwd: dojoRoot, stdio: "ignore" },
    );
    const commitSha = execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: dojoRoot,
      encoding: "utf-8",
    }).trim();
    return { restored: true, restoredSha: sha, commitSha };
  } catch (err) {
    return {
      restored: true,
      restoredSha: sha,
      commitSha: null,
      error: `File restored but commit failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

export { isGitRepo };
