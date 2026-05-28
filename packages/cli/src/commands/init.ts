import path from "node:path";

import { cancel, confirm, intro, isCancel, log, outro, spinner } from "@clack/prompts";
import { execa } from "execa";
import pc from "picocolors";

import { createOrEnsureComponentsJson } from "../lib/components-json";
import { detectPackageManager, installCommand } from "../lib/pm";
import { ensureBabelConfig } from "../lib/patch/babel";
import { ensureGlobalCss } from "../lib/patch/global-css";
import { ensureMetroConfig } from "../lib/patch/metro";
import { ensureTailwindConfig } from "../lib/patch/tailwind";
import { ensureTsconfigPaths } from "../lib/patch/tsconfig";
import { hasDep, readProjectInfo } from "../lib/project";

interface InitOptions {
  lib?: boolean;
}

const DEFAULT_REANIMATED_MAJOR = 4;

export async function runInitCommand(opts: InitOptions) {
  intro(`${pc.bold(pc.bgMagenta(" appcn "))} ${pc.dim("init")}`);

  const cwd = process.cwd();
  let project;
  try {
    project = await readProjectInfo(cwd);
  } catch (err) {
    log.error((err as Error).message);
    cancel("Aborted");
    process.exit(1);
  }

  if (project.kind === "unknown") {
    log.error(
      "This does not look like an Expo or React Native project (no `expo` or `react-native` dependency)."
    );
    log.message(`Start one with ${pc.cyan("npx create-expo-app@latest")} first.`);
    cancel("Aborted");
    process.exit(1);
  }

  const reanimatedMajor = project.reanimatedMajor ?? DEFAULT_REANIMATED_MAJOR;
  if (project.reanimatedMajor === null) {
    log.info(
      `react-native-reanimated not detected — assuming v${DEFAULT_REANIMATED_MAJOR} (current Expo default).`
    );
  }

  log.step(
    `Detected ${pc.cyan(project.kind === "expo" ? "Expo" : "bare React Native")} · ` +
      `reanimated v${reanimatedMajor}`
  );

  // ─── Install runtime deps ──────────────────────────────────────────────
  const pm = await detectPackageManager(cwd);
  const needed = computeMissingDeps(project, reanimatedMajor, opts.lib === true);

  if (needed.length > 0) {
    log.message(
      `Will install with ${pc.cyan(pm)}: ${needed.map((p) => pc.bold(p)).join(", ")}`
    );
    const ok = await confirm({ message: "Proceed?", initialValue: true });
    if (isCancel(ok) || ok === false) {
      cancel("Aborted — no files have been changed.");
      process.exit(1);
    }
    const cmd = installCommand(pm, needed);
    const head = cmd[0];
    if (!head) {
      cancel("Could not resolve a package manager command.");
      process.exit(1);
    }
    const install = spinner();
    install.start(`Installing (${cmd.join(" ")})`);
    try {
      await execa(head, cmd.slice(1), { cwd, stdio: "pipe" });
      install.stop(`${pc.green("✓")} Installed runtime deps`);
    } catch (err) {
      install.stop(pc.red("Install failed"));
      log.error((err as Error).message);
      process.exit(1);
    }
  } else {
    log.success("Runtime deps already installed.");
  }

  // ─── Patch config files ────────────────────────────────────────────────
  const manualSteps: string[] = [];
  const createdFiles: string[] = [];
  const isExpo = project.kind === "expo";

  const tw = await ensureTailwindConfig(cwd);
  reportSimple("tailwind.config.js", tw, manualSteps, createdFiles);

  const babel = await ensureBabelConfig(cwd, reanimatedMajor, isExpo);
  reportSimple("babel.config.js", babel, manualSteps, createdFiles);

  const metro = await ensureMetroConfig(cwd, isExpo);
  reportSimple("metro.config.js", metro, manualSteps, createdFiles);

  const css = await ensureGlobalCss(cwd);
  reportSimple("global.css", css, manualSteps, createdFiles);
  if (css.kind === "created") {
    manualSteps.push(
      `Import ${pc.cyan('"./global.css"')} once in your app entry (e.g. ${pc.cyan("app/_layout.tsx")}).`
    );
  }

  const tsc = await ensureTsconfigPaths(cwd);
  reportTsconfig(tsc, createdFiles);

  const cj = await createOrEnsureComponentsJson(cwd);
  if (cj === "created") {
    createdFiles.push("components.json");
    log.success(`Wrote ${pc.cyan("components.json")}`);
  } else if (cj === "patched") {
    log.success(`Patched ${pc.cyan("components.json")} (@app-cn registry)`);
  } else {
    log.info(`components.json already up to date`);
  }

  // ─── Final summary ─────────────────────────────────────────────────────
  if (createdFiles.length > 0) {
    log.message(
      `${pc.dim("Created:")} ${createdFiles.map((f) => pc.cyan(f)).join(", ")}`
    );
  }

  if (manualSteps.length > 0) {
    log.warn("A couple of steps need your attention:");
    for (const step of manualSteps) log.message(`  • ${step}`);
  }

  outro(
    `${pc.green("✓")} Ready. Try ${pc.bold("appcn add button")} ` +
      `or browse ${pc.cyan("https://appcn.vercel.app/components")}.`
  );
}

function computeMissingDeps(
  project: Awaited<ReturnType<typeof readProjectInfo>>,
  reanimatedMajor: 3 | 4,
  installLib: boolean
): string[] {
  const wanted: string[] = [];
  if (!hasDep(project.pkg, "nativewind")) wanted.push("nativewind@^4");
  if (!hasDep(project.pkg, "react-native-reanimated")) {
    wanted.push(
      reanimatedMajor === 4 ? "react-native-reanimated@^4" : "react-native-reanimated@^3"
    );
  }
  if (!hasDep(project.pkg, "react-native-gesture-handler")) {
    wanted.push("react-native-gesture-handler");
  }
  if (reanimatedMajor === 4 && !hasDep(project.pkg, "react-native-worklets")) {
    wanted.push("react-native-worklets");
  }
  if (project.kind === "expo" && !hasDep(project.pkg, "expo-haptics")) {
    wanted.push("expo-haptics");
  }
  if (!hasDep(project.pkg, "tailwindcss")) {
    wanted.push("tailwindcss@~3");
  }
  if (installLib && !hasDep(project.pkg, "@app-cn/ui")) {
    wanted.push("@app-cn/ui");
  }
  return wanted;
}

type PatchResult =
  | { kind: "created"; filePath: string }
  | { kind: "ok"; filePath: string }
  | { kind: "needs-edit"; filePath: string; required: string[] }
  | { kind: "created"; filePath: string; plugin: string }
  | { kind: "needs-edit"; filePath: string; required: string[]; plugin: string };

function reportSimple(
  label: string,
  result: PatchResult,
  manualSteps: string[],
  createdFiles: string[]
) {
  const rel = path.relative(process.cwd(), result.filePath) || result.filePath;
  if (result.kind === "created") {
    createdFiles.push(rel);
    log.success(`Wrote ${pc.cyan(rel)}`);
    return;
  }
  if (result.kind === "ok") {
    log.info(`${rel} already up to date`);
    return;
  }
  log.warn(`${rel} needs manual edits:`);
  for (const r of result.required) {
    log.message(`  • ${r}`);
    manualSteps.push(`${rel}: ${r}`);
  }
}

function reportTsconfig(
  result: Awaited<ReturnType<typeof ensureTsconfigPaths>>,
  createdFiles: string[]
) {
  const rel = path.relative(process.cwd(), result.filePath) || result.filePath;
  if (result.kind === "created") {
    createdFiles.push(rel);
    log.success(`Wrote ${pc.cyan(rel)}`);
    return;
  }
  if (result.kind === "ok") {
    log.info(`${rel} already up to date`);
    return;
  }
  log.success(`Patched ${pc.cyan(rel)} (${result.added.join(", ")})`);
}

