/**
 * Post-process `shadcn build` output.
 *
 * In-repo, components import shared helpers with workspace-relative paths
 * (e.g. `../lib/cn`) so the monorepo type-checks and bundles. But when a
 * consumer installs a component via the shadcn CLI, files are placed under
 * their own aliases — a relative `../lib/cn` would resolve to the wrong folder.
 *
 * shadcn only rewrites alias-style (`@/…`) imports, so here we convert the
 * relative util imports in the emitted registry JSON to the `@/` alias form.
 * shadcn (and the consumer's tsconfig `@/*` mapping) then resolve them to the
 * installed util location.
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const registryDir = path.resolve(process.cwd(), "public/r");

// Rewrite any workspace-relative lib import (e.g. `../lib/cn`, `../lib/motion`)
// to the consumer alias form (`@/lib/cn`). One rule covers every shared helper,
// so new helpers don't need a new rule here.
const replacements = [
  [/from "(?:\.\.?\/)+lib\/([\w-]+)"/g, 'from "@/lib/$1"'],
];

const files = (await readdir(registryDir)).filter((f) => f.endsWith(".json"));

for (const fileName of files) {
  const filePath = path.join(registryDir, fileName);
  const json = JSON.parse(await readFile(filePath, "utf8"));
  if (!Array.isArray(json.files)) continue;

  let changed = false;
  for (const file of json.files) {
    if (typeof file.content !== "string") continue;
    let content = file.content;
    for (const [pattern, to] of replacements) content = content.replace(pattern, to);
    if (content !== file.content) {
      file.content = content;
      changed = true;
    }
  }

  if (changed) {
    await writeFile(filePath, JSON.stringify(json, null, 2) + "\n");
    console.log(`fixed imports in ${fileName}`);
  }
}
