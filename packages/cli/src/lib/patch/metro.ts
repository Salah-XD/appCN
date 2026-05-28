import { promises as fs } from "node:fs";
import path from "node:path";

export type MetroResult =
  | { kind: "created"; filePath: string }
  | { kind: "ok"; filePath: string }
  | { kind: "needs-edit"; filePath: string; required: string[] };

const EXPO_TEMPLATE = `const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./global.css" });
`;

/**
 * Ensure metro.config.js wraps the default config with `withNativeWind`.
 *
 * Strategy:
 *  - File missing & Expo project        → write Expo template
 *  - File missing & bare RN             → report; do not guess
 *  - File exists wrapped with withNW    → no-op
 *  - File exists missing the wrapper    → list what to add; do not mutate
 *    (metro configs frequently include custom transformers, watchFolders,
 *    resolver settings — auto-mutation is too risky)
 */
export async function ensureMetroConfig(
  cwd: string,
  isExpo: boolean
): Promise<MetroResult> {
  const candidates = ["metro.config.js", "metro.config.cjs"];
  let existingPath: string | null = null;
  for (const name of candidates) {
    try {
      await fs.access(path.join(cwd, name));
      existingPath = path.join(cwd, name);
      break;
    } catch {
      // continue
    }
  }

  if (!existingPath) {
    if (!isExpo) {
      return {
        kind: "needs-edit",
        filePath: path.join(cwd, "metro.config.js"),
        required: [
          "Create metro.config.js that wraps the default config with `withNativeWind(..., { input: \"./global.css\" })`.",
        ],
      };
    }
    const filePath = path.join(cwd, "metro.config.js");
    await fs.writeFile(filePath, EXPO_TEMPLATE, "utf8");
    return { kind: "created", filePath };
  }

  const source = await fs.readFile(existingPath, "utf8");
  const required: string[] = [];
  if (!source.includes("withNativeWind")) {
    required.push("Import `withNativeWind` from `nativewind/metro`.");
    required.push(
      'Export `withNativeWind(config, { input: "./global.css" })` instead of the raw config.'
    );
  }
  if (required.length === 0) {
    return { kind: "ok", filePath: existingPath };
  }
  return { kind: "needs-edit", filePath: existingPath, required };
}
