import { promises as fs } from "node:fs";
import path from "node:path";

export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

const LOCKFILES: Array<[string, PackageManager]> = [
  ["pnpm-lock.yaml", "pnpm"],
  ["bun.lock", "bun"],
  ["bun.lockb", "bun"],
  ["yarn.lock", "yarn"],
  ["package-lock.json", "npm"],
];

/**
 * Walk up the filesystem from `cwd` looking for the closest lockfile.
 * Falls back to npm if nothing is found.
 */
export async function detectPackageManager(cwd: string): Promise<PackageManager> {
  let dir = cwd;
  while (true) {
    for (const [name, pm] of LOCKFILES) {
      try {
        await fs.access(path.join(dir, name));
        return pm;
      } catch {
        // try the next one
      }
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return "npm";
}

/** Returns the dlx-equivalent invocation split into `[cmd, ...args]`. */
export function dlxCommand(pm: PackageManager, pkg: string): string[] {
  switch (pm) {
    case "pnpm":
      return ["pnpm", "dlx", pkg];
    case "yarn":
      return ["yarn", "dlx", pkg];
    case "bun":
      return ["bunx", "--bun", pkg];
    case "npm":
    default:
      return ["npx", pkg];
  }
}

/** Returns the install invocation split into `[cmd, ...args]`. */
export function installCommand(
  pm: PackageManager,
  pkgs: string[],
  opts: { dev?: boolean } = {}
): string[] {
  const dev = opts.dev ?? false;
  switch (pm) {
    case "pnpm":
      return ["pnpm", "add", ...(dev ? ["-D"] : []), ...pkgs];
    case "yarn":
      return ["yarn", "add", ...(dev ? ["-D"] : []), ...pkgs];
    case "bun":
      return ["bun", "add", ...(dev ? ["-d"] : []), ...pkgs];
    case "npm":
    default:
      return ["npm", "install", ...(dev ? ["--save-dev"] : []), ...pkgs];
  }
}
