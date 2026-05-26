---
name: document-component
description: Fill out the typed `<slug>.meta.ts` payload for an appCN component that already exists. Reads the component source + TSDoc and produces accurate anatomy, delight, props, examples, and a11y entries. Invoke when the user asks to document, write meta for, or backfill docs for a specific component.
---

# /document-component

This skill writes (or rewrites) a `<slug>.meta.ts` for a component that
already exists in `packages/ui/src/`. Component code must not change — only
the meta file.

## Step 0 — Confirm target

Ask which component if not given. Verify:

- `packages/ui/src/{components,ai}/<slug>.tsx` exists.
- Note whether `<slug>.meta.ts` already exists (you may be rewriting).

## Step 1 — Read the source

Read the full component `.tsx`. Note:

- Header doc comment (often names the delight detail).
- The exported `<Name>Props` interface — every public prop, in order, with
  its TSDoc.
- Defaults (look for `prop = value` in the destructured signature).
- Animations + `useReducedMotion()` branches (drives the delight bullet and
  the a11y bullet about reduced motion).
- `accessibilityRole`, `accessibilityLabel`, `accessibilityState`,
  `hitSlop` — these drive the a11y section.

If `../lib/motion` / `../lib/haptics` are used, those are themselves shipped
as registry deps and worth mentioning in anatomy / a11y where relevant.

## Step 2 — Compose the meta

Use the existing metas in `packages/ui/src/{components,ai}/*.meta.ts` as
reference for voice and depth.

```ts
import type { ComponentMeta } from "../lib/meta";

export const meta: ComponentMeta = {
  slug: "...",
  title: "...",
  category: "base" | "ai",
  description: "<one line — match the component's header doc comment if it has one>",
  anatomy: "<2–4 sentences: what's it made of, when to reach for it>",
  delight: "<the one non-obvious motion / haptic / behavior>",
  props: [
    /* every public prop, in interface order, with TSDoc mirrored into description */
  ],
  examples: [
    { title: "Basic", description: "...", code: `...` }, // canonical demo
    { title: "<feature>", description: "...", code: `...` },
    // more if the component has clearly distinct modes
  ],
  a11y: [
    /* one bullet per relevant accessibility behavior:
       roles, labels, state, hit slop, reduced-motion, focus/press feedback */
  ],
};
```

**Constraints:**

- `delight` must be specific and observable. "Spring animation" isn't
  delight. "Press-in snaps to 0.96 with a fast 100ms ease; release settles
  back over 140ms" is.
- Examples are copy-paste runnable. Imports are assumed; component usage is
  not. No off-screen helpers.
- Props in the order they appear in the interface. Mark `required: true` if
  the prop has no default.
- a11y bullets describe **what the component actually does**, not generic
  advice.

## Step 3 — Verify

```bash
pnpm typecheck
```

Must pass. If the meta type rejects your shape, fix the meta, not the type.

If this is a new meta (not a rewrite), also confirm:

- `packages/ui/src/lib/meta.ts` re-exports it as `<name>Meta`.
- `packages/ui/src/index.ts` re-exports it too (via the `lib/meta` barrel).
- `apps/web/lib/registry.ts`'s entry for this slug has its `meta` field set
  to `<name>Meta`.

## Step 4 — Hand off

Report:

1. The meta file path.
2. Anything ambiguous about the component that you had to make a judgment
   call on (so the maintainer can correct it).
3. If `pnpm --filter @appcn/web dev` is running, confirm
   `/components/<slug>` now renders all docs sections.

Do **not** commit unless the user asks.
