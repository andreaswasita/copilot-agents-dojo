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

  await program.parseAsync(process.argv);
}

main().catch((err) => {
  console.error(kleur.red(`\n❌ Unexpected: ${String(err)}`));
  process.exit(1);
});
