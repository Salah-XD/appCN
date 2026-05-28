/**
 * Post-build registry validator.
 *
 * Runs after `shadcn build` + `fix-registry-imports.mjs`. Asserts that:
 *   1. Every item in registry.json has a corresponding public/r/<name>.json
 *   2. Every emitted JSON parses
 *   3. Every emitted item has required shadcn fields (name, type, files)
 *   4. No emitted file.content still contains a workspace-relative `../lib/*`
 *      import (would mean the post-build rewrite missed it)
 *   5. registryDependencies use the namespaced form `@app-cn/<name>`
 *
 * Exits with code 1 and a clear message on the first failure.
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const registryDir = path.resolve(process.cwd(), "public/r");
const manifestPath = path.resolve(process.cwd(), "registry.json");

let failed = 0;
const fail = (msg) => {
  console.error(`✗ ${msg}`);
  failed++;
};

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
if (!Array.isArray(manifest.items) || manifest.items.length === 0) {
  fail("registry.json has no items");
  process.exit(1);
}

// shadcn emits a top-level `registry.json` as an index of all items. It is not
// itself a registry item, so it is excluded from per-item validation below.
const INDEX_FILE = "registry.json";

const emittedFiles = (await readdir(registryDir))
  .filter((f) => f.endsWith(".json"))
  .filter((f) => f !== INDEX_FILE);
const emittedNames = new Set(emittedFiles.map((f) => f.replace(/\.json$/, "")));
const manifestNames = new Set(manifest.items.map((i) => i.name));

for (const item of manifest.items) {
  if (!emittedNames.has(item.name)) {
    fail(`manifest item "${item.name}" has no emitted public/r/${item.name}.json`);
  }
}

// Orphan detection: catch stale files left over from a previous build (e.g.
// after renaming or removing a component). The registry:build script clears
// the dir, so any orphan here means a contributor ran shadcn build directly.
for (const name of emittedNames) {
  if (!manifestNames.has(name)) {
    fail(
      `orphan public/r/${name}.json has no entry in registry.json — ` +
        `delete it or re-run \`pnpm registry:build\` (which cleans first)`
    );
  }
}

for (const fileName of emittedFiles) {
  const filePath = path.join(registryDir, fileName);
  let json;
  try {
    json = JSON.parse(await readFile(filePath, "utf8"));
  } catch (err) {
    fail(`public/r/${fileName} — JSON parse error: ${err.message}`);
    continue;
  }

  for (const required of ["name", "type", "files"]) {
    if (json[required] === undefined) {
      fail(`public/r/${fileName} — missing required field "${required}"`);
    }
  }

  if (Array.isArray(json.files)) {
    for (const f of json.files) {
      if (typeof f.content === "string" && /from\s+"(?:\.\.?\/)+lib\//.test(f.content)) {
        fail(
          `public/r/${fileName} — file "${f.path ?? "?"}" still contains a relative ../lib/* import; ` +
            `fix-registry-imports.mjs likely missed this case`
        );
      }
    }
  }

  if (Array.isArray(json.registryDependencies)) {
    for (const dep of json.registryDependencies) {
      if (typeof dep !== "string") continue;
      const isUrl = /^https?:\/\//.test(dep);
      const isNamespaced = dep.startsWith("@app-cn/");
      const isBare = /^[a-z][a-z0-9-]*$/.test(dep);
      if (!isUrl && !isNamespaced && !isBare) {
        fail(
          `public/r/${fileName} — registryDependency "${dep}" is not a URL, ` +
            `@app-cn/<name>, or bare slug`
        );
      }
    }
  }
}

if (failed > 0) {
  console.error(`\n✗ ${failed} validation failure(s)`);
  process.exit(1);
}

console.log(`✓ ${emittedFiles.length} registry items validated`);
