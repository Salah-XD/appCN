import { Easing } from "react-native-reanimated";

/**
 * appCN motion tokens — the shared vocabulary that makes every component feel
 * like one system. Reach for these instead of hand-typing durations/easings.
 *
 * Declared as a registry dependency (`@appcn/motion`) so copy-paste consumers
 * inherit the same feel.
 */

/** Duration scale in ms. Use the smallest one that still reads. */
export const duration = {
  /** Press feedback, taps — should feel instantaneous. */
  instant: 100,
  /** Small state changes (icon swaps, opacity). */
  fast: 160,
  /** The default for most transitions. */
  base: 220,
  /** Layout / size changes, expanding panels. */
  slow: 320,
  /** Deliberate, attention-drawing moments. Use sparingly. */
  deliberate: 480,
} as const;

/**
 * Easing curves. `standard` for things that move from A to B, `enter` to
 * decelerate something in, `exit` to accelerate something out, `emphasized`
 * for the one moment per screen you want to feel expensive.
 */
export const easing = {
  standard: Easing.inOut(Easing.cubic),
  enter: Easing.out(Easing.cubic),
  exit: Easing.in(Easing.cubic),
  emphasized: Easing.bezier(0.2, 0, 0, 1),
  linear: Easing.linear,
} as const;

/**
 * Spring presets for physical motion (drag, thumbs, indicators). Prefer these
 * over `withTiming` whenever something should feel like it has weight.
 * - `press`  crisp, no overshoot — pressables.
 * - `bouncy` slight overshoot — toggles, traveling indicators, things that pop.
 * - `gentle` smooth, settled — sheets, layout, large surfaces.
 */
export const spring = {
  press: { mass: 0.5, damping: 18, stiffness: 320 },
  bouncy: { mass: 0.8, damping: 13, stiffness: 220 },
  gentle: { mass: 1, damping: 22, stiffness: 180 },
} as const;

/** Standard press-scale target shared by every pressable. */
export const PRESS_SCALE = 0.96;
