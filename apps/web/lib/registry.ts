import {
  buttonMeta,
  promptInputMeta,
  reasoningTraceMeta,
  streamBubbleMeta,
  voiceSphereMeta,
  type ComponentMeta,
} from "@app-cn/ui/lib/meta";

export type Category = "base" | "ai";

export type ComponentEntry = {
  slug: string;
  title: string;
  description: string;
  category: Category;
  /** Source file, relative to the web app cwd (read at build time for the Code tab). */
  sourcePath: string;
  /** The registry item name — served at /r/<registryItem>.json. */
  registryItem: string;
  /** Typed docs payload: anatomy / delight / props / examples / a11y. */
  meta: ComponentMeta;
};

/** Single source of truth for all components surfaced on the docs site. */
export const components: ComponentEntry[] = [
  {
    slug: "button",
    title: buttonMeta.title,
    description: buttonMeta.description,
    category: buttonMeta.category,
    sourcePath: "../../packages/ui/src/components/button.tsx",
    registryItem: "button",
    meta: buttonMeta,
  },
  {
    slug: "stream-bubble",
    title: streamBubbleMeta.title,
    description: streamBubbleMeta.description,
    category: streamBubbleMeta.category,
    sourcePath: "../../packages/ui/src/ai/stream-bubble.tsx",
    registryItem: "stream-bubble",
    meta: streamBubbleMeta,
  },
  {
    slug: "prompt-input",
    title: promptInputMeta.title,
    description: promptInputMeta.description,
    category: promptInputMeta.category,
    sourcePath: "../../packages/ui/src/ai/prompt-input.tsx",
    registryItem: "prompt-input",
    meta: promptInputMeta,
  },
  {
    slug: "reasoning-trace",
    title: reasoningTraceMeta.title,
    description: reasoningTraceMeta.description,
    category: reasoningTraceMeta.category,
    sourcePath: "../../packages/ui/src/ai/reasoning-trace.tsx",
    registryItem: "reasoning-trace",
    meta: reasoningTraceMeta,
  },
  {
    slug: "voice-sphere",
    title: voiceSphereMeta.title,
    description: voiceSphereMeta.description,
    category: voiceSphereMeta.category,
    sourcePath: "../../packages/ui/src/ai/voice-sphere.tsx",
    registryItem: "voice-sphere",
    meta: voiceSphereMeta,
  },
];

export const componentMap: Record<string, ComponentEntry> = Object.fromEntries(
  components.map((c) => [c.slug, c])
);

/** Package managers we surface in install tabs. */
export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

export const PACKAGE_MANAGERS: PackageManager[] = ["npm", "pnpm", "yarn", "bun"];

export type PackageManagerCommands = Record<PackageManager, string>;

/**
 * Per-PM commands for a `shadcn@latest add <arg>` invocation.
 * - npm  → `npx shadcn@latest add ...`
 * - pnpm → `pnpm dlx shadcn@latest add ...`
 * - yarn → `yarn dlx shadcn@latest add ...`
 * - bun  → `bunx --bun shadcn@latest add ...`
 */
function shadcnAddCommands(arg: string): PackageManagerCommands {
  return {
    npm: `npx shadcn@latest add ${arg}`,
    pnpm: `pnpm dlx shadcn@latest add ${arg}`,
    yarn: `yarn dlx shadcn@latest add ${arg}`,
    bun: `bunx --bun shadcn@latest add ${arg}`,
  };
}

/** The shadcn-by-URL form. Works without consumer setup. */
export function installCommands(
  registryItem: string,
  base: string
): PackageManagerCommands {
  return shadcnAddCommands(`${base}/${registryItem}.json`);
}

/** The namespaced shadcn form — requires the consumer to add `"@app-cn"` to their components.json. */
export function namespacedInstallCommands(
  registryItem: string
): PackageManagerCommands {
  return shadcnAddCommands(`@app-cn/${registryItem}`);
}

/** The library form — installs `@app-cn/ui` as a managed dep. Available once published (Phase 6). */
export function npmInstallCommands(): PackageManagerCommands {
  const pkg = "@app-cn/ui";
  return {
    npm: `npm install ${pkg}`,
    pnpm: `pnpm add ${pkg}`,
    yarn: `yarn add ${pkg}`,
    bun: `bun add ${pkg}`,
  };
}

/**
 * The appCN CLI form. Wraps the shadcn add pipeline with RN-aware setup
 * (NativeWind/Reanimated config + components.json registry entry).
 */
export function cliAddCommands(slug: string): PackageManagerCommands {
  const pkg = "@app-cn/cli@latest";
  return {
    npm: `npx ${pkg} add ${slug}`,
    pnpm: `pnpm dlx ${pkg} add ${slug}`,
    yarn: `yarn dlx ${pkg} add ${slug}`,
    bun: `bunx --bun ${pkg} add ${slug}`,
  };
}

/** Re-export for places that previously imported the type from this module. */
export type { ComponentMeta };
