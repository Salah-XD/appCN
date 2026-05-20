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
];

export const componentMap: Record<string, ComponentMeta> = Object.fromEntries(
  components.map((c) => [c.slug, c])
);

export function installCommand(registryItem: string, base: string) {
  return `npx shadcn@latest add ${base}/${registryItem}.json`;
}
