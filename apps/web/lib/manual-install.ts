import { promises as fs } from "node:fs";
import path from "node:path";

import type { PackageManagerCommands } from "@/lib/registry";

/**
 * Shape of an emitted shadcn registry item (apps/web/public/r/<name>.json).
 * Only the fields the manual-install renderer cares about.
 */
interface RegistryItemJson {
  name: string;
  type: string;
  title?: string;
  dependencies?: string[];
  registryDependencies?: string[];
  files?: { path?: string; target?: string; content?: string }[];
}

export type ManualDependency = {
  name: string;
  commands: PackageManagerCommands;
};

export type ManualFile = {
  /** Where the consumer should put the file (e.g. `lib/cn.ts`). */
  targetPath: string;
  /** File source. Already rewritten with `@/lib/...` imports. */
  code: string;
};

export type ManualInstall = {
  dependencies: ManualDependency[];
  registryDependencies: ManualFile[];
  source: ManualFile;
};

const PUBLIC_R = path.resolve(process.cwd(), "public", "r");

function pmCommandsFor(pkg: string): PackageManagerCommands {
  return {
    npm: `npm install ${pkg}`,
    pnpm: `pnpm add ${pkg}`,
    yarn: `yarn add ${pkg}`,
    bun: `bun add ${pkg}`,
  };
}

async function readItem(name: string): Promise<RegistryItemJson> {
  const filePath = path.join(PUBLIC_R, `${name}.json`);
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw) as RegistryItemJson;
}

function stripNamespace(dep: string): string {
  // Registry deps look like `@app-cn/cn` — strip the scope to get the slug.
  const match = dep.match(/^@[^/]+\/(.+)$/);
  return match ? match[1]! : dep;
}

function fileFromItem(item: RegistryItemJson): ManualFile | null {
  const first = item.files?.[0];
  if (!first?.content) return null;
  return {
    targetPath: first.target ?? first.path ?? `${item.name}.ts`,
    code: first.content,
  };
}

/**
 * Build a Manual install payload for a component slug. Reads the already-built
 * registry JSON under apps/web/public/r/ — must be run after `pnpm registry:build`
 * (the prebuild step takes care of this in Next builds).
 */
export async function buildManualInstall(slug: string): Promise<ManualInstall | null> {
  let main: RegistryItemJson;
  try {
    main = await readItem(slug);
  } catch {
    return null;
  }

  const source = fileFromItem(main);
  if (!source) return null;

  const dependencies: ManualDependency[] = (main.dependencies ?? []).map(
    (name) => ({ name, commands: pmCommandsFor(name) })
  );

  const registryDependencies: ManualFile[] = [];
  for (const dep of main.registryDependencies ?? []) {
    if (/^https?:\/\//.test(dep)) continue; // skip URL refs; user can pull manually
    const name = stripNamespace(dep);
    try {
      const item = await readItem(name);
      const file = fileFromItem(item);
      if (file) registryDependencies.push(file);
    } catch {
      // Missing registry dep — skip rather than fail; render still shows
      // the main source + npm deps, which is most of the value.
    }
  }

  return { dependencies, registryDependencies, source };
}
