import {
  buttonMeta,
  promptInputMeta,
  reasoningTraceMeta,
  streamBubbleMeta,
  voiceSphereMeta,
  type ComponentMeta,
} from "@appcn/ui/lib/meta";

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

/** The shadcn-by-URL form. Works without consumer setup. */
export function installCommand(registryItem: string, base: string) {
  return `npx shadcn@latest add ${base}/${registryItem}.json`;
}

/** The namespaced shadcn form — requires the consumer to add `"@appcn"` to their components.json. */
export function namespacedInstallCommand(registryItem: string) {
  return `npx shadcn@latest add @appcn/${registryItem}`;
}

/** The npm form — installs the whole library. Available once `@appcn/ui` ships to npm (Phase 6). */
export function npmInstallCommand() {
  return `npm install @appcn/ui`;
}

/** Re-export for places that previously imported the type from this module. */
export type { ComponentMeta };
