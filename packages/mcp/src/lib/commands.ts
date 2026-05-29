/**
 * Install-command builder. Mirrors the command shapes the docs site renders
 * (`apps/web/lib/registry.ts`) and what `@app-cn/cli add` runs under the hood,
 * so the MCP never disagrees with the website.
 */

export const PACKAGE_MANAGERS = ["npm", "pnpm", "yarn", "bun"] as const;
export type PackageManager = (typeof PACKAGE_MANAGERS)[number];

/** The `dlx`-style runner prefix for each package manager. */
const DLX: Record<PackageManager, string> = {
  npm: "npx",
  pnpm: "pnpm dlx",
  yarn: "yarn dlx",
  bun: "bunx --bun",
};

export interface InstallCommands {
  /** appCN CLI — RN-aware setup + shadcn add. The recommended path. */
  cli: string;
  /** shadcn, namespaced. Requires `"@app-cn"` registered in components.json. */
  "shadcn-namespaced": string;
  /** shadcn, by full URL. Works with zero project setup. */
  "shadcn-url": string;
}

/** Build the three install commands for a component, for a given package manager. */
export function buildInstallCommands(opts: {
  slug: string;
  registryItem: string;
  registryBaseUrl: string;
  manager: PackageManager;
}): InstallCommands {
  const { slug, registryItem, registryBaseUrl, manager } = opts;
  const dlx = DLX[manager];
  const base = registryBaseUrl.replace(/\/+$/, "");
  return {
    cli: `${dlx} @app-cn/cli@latest add ${slug}`,
    "shadcn-namespaced": `${dlx} shadcn@latest add @app-cn/${registryItem}`,
    "shadcn-url": `${dlx} shadcn@latest add ${base}/${registryItem}.json`,
  };
}

/** Build the install commands across every package manager. */
export function buildAllInstallCommands(opts: {
  slug: string;
  registryItem: string;
  registryBaseUrl: string;
}): Record<PackageManager, InstallCommands> {
  return Object.fromEntries(
    PACKAGE_MANAGERS.map((manager) => [
      manager,
      buildInstallCommands({ ...opts, manager }),
    ]),
  ) as Record<PackageManager, InstallCommands>;
}
