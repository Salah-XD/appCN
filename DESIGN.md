# appCN design system

The architecture lives in [`CLAUDE.md`](./CLAUDE.md). This file is the **taste layer** —
the rules that make appCN feel like appCN. Read it before authoring a component.

---

## Philosophy

1. **One delight detail per component — mandatory.** Every component ships one
   non-obvious, unrequested touch: a squash on travel, a haptic at a threshold, a
   shimmer that matches content shape, an element that gets out of its own way. If
   you can't name the delight detail in the component's doc comment, it isn't done.
2. **Restraint is the default; delight is the spike.** Linear/Vercel calm 95% of the
   time. The 5% is where motion earns attention. Never animate everything at once.
3. **Dark-mode first.** Design the dark variant, then derive light. Premium reads as
   depth, low-chroma surfaces, soft shadows, and one confident accent — not rainbows.
4. **Motion is feedback, not decoration.** Every animation answers "what just
   happened?" or "what can I do?". Idle motion needs a reason (a waveform that
   breathes signals *live*; a button that wiggles for no reason does not).
5. **Copy-paste is sacred.** A component must run when pasted into a stranger's app.
   No appCN-internal imports beyond declared registry dependencies. No surprise deps.

## Motion (use the tokens, never magic numbers)

Import from `../lib/motion` (registry: `@appcn/motion`). See `packages/ui/src/lib/motion.ts`.

```ts
import { duration, easing, spring, PRESS_SCALE } from "../lib/motion";
```

- **Durations (ms):** `instant 100` · `fast 160` · `base 220` · `slow 320` · `deliberate 480`.
  Use the smallest that still reads.
- **Easings:** `standard` (A→B moves) · `enter` (decelerate in) · `exit` (accelerate out) ·
  `emphasized` (the one expensive moment) · `linear` (continuous spinners).
- **Springs:** `press` (crisp, no overshoot) · `bouncy` (toggles/indicators that pop) ·
  `gentle` (sheets, layout, large surfaces).
- **Rules:** physical motion (drag, thumbs, indicators) → `withSpring`; opacity/color →
  `withTiming`. Press feedback uses `PRESS_SCALE` (0.96). **Always honor
  `useReducedMotion()`** — fall back to a crossfade or the settled end state, never a hard cut.

## Haptics

Import from `../lib/haptics` (registry: `@appcn/haptics`). Fire-and-forget, no-ops on web.
Pair a haptic with physical motion so interactions feel grounded: `haptic.selection()` for
detents/toggles, `haptic.medium()` for confirmed actions, `haptic.success()` for completion.

## Variant API

- `cva` with `variant` + `size`, explicit `defaultVariants`. Block named `xVariants`.
- Always expose `className` (and `textClassName` where the component owns text) as escape hatches.
- Put delight in **compound variants** where it belongs (e.g. `ghost` + pressed → subtle tint).
- Support **controlled and uncontrolled** (`value` / `defaultValue` / `onValueChange`).
- Forward `ref` to the host view when a ref makes sense.

## File structure per component

One self-contained `.tsx` in `components/` (base) or `ai/` (AI collection):

```
header doc comment   ← what it is + the delight detail, in one breath
imports              ← react, react-native, reanimated, then ../lib/* helpers
cva blocks           ← xVariants / xTextVariants
Props interface      ← exported, named XProps
component            ← exported, named X
local sub-components ← Dot, Caret, icons… below the main component
named exports        ← incl. variants
```

`slug == registry name == file name` (kebab-case). PascalCase exports.

## Icons

No icon library is assumed (it would be a surprise dep). Draw the few small glyphs you need
from `View`s/borders (see `prompt-input.tsx`: chevron, square, plus, close). If a component
genuinely needs a rich icon set, declare it as a registry dependency — don't reach for emoji
or text glyphs in shipped code.

## Accessibility (required on every interactive component)

`accessibilityRole`, an `accessibilityLabel`, `accessibilityState` (disabled/expanded/checked),
`hitSlop`, a ≥44pt touch target, and visible press/focus feedback. Non-negotiable.

## What NOT to do

- ❌ Default Tailwind palette or inline hex — **tokens only** (`bg-primary`, `text-muted-foreground`).
- ❌ Boring instant state flips, generic `opacity` hovers, fade-only everything.
- ❌ The `Animated` API or `StyleSheet` when NativeWind can express it.
- ❌ Emoji / text glyphs as shipped icons.
- ❌ Dependencies a copy-paste consumer won't have, unless declared in the registry.
- ❌ Light-mode-first. ❌ Layout shift on mount. ❌ Spinners where a skeleton or stream fits.
- ❌ Over-abstraction — three similar lines beat a premature hook.
