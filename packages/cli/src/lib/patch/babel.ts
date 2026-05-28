import { promises as fs } from "node:fs";
import path from "node:path";

export type BabelResult =
  | { kind: "created"; filePath: string; plugin: string }
  | { kind: "ok"; filePath: string }
  | { kind: "needs-edit"; filePath: string; required: string[]; plugin: string };

const EXPO_TEMPLATE = (plugin: string) => `module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    // ${plugin} MUST be the LAST plugin (Reanimated requirement).
    plugins: ["${plugin}"],
  };
};
`;

/**
 * Ensure babel.config.js wires up NativeWind and the Reanimated plugin.
 *
 * Reanimated 4 requires `react-native-worklets/plugin` (last). Reanimated 3
 * requires `react-native-reanimated/plugin` (last). The init command resolves
 * which one based on the project's declared reanimated major.
 *
 * Strategy:
 *  - File missing & Expo project        → write Expo template
 *  - File missing & bare RN             → report missing; do not guess
 *  - File exists with both markers      → no-op
 *  - File exists missing markers        → list what to add; do not mutate
 *    (babel configs are too variable to AST-patch safely)
 */
export async function ensureBabelConfig(
  cwd: string,
  reanimatedMajor: 3 | 4,
  isExpo: boolean
): Promise<BabelResult> {
  const plugin =
    reanimatedMajor === 4
      ? "react-native-worklets/plugin"
      : "react-native-reanimated/plugin";

  const candidates = ["babel.config.js", "babel.config.cjs", "babel.config.ts"];
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
        filePath: path.join(cwd, "babel.config.js"),
        required: [
          `Create babel.config.js with the nativewind/babel preset and ${plugin} as the last plugin.`,
        ],
        plugin,
      };
    }
    const filePath = path.join(cwd, "babel.config.js");
    await fs.writeFile(filePath, EXPO_TEMPLATE(plugin), "utf8");
    return { kind: "created", filePath, plugin };
  }

  const source = await fs.readFile(existingPath, "utf8");
  const required: string[] = [];

  if (!source.includes("nativewind/babel")) {
    required.push(`presets: add \`"nativewind/babel"\``);
  }
  if (!source.includes(plugin)) {
    required.push(`plugins: add \`"${plugin}"\` as the LAST entry`);
  }
  // Catch the wrong-major case: v4 project with v3 plugin or vice versa.
  const otherPlugin =
    reanimatedMajor === 4
      ? "react-native-reanimated/plugin"
      : "react-native-worklets/plugin";
  if (source.includes(otherPlugin) && !source.includes(plugin)) {
    required.push(
      `plugins: replace \`"${otherPlugin}"\` with \`"${plugin}"\` (detected reanimated v${reanimatedMajor})`
    );
  }

  if (required.length === 0) {
    return { kind: "ok", filePath: existingPath };
  }
  return { kind: "needs-edit", filePath: existingPath, required, plugin };
}
