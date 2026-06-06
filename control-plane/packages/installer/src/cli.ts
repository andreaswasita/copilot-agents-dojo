#!/usr/bin/env node
/**
 * copilot-dojo CLI entry point.
 *
 * Usage:
 *   npx copilot-dojo init [target] [--preset <id>] [--ref <git-ref>] [--yes] [--dry-run]
 *
 * See README.md for the full flag matrix and the preset catalogue.
 */
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { Command } from "commander";
import kleur from "kleur";

import { runInit } from "./init.js";
import { ManifestError } from "./manifest.js";
import { runDoctor } from "./doctor.js";
import { runUninstall } from "./uninstall.js";
import { PRESET_IDS, type PresetId } from "./presets.js";

// __dirname-equivalent inside ESM
const HERE = fileURLToPath(new URL(".", import.meta.url));

async function readOwnVersion(): Promise<string> {
  try {
    const { readFile } = await import("node:fs/promises");
    const raw = await readFile(resolve(HERE, "..", "package.json"), "utf8");
    return (JSON.parse(raw) as { version?: string }).version ?? "0.0.0";
  } catch {
    return "0.0.0";
  }
}

async function main(): Promise<void> {
  const installerVersion = await readOwnVersion();
  const program = new Command();
  program
    .name("copilot-dojo")
    .description("Bootstrap the Copilot Agents Dojo into any project")
    .version(installerVersion);

  program
    .command("init")
    .description("Initialise (or update) a project's dojo configuration")
    .argument("[target]", "target directory (default: cwd)", ".")
    .option("--preset <id>", `preset to install: ${PRESET_IDS.join("|")}|custom`)
    .option("--ref <git-ref>", "git ref to install from", "main")
    .option("-y, --yes", "skip confirmation prompts")
    .option("--dry-run", "show what would be installed without writing files")
    .action(async (target: string, opts: Record<string, unknown>) => {
      try {
        await runInit({
          targetDir: resolve(target),
          presetId: opts.preset as PresetId | "custom" | undefined,
          ref: opts.ref as string | undefined,
          yes: Boolean(opts.yes),
          dryRun: Boolean(opts.dryRun),
          installerVersion,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(kleur.red(`\n❌ ${msg}`));
        process.exitCode = 1;
      }
    });

  program
    .command("doctor")
    .description("Check installed files against the manifest for drift")
    .argument("[target]", "target directory (default: cwd)", ".")
    .action(async (target: string) => {
      const targetDir = resolve(target);
      try {
        const report = await runDoctor({ targetDir });
        if (!report) {
          console.error(
            kleur.yellow(
              "No install manifest found. Run `copilot-dojo init` first.",
            ),
          );
          process.exitCode = 2;
          return;
        }
        console.log(kleur.bold("\n🩺 copilot-dojo doctor"));
        console.log(`   target: ${kleur.cyan(targetDir)}`);
        console.log(
          `   ${kleur.green(String(report.ok.length) + " ok")}, ` +
            `${kleur.yellow(String(report.modified.length) + " modified")}, ` +
            `${kleur.red(String(report.missing.length) + " missing")}, ` +
            `${kleur.red(String(report.unsafe.length) + " unsafe")}`,
        );
        for (const p of report.modified) console.log(kleur.yellow(`   ~ ${p}`));
        for (const p of report.missing) console.log(kleur.red(`   - ${p}`));
        for (const p of report.unsafe) console.log(kleur.red(`   ! ${p}`));
        for (const w of report.profileWarnings) console.log(kleur.dim(`   ⚠ ${w}`));
        if (report.healthy) {
          console.log(kleur.green("\n✅ No drift detected."));
        } else {
          console.log(
            kleur.yellow(
              "\n⚠️  Drift detected. Re-run `copilot-dojo init` to restore, or keep your edits.",
            ),
          );
          process.exitCode = 1;
        }
      } catch (err) {
        if (err instanceof ManifestError) {
          console.error(kleur.red(`\n❌ ${err.message}`));
          process.exitCode = 2;
          return;
        }
        throw err;
      }
    });

  program
    .command("uninstall")
    .description("Remove installed files, preserving any you have modified")
    .argument("[target]", "target directory (default: cwd)", ".")
    .option("-y, --yes", "skip confirmation prompt")
    .option("--force", "also remove files you have modified")
    .option("--dry-run", "show what would be removed without deleting")
    .action(async (target: string, opts: Record<string, unknown>) => {
      const targetDir = resolve(target);
      try {
        const result = await runUninstall({
          targetDir,
          yes: Boolean(opts.yes),
          force: Boolean(opts.force),
          dryRun: Boolean(opts.dryRun),
        });
        if (!result) {
          console.error(
            kleur.yellow(
              "No install manifest found — nothing to uninstall.",
            ),
          );
          process.exitCode = 2;
          return;
        }
        const verb = result.dryRun ? "would remove" : "removed";
        console.log(kleur.bold("\n🧹 copilot-dojo uninstall"));
        console.log(`   target: ${kleur.cyan(targetDir)}`);
        console.log(
          `   ${verb} ${result.removed.length}, ` +
            `preserved ${result.preserved.length} (modified), ` +
            `${result.missing.length} already gone`,
        );
        for (const p of result.preserved) console.log(kleur.yellow(`   keep ${p}`));
        for (const e of result.errors) console.log(kleur.red(`   ! ${e.path}: ${e.message}`));
        if (result.manifestKept && !result.dryRun) {
          console.log(
            kleur.dim(
              "\nManifest kept (preserved or failed files remain). Re-run with --force to finish.",
            ),
          );
        }
        if (result.errors.length > 0) process.exitCode = 1;
      } catch (err) {
        if (err instanceof ManifestError) {
          console.error(kleur.red(`\n❌ ${err.message}`));
          process.exitCode = 2;
          return;
        }
        throw err;
      }
    });

  await program.parseAsync(process.argv);
}

main().catch((err) => {
  console.error(kleur.red(`\n❌ Unexpected: ${String(err)}`));
  process.exit(1);
});
