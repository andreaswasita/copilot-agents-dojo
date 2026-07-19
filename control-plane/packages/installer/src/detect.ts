/**
 * Stack auto-detection (G14).
 *
 * Best-effort inspection of a target project to figure out which tech stack(s)
 * it uses, so `copilot-dojo init` can pre-select a sensible preset instead of
 * making the user pick blind. Detection is purely advisory: it never throws and
 * never blocks an install — on any filesystem/parse error it records a warning
 * and returns what it could find.
 *
 * The recommendation deliberately stays conservative (it only ever suggests a
 * *default* the user can override): a real test signal points at the
 * test-driven preset, a populated codebase without tests points at onboarding,
 * and an empty/infra-only project keeps the minimal "lean" footprint. We never
 * auto-select the largest bundle from a weak marker.
 */
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

import type { PresetId } from "./presets.js";

export type StackId =
  | "node"
  | "typescript"
  | "frontend"
  | "python"
  | "go"
  | "rust"
  | "java"
  | "dotnet"
  | "ruby"
  | "php"
  | "docker"
  | "terraform";

export interface StackEvidence {
  stack: StackId;
  label: string;
  /** Sorted, unique POSIX-relative paths that triggered the detection. */
  markers: string[];
}

export interface Detection {
  stacks: StackEvidence[];
  hasTests: boolean;
  hasCI: boolean;
  recommendedPreset: PresetId;
  reason: string;
  warnings: string[];
}

/** Directories never worth descending into. */
const IGNORE_DIRS = new Set([
  "node_modules",
  ".git",
  ".dojo",
  "dist",
  "build",
  "out",
  ".next",
  "coverage",
  "vendor",
  "target",
  "__pycache__",
  ".venv",
  "venv",
]);

/** Maximum *directory* depth to walk (so apps/web/package.json is reachable). */
const MAX_DEPTH = 3;

/** Infra markers describe deployment, not an application codebase, so they are
 *  shown but excluded from the preset recommendation. */
const INFRA: ReadonlySet<StackId> = new Set<StackId>(["docker", "terraform"]);

const LABELS: Record<StackId, string> = {
  node: "Node.js",
  typescript: "TypeScript",
  frontend: "Frontend (SPA)",
  python: "Python",
  go: "Go",
  rust: "Rust",
  java: "Java/JVM",
  dotnet: ".NET",
  ruby: "Ruby",
  php: "PHP",
  docker: "Docker",
  terraform: "Terraform",
};

/** Fixed display/sort order for stacks. */
const STACK_ORDER: StackId[] = [
  "node",
  "typescript",
  "frontend",
  "python",
  "go",
  "rust",
  "java",
  "dotnet",
  "ruby",
  "php",
  "docker",
  "terraform",
];

interface Entry {
  /** POSIX-relative path from the target root. */
  rel: string;
  name: string;
  isDir: boolean;
}

/** Best-effort bounded walk. Records (does not throw) on read errors. */
async function walk(targetDir: string, warnings: string[]): Promise<Entry[]> {
  const out: Entry[] = [];

  async function visit(absDir: string, relDir: string, depth: number): Promise<void> {
    let dirents;
    try {
      dirents = await readdir(absDir, { withFileTypes: true });
    } catch (err) {
      warnings.push(`could not read ${relDir || "."}: ${(err as Error).message}`);
      return;
    }
    for (const d of dirents) {
      const rel = relDir ? `${relDir}/${d.name}` : d.name;
      const isDir = d.isDirectory();
      out.push({ rel, name: d.name, isDir });
      if (isDir && !IGNORE_DIRS.has(d.name) && depth < MAX_DEPTH) {
        await visit(join(absDir, d.name), rel, depth + 1);
      }
    }
  }

  await visit(targetDir, "", 1);
  return out;
}

/** Read and JSON-parse a file; on any error returns null and warns. */
async function readJson(
  targetDir: string,
  rel: string,
  warnings: string[],
): Promise<Record<string, unknown> | null> {
  try {
    const raw = await readFile(join(targetDir, rel), "utf8");
    return JSON.parse(raw) as Record<string, unknown>;
  } catch (err) {
    warnings.push(`could not parse ${rel}: ${(err as Error).message}`);
    return null;
  }
}

async function readText(
  targetDir: string,
  rel: string,
  warnings: string[],
): Promise<string> {
  try {
    return await readFile(join(targetDir, rel), "utf8");
  } catch (err) {
    warnings.push(`could not read ${rel}: ${(err as Error).message}`);
    return "";
  }
}

const FRONTEND_DEPS = [
  "react",
  "react-dom",
  "vue",
  "svelte",
  "next",
  "nuxt",
  "@angular/core",
  "solid-js",
  "preact",
];
const TEST_DEPS = [
  "jest",
  "vitest",
  "mocha",
  "jasmine",
  "ava",
  "@playwright/test",
  "cypress",
];

function depsOf(pkg: Record<string, unknown>): Record<string, string> {
  const merged: Record<string, string> = {};
  for (const key of ["dependencies", "devDependencies", "peerDependencies"]) {
    const block = pkg[key];
    if (block && typeof block === "object") {
      for (const [k, v] of Object.entries(block as Record<string, unknown>)) {
        merged[k] = String(v);
      }
    }
  }
  return merged;
}

/**
 * Inspect `targetDir` and return detected stacks, signals, and a recommended
 * preset. Never throws.
 */
export async function detectStacks(targetDir: string): Promise<Detection> {
  const warnings: string[] = [];
  const entries = await walk(targetDir, warnings);

  const markersByStack = new Map<StackId, Set<string>>();
  const add = (stack: StackId, marker: string): void => {
    let set = markersByStack.get(stack);
    if (!set) {
      set = new Set<string>();
      markersByStack.set(stack, set);
    }
    set.add(marker);
  };

  let hasTests = false;
  let hasCI = false;

  for (const e of entries) {
    const lower = e.name.toLowerCase();

    if (e.isDir) {
      if (["tests", "test", "__tests__", "spec"].includes(lower)) hasTests = true;
      continue;
    }

    if (/\.(test|spec)\.[a-z0-9]+$/.test(lower)) hasTests = true;
    if (e.rel.startsWith(".github/workflows/") && /\.ya?ml$/.test(lower)) hasCI = true;

    switch (true) {
      case e.name === "package.json":
        add("node", e.rel);
        break;
      case e.name === "tsconfig.json":
        add("typescript", e.rel);
        break;
      case e.name === "go.mod":
        add("go", e.rel);
        break;
      case e.name === "Cargo.toml":
        add("rust", e.rel);
        break;
      case e.name === "pom.xml":
      case e.name === "build.gradle":
      case e.name === "build.gradle.kts":
        add("java", e.rel);
        break;
      case /\.(csproj|sln|fsproj)$/.test(lower):
        add("dotnet", e.rel);
        break;
      case e.name === "Gemfile":
        add("ruby", e.rel);
        break;
      case e.name === "composer.json":
        add("php", e.rel);
        break;
      case e.name === "Dockerfile":
      case e.name === "docker-compose.yml":
      case e.name === "docker-compose.yaml":
      case e.name === "compose.yaml":
        add("docker", e.rel);
        break;
      case /\.tf$/.test(lower):
        add("terraform", e.rel);
        break;
      case e.name === "pyproject.toml":
      case e.name === "requirements.txt":
      case e.name === "setup.py":
      case e.name === "Pipfile":
        add("python", e.rel);
        break;
      default:
        break;
    }
  }

  // Refine Node projects via their manifests (typescript / frontend / tests).
  const pkgRels = [...(markersByStack.get("node") ?? [])];
  for (const rel of pkgRels) {
    const pkg = await readJson(targetDir, rel, warnings);
    if (!pkg) continue;
    const deps = depsOf(pkg);
    if ("typescript" in deps) add("typescript", rel);
    if (FRONTEND_DEPS.some((d) => d in deps)) add("frontend", rel);
    if (TEST_DEPS.some((d) => d in deps)) hasTests = true;
    if (
      pkg.scripts &&
      typeof pkg.scripts === "object" &&
      "test" in (pkg.scripts as Record<string, unknown>)
    ) {
      const t = String((pkg.scripts as Record<string, unknown>).test ?? "");
      // npm's default placeholder is not a real test signal.
      if (t && !/no test specified/i.test(t)) hasTests = true;
    }
  }

  // Refine Python projects: pytest is a strong test signal.
  for (const rel of [...(markersByStack.get("python") ?? [])]) {
    const text = await readText(targetDir, rel, warnings);
    if (/pytest/i.test(text)) hasTests = true;
  }

  const stacks: StackEvidence[] = STACK_ORDER.filter((s) =>
    markersByStack.has(s),
  ).map((s) => ({
    stack: s,
    label: LABELS[s],
    markers: [...(markersByStack.get(s) as Set<string>)].sort(),
  }));

  const { recommendedPreset, reason } = recommendPreset({
    stacks,
    hasTests,
    hasCI,
    recommendedPreset: "lean",
    reason: "",
    warnings,
  });

  return { stacks, hasTests, hasCI, recommendedPreset, reason, warnings };
}

/**
 * Pure recommendation from a detection result. Conservative by design — only a
 * real test signal or a populated codebase changes the default away from lean.
 */
export function recommendPreset(d: Detection): {
  recommendedPreset: PresetId;
  reason: string;
} {
  const appStacks = d.stacks.filter((s) => !INFRA.has(s.stack));

  if (d.hasTests) {
    return {
      recommendedPreset: "tdd-focus",
      reason: "Tests detected — recommending a test-driven workflow.",
    };
  }
  if (appStacks.length > 0) {
    return {
      recommendedPreset: "onboarding",
      reason:
        "Existing codebase with no strong test signal — recommending onboarding to map it first.",
    };
  }
  return {
    recommendedPreset: "lean",
    reason: "No application stack detected — recommending a minimal footprint.",
  };
}

/** One-line human summary of detected stacks, for CLI output. */
export function summarizeStacks(d: Detection): string {
  if (d.stacks.length === 0) return "no recognised stack";
  const names = d.stacks.map((s) => s.label);
  const extra: string[] = [];
  if (d.hasTests) extra.push("tests");
  if (d.hasCI) extra.push("CI");
  const suffix = extra.length ? ` (+${extra.join(", ")})` : "";
  return names.join(", ") + suffix;
}
