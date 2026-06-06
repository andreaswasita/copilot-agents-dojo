/**
 * Library entry point — re-exports for programmatic use (e.g. tests,
 * future plugin authors).
 */
export { runInit } from "./init.js";
export type { InitOptions, InitResult } from "./init.js";
export { PRESETS, PRESET_IDS } from "./presets.js";
export type { Preset, PresetId } from "./presets.js";
export {
  PROFILE_FILENAME,
  readProfile,
  writeProfile,
} from "./profile.js";
export type { DojoProfile } from "./profile.js";
export { fetchSubtree } from "./fetch.js";
export type { FetchOptions, FetchResult } from "./fetch.js";
export { renderInstructions } from "./generate.js";
export {
  MANIFEST_FILENAME,
  ManifestError,
  buildManifest,
  readManifest,
  writeManifest,
  sha256File,
  isSafeRelPath,
  safeResolve,
} from "./manifest.js";
export type { InstallManifest, ManifestFile } from "./manifest.js";
export { runDoctor } from "./doctor.js";
export type { DoctorReport, DoctorOptions } from "./doctor.js";
export { runUninstall } from "./uninstall.js";
export type { UninstallOptions, UninstallResult } from "./uninstall.js";
export { detectStacks, recommendPreset, summarizeStacks } from "./detect.js";
export type { Detection, StackEvidence, StackId } from "./detect.js";
