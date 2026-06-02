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
