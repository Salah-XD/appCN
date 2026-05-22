export type Category = "base" | "ai";

export type ComponentMeta = {
  slug: string;
  title: string;
  description: string;
  category: Category;
  /** Source file, relative to the web app cwd (read at build time for the Code tab). */
  sourcePath: string;
  /** The registry item name -> served at /r/<registryItem>.json */
  registryItem: string;
};

export const components: ComponentMeta[] = [
  {
    slug: "button",
    title: "Button",
    description:
      "A pressable with variants and a Reanimated press-scale. Accessible by default.",
    category: "base",
    sourcePath: "../../packages/ui/src/components/button.tsx",
    registryItem: "button",
  },
  {
    slug: "stream-bubble",
    title: "Stream Bubble",
    description:
      "The AI-native flagship. An assistant message that animates through thinking, token streaming, tool chips, and a settled final state.",
    category: "ai",
    sourcePath: "../../packages/ui/src/ai/stream-bubble.tsx",
    registryItem: "stream-bubble",
  },
  {
    slug: "prompt-input",
    title: "Prompt Input",
    description:
      "The AI composer. Auto-grows with content and morphs its send button into a stop control wrapped in a spinning ring the moment generation starts.",
    category: "ai",
    sourcePath: "../../packages/ui/src/ai/prompt-input.tsx",
    registryItem: "prompt-input",
  },
  {
    slug: "reasoning-trace",
    title: "Reasoning Trace",
    description:
      "A collapsible chain-of-thought panel. A shimmer sweeps the reasoning while thinking, then the panel collapses itself the instant the answer lands.",
    category: "ai",
    sourcePath: "../../packages/ui/src/ai/reasoning-trace.tsx",
    registryItem: "reasoning-trace",
  },
  {
    slug: "voice-waveform",
    title: "Voice Waveform",
    description:
      "A live mic visualizer. It breathes with a slow envelope when idle and shifts hue to the accent the instant it goes active.",
    category: "ai",
    sourcePath: "../../packages/ui/src/ai/voice-waveform.tsx",
    registryItem: "voice-waveform",
  },
];

export const componentMap: Record<string, ComponentMeta> = Object.fromEntries(
  components.map((c) => [c.slug, c])
);

export function installCommand(registryItem: string, base: string) {
  return `npx shadcn@latest add ${base}/${registryItem}.json`;
}
