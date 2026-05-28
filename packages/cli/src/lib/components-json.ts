import { promises as fs } from "node:fs";
import path from "node:path";
import {
  applyEdits,
  modify,
  parse,
  type ParseError,
} from "jsonc-parser";

import { REGISTRY_BASE_URL } from "./registry";

export const APPCN_REGISTRY_KEY = "@app-cn";
export const APPCN_REGISTRY_VALUE = `${REGISTRY_BASE_URL}/{name}.json`;

export type EnsureResult = "already-set" | "patched" | "needs-prompt";
export type CreateOrEnsureResult = "created" | "already-set" | "patched";

const DEFAULT_TEMPLATE = {
  $schema: "https://ui.shadcn.com/schema.json",
  style: "default",
  tailwind: {
    config: "tailwind.config.js",
    css: "global.css",
    baseColor: "neutral",
    cssVariables: true,
  },
  aliases: {
    components: "@/components",
    utils: "@/lib/utils",
    ui: "@/components/ui",
    lib: "@/lib",
    hooks: "@/hooks",
  },
  registries: {
    [APPCN_REGISTRY_KEY]: APPCN_REGISTRY_VALUE,
  },
};

interface ComponentsJsonShape {
  registries?: Record<string, string>;
  [key: string]: unknown;
}

async function readJsonc(filePath: string): Promise<{ text: string; data: ComponentsJsonShape }> {
  const text = await fs.readFile(filePath, "utf8");
  const errors: ParseError[] = [];
  const data = parse(text, errors, { allowTrailingComma: true }) as ComponentsJsonShape | undefined;
  if (errors.length > 0) {
    throw new Error(`Could not parse ${filePath} (offset ${errors[0]!.offset})`);
  }
  return { text, data: data ?? {} };
}

/**
 * Ensure `registries["@app-cn"]` is set to the registry URL in the given
 * `components.json`. Returns:
 * - `already-set` if no change was needed
 * - `patched` if the file was modified
 * - `needs-prompt` if the entry is missing and `apply` is false
 */
export async function ensureRegistryEntry(
  filePath: string,
  apply: boolean
): Promise<EnsureResult> {
  const { text, data } = await readJsonc(filePath);
  const registries = data.registries ?? {};
  if (registries[APPCN_REGISTRY_KEY] === APPCN_REGISTRY_VALUE) {
    return "already-set";
  }
  if (!apply) return "needs-prompt";

  const edits = modify(
    text,
    ["registries", APPCN_REGISTRY_KEY],
    APPCN_REGISTRY_VALUE,
    { formattingOptions: { tabSize: 2, insertSpaces: true } }
  );
  const updated = applyEdits(text, edits);
  await fs.writeFile(filePath, updated, "utf8");
  return "patched";
}

/**
 * Create components.json from a sensible default template, or, if the file
 * already exists, patch it via `ensureRegistryEntry`.
 *
 * Intended for `appcn init` — `add` does NOT auto-create because the user
 * may want to scaffold first.
 */
export async function createOrEnsureComponentsJson(
  cwd: string
): Promise<CreateOrEnsureResult> {
  const filePath = path.join(cwd, "components.json");
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(
      filePath,
      JSON.stringify(DEFAULT_TEMPLATE, null, 2) + "\n",
      "utf8"
    );
    return "created";
  }
  const result = await ensureRegistryEntry(filePath, true);
  return result === "already-set" ? "already-set" : "patched";
}
