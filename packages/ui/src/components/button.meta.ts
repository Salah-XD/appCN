import type { ComponentMeta } from "../lib/meta";

export const meta: ComponentMeta = {
  slug: "button",
  title: "Button",
  category: "base",
  description:
    "Pressable with variants and a Reanimated press-scale. Accessible by default.",
  anatomy:
    "A Reanimated wrapper around a React Native Pressable. The variant + size cva blocks own the visual surface; an animated transform on the wrapper drives the press-scale. Reach for it any time you'd reach for a native <Pressable>, and let the variants do the styling work.",
  delight:
    "Press-in snaps the button to 0.96 with a fast 100ms ease; release settles back over 140ms — so taps feel weighted, never twitchy, and you never see overshoot.",
  props: [
    {
      name: "variant",
      type: '"default" | "secondary" | "outline" | "ghost" | "destructive"',
      default: '"default"',
      description: "Visual style. Drives bg, border, and text color via cva blocks.",
    },
    {
      name: "size",
      type: '"sm" | "default" | "lg" | "icon"',
      default: '"default"',
      description: "Height + horizontal padding preset. `icon` is square 12×12.",
    },
    {
      name: "children",
      type: "React.ReactNode",
      description:
        "String children are auto-wrapped in a styled <Text>. Pass a composition for icon + label.",
    },
    {
      name: "className",
      type: "string",
      description: "Extra NativeWind classes merged onto the Pressable surface.",
    },
    {
      name: "textClassName",
      type: "string",
      description:
        "Extra NativeWind classes merged onto the auto-text (string children only).",
    },
    {
      name: "disabled",
      type: "boolean",
      default: "false",
      description: "Disables press handling and applies 50% opacity.",
    },
    {
      name: "onPress",
      type: "(e: GestureResponderEvent) => void",
      description: "Forwarded to the underlying Pressable.",
    },
  ],
  examples: [
    {
      title: "Basic",
      description: "String children get auto-styled text.",
      code: `<Button onPress={() => console.log("hi")}>Get started</Button>`,
    },
    {
      title: "Variants",
      description: "All five variants at the default size.",
      code: `<View className="gap-3">
  <Button>Primary</Button>
  <Button variant="secondary">Secondary</Button>
  <Button variant="outline">Outline</Button>
  <Button variant="ghost">Ghost</Button>
  <Button variant="destructive">Delete</Button>
</View>`,
    },
    {
      title: "Icon button",
      description: 'Use size="icon" with a non-string child to render just a glyph.',
      code: `<Button size="icon" variant="outline" accessibilityLabel="Settings">
  <SettingsIcon />
</Button>`,
    },
  ],
  a11y: [
    "Defaults to `accessibilityRole=\"button\"` — no need to set it yourself.",
    "`disabled` is reflected in `accessibilityState`, so VoiceOver announces it correctly.",
    "Icon-only buttons must pass `accessibilityLabel` since there is no visible text.",
    "Minimum touch target is 36pt (size sm) — prefer `default` (48pt) or bigger for primary actions.",
  ],
  addedAt: "2026-05-28",
};
