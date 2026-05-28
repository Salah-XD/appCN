import { promises as fs } from "node:fs";
import path from "node:path";

export type TailwindResult =
  | { kind: "created"; filePath: string }
  | { kind: "ok"; filePath: string }
  | { kind: "needs-edit"; filePath: string; required: string[] };

const TEMPLATE = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  presets: [require("@app-cn/ui/tailwind-preset")],
};
`;

/**
 * Ensure tailwind.config.js exists and references @app-cn/ui/tailwind-preset.
 *
 * Strategy:
 *  - File missing                          → write template
 *  - File exists, contains the preset path → no-op
 *  - File exists, missing the preset path  → report what to add; do not mutate
 *
 * The detect-or-abort path is intentional: tailwind configs vary widely
 * (CommonJS vs ESM, function form, factored helpers) and any auto-patch
 * here would risk corrupting user code.
 */
export async function ensureTailwindConfig(cwd: string): Promise<TailwindResult> {
  const candidates = ["tailwind.config.js", "tailwind.config.ts", "tailwind.config.mjs"];
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
    const filePath = path.join(cwd, "tailwind.config.js");
    await fs.writeFile(filePath, TEMPLATE, "utf8");
    return { kind: "created", filePath };
  }

  const source = await fs.readFile(existingPath, "utf8");
  const required: string[] = [];
  if (!source.includes("@app-cn/ui/tailwind-preset")) {
    required.push(`presets: add \`require("@app-cn/ui/tailwind-preset")\``);
  }
  // Content glob: we tolerate any expansion as long as something references
  // app / components / lib globs. If absent, prompt the user to add.
  if (!/content\s*:/.test(source)) {
    required.push(`content: array of glob patterns covering your app source`);
  }

  if (required.length === 0) {
    return { kind: "ok", filePath: existingPath };
  }
  return { kind: "needs-edit", filePath: existingPath, required };
}
