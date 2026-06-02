/**
 * Backup files we're about to overwrite so `init` is reversible.
 *
 * Backups live under `<target>/.dojo/installer-backups/<utc-ts>/` and
 * preserve relative paths. The directory is created lazily on the first
 * file that needs saving.
 */
import { copyFile, mkdir, stat } from "node:fs/promises";
import { dirname, join, relative } from "node:path";

export class BackupSet {
  private created = false;
  private readonly stamp: string;
  readonly root: string;

  constructor(
    private readonly targetDir: string,
    stamp?: string,
  ) {
    this.stamp = stamp ?? new Date().toISOString().replace(/[:.]/g, "-");
    this.root = join(targetDir, ".dojo", "installer-backups", this.stamp);
  }

  /**
   * If `path` exists, copy it under the backup root preserving its
   * relative position; return true if a backup was made.
   */
  async snapshot(path: string): Promise<boolean> {
    try {
      const s = await stat(path);
      if (!s.isFile()) return false;
    } catch {
      return false;
    }
    if (!this.created) {
      await mkdir(this.root, { recursive: true });
      this.created = true;
    }
    const rel = relative(this.targetDir, path);
    const dest = join(this.root, rel);
    await mkdir(dirname(dest), { recursive: true });
    await copyFile(path, dest);
    return true;
  }

  get used(): boolean {
    return this.created;
  }
}
