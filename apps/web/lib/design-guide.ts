/**
 * The appCN design guide, as plain serializable data — served inside
 * `/r/catalog.json` and surfaced to AI agents by `@app-cn/mcp`'s
 * `get_design_guide` tool so generated code matches appCN's taste.
 *
 * Hand-mirrored from `packages/ui/src/lib/motion.ts`, `lib/haptics.ts`, and
 * DESIGN.md. It is intentionally NOT imported from `@app-cn/ui`: those modules
 * pull in `react-native-reanimated`, and the web app stays React-Native-free
 * (previews are iframed from the showcase). Keep these values in sync if the
 * tokens change — the validator can't catch drift here.
 */

export interface DesignGuide {
  philosophy: string[];
  motion: {
    durations: Record<string, number>;
    easings: string[];
    springs: string[];
    pressScale: number;
    rules: string[];
  };
  haptics: string;
  variants: string[];
  accessibility: string[];
  doNot: string[];
}

export const designGuide: DesignGuide = {
  philosophy: [
    "One delight detail per component — mandatory. Every component ships one non-obvious, unrequested touch (a squash on travel, a haptic at a threshold, a shimmer that matches content shape). If you can't name it, it isn't done.",
    "Restraint is the default; delight is the spike. Linear/Vercel calm 95% of the time; the 5% is where motion earns attention. Never animate everything at once.",
    "Dark-mode first. Design the dark variant, then derive light. Premium reads as depth, low-chroma surfaces, soft shadows, and one confident accent — not rainbows.",
    "Motion is feedback, not decoration. Every animation answers 'what just happened?' or 'what can I do?'. Idle motion needs a reason.",
    "Copy-paste is sacred. A component must run when pasted into a stranger's app — no appCN-internal imports beyond declared registry dependencies, no surprise deps.",
  ],
  motion: {
    // ms — use the smallest that still reads. From lib/motion.ts `duration`.
    durations: {
      instant: 100,
      fast: 160,
      base: 220,
      slow: 320,
      deliberate: 480,
    },
    // From lib/motion.ts `easing`. Use withTiming for opacity/color.
    easings: [
      "standard — Easing.inOut(cubic): things that move A→B.",
      "enter — Easing.out(cubic): decelerate something in.",
      "exit — Easing.in(cubic): accelerate something out.",
      "emphasized — Easing.bezier(0.2, 0, 0, 1): the one expensive moment per screen.",
      "linear — Easing.linear: continuous spinners only.",
    ],
    // From lib/motion.ts `spring`. Use withSpring for physical motion.
    springs: [
      "press — { mass: 0.5, damping: 18, stiffness: 320 }: crisp, no overshoot. Pressables.",
      "bouncy — { mass: 0.8, damping: 13, stiffness: 220 }: slight overshoot. Toggles, traveling indicators, things that pop.",
      "gentle — { mass: 1, damping: 22, stiffness: 180 }: smooth, settled. Sheets, layout, large surfaces.",
    ],
    pressScale: 0.96,
    rules: [
      "Physical motion (drag, thumbs, indicators) → withSpring. Opacity/color → withTiming.",
      "Press feedback uses PRESS_SCALE (0.96).",
      "Always honor useReducedMotion() — fall back to a crossfade or the settled end state, never a hard cut.",
      "Never hand-type durations or easings — import from `../lib/motion` (registry: @app-cn/motion).",
      "Use react-native-reanimated, never the Animated API. Gestures via react-native-gesture-handler.",
    ],
  },
  haptics:
    "Fire-and-forget via `../lib/haptics` (registry: @app-cn/haptics); no-ops on web, never throws. Pair a haptic with physical motion: haptic.selection() for detents/toggles, haptic.medium() for confirmed actions (send, toggle on), haptic.success() for completion. Also: light (selection moving), heavy (consequential), warning, error.",
  variants: [
    "Use cva with `variant` + `size` and explicit defaultVariants. Name the block `xVariants`.",
    "Always expose `className` (and `textClassName` where the component owns text) as escape hatches.",
    "Put delight in compound variants where it belongs (e.g. ghost + pressed → subtle tint).",
    "Support controlled and uncontrolled (`value` / `defaultValue` / `onValueChange`).",
    "Forward `ref` to the host view when a ref makes sense.",
  ],
  accessibility: [
    "accessibilityRole on every interactive component.",
    "An accessibilityLabel.",
    "accessibilityState for disabled / expanded / checked.",
    "hitSlop and a ≥44pt touch target.",
    "Visible press/focus feedback. Non-negotiable.",
  ],
  doNot: [
    "Default Tailwind palette or inline hex — tokens only (bg-primary, text-muted-foreground).",
    "Boring instant state flips, generic opacity hovers, fade-only everything.",
    "The Animated API or StyleSheet when NativeWind can express it.",
    "Emoji / text glyphs as shipped icons — draw glyphs from Views/borders.",
    "Dependencies a copy-paste consumer won't have, unless declared in the registry.",
    "Light-mode-first. Layout shift on mount. Spinners where a skeleton or stream fits.",
    "Over-abstraction — three similar lines beat a premature hook.",
  ],
};
