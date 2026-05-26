---
name: new-component
description: Author a new appCN component end-to-end. Walks the seven-step SOP from DESIGN.md — component source, typed meta, exports, showcase demo, web registry entry, shadcn manifest entry, verification. Invoke when the user asks to add, create, or scaffold a new appCN component.
---

# /new-component

You are about to add a new component to **appCN** — a shadcn-philosophy
component library for React Native + Expo. **Read this entire skill before
asking the user any questions.**

## Read these first (if you haven't this session)

1. `CLAUDE.md` — architecture, monorepo map.
2. `DESIGN.md` — taste layer + the SOP this skill operationalizes.
3. `AGENTS.md` — agent-specific rules.

## Step 0 — Gather the spec from the user

Ask only what's missing. You need:

- **Slug** (kebab-case, e.g. `bottom-sheet`).
- **Category** — `base` (broad mobile primitive) or `ai` (featured AI
  collection). If unclear, default to `base` and ask.
- **One-line description.**
- **Anatomy** — 2–4 sentences: what's it made of, when to reach for it.
- **The delight detail** — the one non-obvious motion / haptic / behavior
  that earns the component's place. If the user can't articulate it, push
  back. Components without a delight detail don't get merged.
- **Props sketch** — even rough is fine; you'll refine in step 2.

## Step 1 — Author `packages/ui/src/{components,ai}/<slug>.tsx`

File shape (mirror the existing components):

```
header doc comment   ← what it is + the delight detail, in one breath
imports              ← react, react-native, reanimated, ../lib/cn, ../lib/motion, optional ../lib/haptics
cva blocks           ← <name>Variants / <name>TextVariants (only if there are variants)
Props interface      ← exported, named <Name>Props
component            ← exported, named <Name>
local sub-components ← Dot, Caret, icons… below the main component
named exports        ← incl. variants
```

Non-negotiables (DESIGN.md):

- NativeWind classes only (no `StyleSheet`).
- Reanimated for motion, gesture-handler for gestures.
- Pull durations / easings / springs / `PRESS_SCALE` from `../lib/motion`.
- Pull haptics from `../lib/haptics` if any tactile feedback is needed.
- `accessibilityRole` + label + `hitSlop` on every interactive surface.
- Honor `useReducedMotion()` — fall back to crossfade or settled state.
- Dark-mode first; use token classes (`bg-primary`, `text-muted-foreground`) only.
- Icons: draw small glyphs from `View`s/borders (see `prompt-input.tsx`).
  Don't add an icon library.

## Step 2 — Author `packages/ui/src/{components,ai}/<slug>.meta.ts`

```ts
import type { ComponentMeta } from "../lib/meta";

export const meta: ComponentMeta = {
  slug: "<slug>",
  title: "<Title Case>",
  category: "base" | "ai",
  description: "<one line>",
  anatomy: "<2–4 sentences>",
  delight: "<the one detail, named explicitly>",
  props: [
    { name: "...", type: "...", default: "...", description: "..." },
    // every public prop, in interface order
  ],
  examples: [
    { title: "Basic", description: "...", code: `...` }, // canonical
    // at least one more
  ],
  a11y: ["<bullet 1>", "<bullet 2>", "..."],
};
```

Mirror TSDoc from the component file into `props[].description` — single
source of truth where possible. Examples must be copy-paste runnable.

## Step 3 — Add re-exports to `packages/ui/src/index.ts`

```ts
export { <Name> } from "./<dir>/<slug>";
export type { <Name>Props } from "./<dir>/<slug>";
```

Also add the meta to `packages/ui/src/lib/meta.ts` at the bottom:

```ts
export { meta as <name>Meta } from "../<dir>/<slug>.meta";
```

## Step 4 — Wire the showcase demo

Edit `apps/showcase/lib/demos.tsx`:

1. Add `<Name>` (and any related types) to the import from `@appcn/ui`.
2. If the demo has state, define a `<Name>Demo()` wrapper above the array.
3. Push an entry into the `demos` array:

```ts
{
  slug: "<slug>",
  title: "<Title>",
  description: "<one line>",
  category: "<base|ai>",
  render: () => /* the demo */,
},
```

The slug here MUST match the `<slug>.tsx` filename so `/c/<slug>` resolves.

## Step 5 — Wire the web docs registry

Edit `apps/web/lib/registry.ts` — add an entry to the `components` array:

```ts
{
  slug: "<slug>",
  title: <name>Meta.title,
  description: <name>Meta.description,
  category: <name>Meta.category,
  sourcePath: "../../packages/ui/src/<dir>/<slug>.tsx",
  registryItem: "<slug>",
  meta: <name>Meta,
},
```

…and add `<name>Meta` to the import from `@appcn/ui/lib/meta`.

## Step 6 — Wire the shadcn registry manifest

Edit `apps/web/registry.json` — push to `items`:

```json
{
  "name": "<slug>",
  "type": "registry:component",
  "title": "<Title>",
  "description": "<one line>",
  "dependencies": ["<npm packages the component imports>"],
  "registryDependencies": ["@appcn/cn", "@appcn/motion", "@appcn/haptics"],
  "files": [
    {
      "path": "../../packages/ui/src/<dir>/<slug>.tsx",
      "type": "registry:component",
      "target": "components/ui/<slug>.tsx"
    }
  ]
}
```

`dependencies` → npm packages (`class-variance-authority`,
`react-native-reanimated`, etc.). `registryDependencies` → namespaced refs
to other appCN registry items (`@appcn/cn` always; `@appcn/motion` if
imported; `@appcn/haptics` if imported).

## Step 7 — Verify

Run, in order:

```bash
pnpm typecheck                     # ui + showcase + web all clean
pnpm registry:build                # emits public/r/<slug>.json
pnpm --filter showcase start       # open /c/<slug>, sanity-check the demo
pnpm --filter @appcn/web dev       # /components/<slug> renders all sections
```

If any step fails, fix it. Don't tell the user the component is done.

After all four pass:

- Confirm `apps/web/public/r/<slug>.json` exists and its `files[].content`
  uses `@/lib/cn` (the import-fix script ran).
- Visually confirm the showcase demo on a real device via QR if at all
  possible — web preview can hide motion bugs.

## Step 8 — Hand off to the user

Report:

1. The seven artifacts you wrote / modified, with paths.
2. Verification results (each of the four commands).
3. The exact install command the user can run in a consumer app:
   `npx shadcn@latest add http://localhost:3100/r/<slug>.json`.
4. Anything you couldn't verify (e.g., real-device test) so the user knows
   to check it themselves.

Do **not** commit unless the user asks.
