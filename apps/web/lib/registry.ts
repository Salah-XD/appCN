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
      "The AI-native flagship. An assistant message that animates through thinking, token streaming, and a settled final state.",
    category: "ai",
    sourcePath: "../../packages/ui/src/ai/stream-bubble.tsx",
    registryItem: "stream-bubble",
  },
  {
    slug: "voice-waveform",
    title: "Voice Waveform",
    description:
      "An animated listening visualization for voice and AI assistant UI — staggered, slightly randomized bars.",
    category: "ai",
    sourcePath: "../../packages/ui/src/ai/voice-waveform.tsx",
    registryItem: "voice-waveform",
  },
  {
    slug: "prompt-input",
    title: "Prompt Input",
    description:
      "An AI chat composer with an animated action button — muted when empty, primary to send, stop while streaming.",
    category: "ai",
    sourcePath: "../../packages/ui/src/ai/prompt-input.tsx",
    registryItem: "prompt-input",
  },
];

export const componentMap: Record<string, ComponentMeta> = Object.fromEntries(
  components.map((c) => [c.slug, c])
);

export function installCommand(registryItem: string, base: string) {
  return `npx shadcn@latest add ${base}/${registryItem}.json`;
}
