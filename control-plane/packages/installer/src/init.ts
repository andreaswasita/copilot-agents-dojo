/**
 * `copilot-dojo init` — main orchestration.
 *
 * Steps (in order):
 *   1. Resolve target directory (default: cwd).
 *   2. Load existing `.dojo-profile.yml` if any (update flow vs fresh).
 *   3. Pick preset (CLI flag, profile carry-over, or interactive).
 *   4. Resolve include list = skills/<id> ∪ agents/<id>.md ∪ template + spec.
 *   5. Snapshot any files we're about to overwrite into backups dir.
 *   6. Fetch tarball, extract included entries into target.
 *   7. Generate `.github/copilot-instructions.md`.
 *   8. Write `.dojo-profile.yml`.
 *   9. Print summary.
 *
 * `--dry-run` short-circuits before any disk mutation.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { confirm, select } from "@inquirer/prompts";
import kleur from "kleur";

import { BackupSet } from "./backup.js";
import { fetchSubtree } from "./fetch.js";
import { renderInstructions } from "./generate.js";
import { buildManifest, writeManifest } from "./manifest.js";
import { PRESETS, type Preset, type PresetId, PRESET_IDS } from "./presets.js";
import {
  PROFILE_FILENAME,
  readProfile,
  writeProfile,
  type DojoProfile,
} from "./profile.js";

export interface InitOptions {
  targetDir: string;
  presetId?: PresetId | "custom";
  ref?: string;
  yes?: boolean;
  dryRun?: boolean;
  owner?: string;
  repo?: string;
  /** When true, never prompt — fail if input is missing. Used by tests. */
  nonInteractive?: boolean;
  /** Installer's own version string — written to the profile. */
  installerVersion: string;
}

export interface InitResult {
  preset: Preset;
  ref: string;
  writtenFiles: string[];
  profilePath: string;
  instructionsPath: string;
  manifestPath?: string;
  backupRoot?: string;
  dryRun: boolean;
}

const DEFAULT_OWNER = "andreaswasita";
const DEFAULT_REPO = "copilot-agents-dojo";
const DEFAULT_REF = "main";

function pickPresetFromExisting(
  existing: DojoProfile | null,
  flag: PresetId | "custom" | undefined,
): PresetId | "custom" | undefined {
  if (flag) return flag;
  if (existing) return existing.preset;
  return undefined;
}

async function chooseInteractive(
  initial: PresetId | undefined,
): Promise<PresetId> {
  return (await select<PresetId>({
    message: "Pick a preset",
    default: initial ?? "lean",
    choices: PRESET_IDS.map((id) => ({
      name: `${PRESETS[id].label} — ${PRESETS[id].description}`,
      value: id,
    })),
  })) as PresetId;
}

function resolveSkillPaths(preset: Preset): string[] {
  const includes = new Set<string>();
  for (const id of preset.skills) {
    includes.add(`skills/${id}`);
  }
  for (const id of preset.agents) {
    includes.add(`agents/${id}.md`);
  }
  // Always include the contract docs so agents can self-reference.
  includes.add("spec/copilot-skills-spec.md");
  includes.add("template/SKILL.md");
  return [...includes];
}

async function ensureGithubDir(targetDir: string): Promise<string> {
  const ghDir = join(targetDir, ".github");
  await mkdir(ghDir, { recursive: true });
  return ghDir;
}

export async function runInit(opts: InitOptions): Promise<InitResult> {
  const owner = opts.owner ?? DEFAULT_OWNER;
  const repo = opts.repo ?? DEFAULT_REPO;
  const ref = opts.ref ?? DEFAULT_REF;
  const targetDir = opts.targetDir;

  const existing = await readProfile(targetDir);
  if (existing) {
    console.log(
      kleur.dim(
        `Detected existing ${PROFILE_FILENAME} (preset=${existing.preset}, ref=${existing.ref}); updating in place.`,
      ),
    );
  }

  let chosen = pickPresetFromExisting(existing, opts.presetId);
  if (chosen === "custom") {
    throw new Error(
      "--preset custom is not implemented in v1. Pick one of: " +
        PRESET_IDS.join(", "),
    );
  }

  if (!chosen) {
    if (opts.yes || opts.nonInteractive) {
      chosen = "lean"; // sensible default when --yes is passed without --preset
      console.log(kleur.dim(`No --preset given; defaulting to "lean" (--yes).`));
    } else {
      chosen = await chooseInteractive(existing?.preset as PresetId | undefined);
    }
  }

  const preset = PRESETS[chosen];
  if (!preset) {
    throw new Error(`Unknown preset: ${chosen}`);
  }

  const includes = resolveSkillPaths(preset);

  console.log(kleur.bold(`\n🥋 copilot-dojo init`));
  console.log(`   target: ${kleur.cyan(targetDir)}`);
  console.log(`   preset: ${kleur.cyan(preset.label)} (${preset.id})`);
  console.log(`   source: ${kleur.cyan(`${owner}/${repo}@${ref}`)}`);
  console.log(
    `   includes: ${preset.skills.length} skills, ${preset.agents.length} agents`,
  );

  if (opts.dryRun) {
    console.log(kleur.yellow("\n   (dry-run) no files written."));
    return {
      preset,
      ref,
      writtenFiles: [],
      profilePath: join(targetDir, PROFILE_FILENAME),
      instructionsPath: join(targetDir, ".github/copilot-instructions.md"),
      dryRun: true,
    };
  }

  if (
    !opts.yes &&
    !opts.nonInteractive &&
    !(await confirm({ message: "Proceed?", default: true }))
  ) {
    throw new Error("Aborted by user.");
  }

  // Snapshot anything we're about to clobber.
  const backups = new BackupSet(targetDir);
  await backups.snapshot(join(targetDir, ".github", "copilot-instructions.md"));
  await backups.snapshot(join(targetDir, PROFILE_FILENAME));
  for (const id of preset.skills) {
    await backups.snapshot(join(targetDir, "skills", id, "SKILL.md"));
  }
  for (const id of preset.agents) {
    await backups.snapshot(join(targetDir, "agents", `${id}.md`));
  }

  // Fetch + extract.
  const { written } = await fetchSubtree({
    owner,
    repo,
    ref,
    include: includes,
    destDir: targetDir,
  });

  // Generate copilot-instructions.md
  await ensureGithubDir(targetDir);
  const profile: DojoProfile = {
    version: 1,
    preset: preset.id,
    ref,
    skills: preset.skills,
    agents: preset.agents,
    installed_at: new Date().toISOString(),
    installer_version: opts.installerVersion,
  };
  const instructions = await renderInstructions(targetDir, profile);
  const instructionsPath = join(targetDir, ".github", "copilot-instructions.md");
  await writeFile(instructionsPath, instructions, "utf8");

  // Write profile.
  const profilePath = await writeProfile(targetDir, profile);

  // Record a checksummed manifest of installed content (fetched files +
  // the generated instructions). Drives `doctor` and `uninstall`.
  const manifest = await buildManifest({
    targetDir,
    absFiles: [...written, instructionsPath],
    installerVersion: opts.installerVersion,
    preset: preset.id,
    ref,
  });
  const manifestPath = await writeManifest(targetDir, manifest);

  console.log(kleur.green(`\n✅ Installed ${written.length} files.`));
  console.log(`   instructions: ${kleur.cyan(instructionsPath)}`);
  console.log(`   profile:      ${kleur.cyan(profilePath)}`);
  console.log(`   manifest:     ${kleur.cyan(manifestPath)}`);
  if (backups.used) {
    console.log(`   backups:      ${kleur.dim(backups.root)}`);
  }
  console.log(kleur.dim("\nNext: open the project in your editor; Copilot will pick up the instructions."));

  return {
    preset,
    ref,
    writtenFiles: written,
    profilePath,
    instructionsPath,
    manifestPath,
    backupRoot: backups.used ? backups.root : undefined,
    dryRun: false,
  };
}
