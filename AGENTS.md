# AGENTS.md

Guidance for AI coding agents (Claude Code, Cursor, Windsurf, OpenAI Codex,
Aider, …) working in the appCN repo. **Read this before you touch code.**

This file follows the cross-tool `AGENTS.md` convention — most modern agents
look for it automatically.

## Read first

1. **[`CLAUDE.md`](./CLAUDE.md)** — architecture, monorepo map, commands,
   gotchas. Do not skip.
2. **[`DESIGN.md`](./DESIGN.md)** — the taste layer. Motion rules, the "one
   delight detail" requirement, the per-component file shape, the explicit
   what-NOT-to-do list, and the seven-step **Component checklist (SOP)**.
3. **[`CONTRIBUTING.md`](./CONTRIBUTING.md)** — dev setup, PR conventions.

If you're proposing a new component, your work is invalid unless it satisfies
the SOP. There are no exceptions.

## Hard rules

- **No new dependencies** without justifying them in the PR. Especially
  not icon libraries — draw glyphs from `View`s/borders (see
  `prompt-input.tsx` for the pattern).
- **No `StyleSheet` / inline styles** when NativeWind can express the rule.
- **No `Animated` API.** Reanimated only. Gestures via `gesture-handler`.
- **No magic durations or easings.** Pull from `../lib/motion`. If you find
  yourself hand-typing `300` or `Easing.out(...)`, you're doing it wrong.
- **No skipping accessibility.** Every interactive component needs
  `accessibilityRole`, a label, `hitSlop`, and ≥ 44pt touch targets.
- **No light-mode-first.** Design dark, then derive light.
- **No `useEffect` for layout-affecting state** when a derived value works.

## Next.js 16 warning (apps/web only)

`apps/web/` is on Next.js 16. APIs, conventions, and file structure differ
from what models were trained on. Before authoring or editing any code under
`apps/web/app/`, read the relevant doc in `node_modules/next/dist/docs/`.

Confirmed-current conventions worth flagging:

- `params` is a **Promise** in pages and layouts — must be `await`ed.
- Layouts are **cached** and do not re-render on navigation. Active-state
  for nav links must live in a Client Component using `usePathname()`.
- See `apps/web/AGENTS.md` for the in-app reminder.

## Component SOP (the canonical eight steps)

Every component ships these. The PR template enforces them; reviewers will
bounce PRs that skip any one. Full version in
[`DESIGN.md → Component checklist (SOP)`](./DESIGN.md#component-checklist-sop).

1. `packages/ui/src/{components,ai}/<slug>.tsx`
2. `packages/ui/src/{components,ai}/<slug>.meta.ts` (`ComponentMeta`)
3. Named exports in `packages/ui/src/index.ts`
4. Demo in `apps/showcase/lib/demos.tsx`
5. Entry in `apps/web/lib/registry.ts`
6. Entry in `apps/web/registry.json`
7. `pnpm typecheck && pnpm registry:build` clean, `/c/<slug>` reachable in
   showcase, `/components/<slug>` renders all docs sections.
8. Changeset committed (`pnpm changeset` → `@app-cn/ui` minor for new
   component, patch for bugfix).

## Releases / changesets

Any change under `packages/ui/**` or `packages/cli/**` needs an accompanying
`.changeset/*.md` file describing the bump. Run `pnpm changeset` interactively
from the repo root; the bot blocks PRs without one. **Never bump `version`
in `package.json` by hand** — Changesets owns that. The release workflow
publishes to npm via OIDC when a "Version Packages" PR merges to main; no
tokens, no manual tagging.

## Claude-specific helpers

If you're Claude Code, two project-level skills automate the chores:

- **`/new-component`** — walks the 7-step SOP, drops a `<slug>.meta.ts`
  template ready to fill out, wires the registry + showcase entries, verifies
  with typecheck + registry build. Source: `.claude/skills/new-component/`.
- **`/document-component`** — fill out a `<slug>.meta.ts` for an existing
  component by reading its source and TSDoc. Source:
  `.claude/skills/document-component/`.

## Verification commands (memorize these)

```bash
pnpm typecheck                        # tsc across ui + cli + web (+ showcase via cd)
pnpm lint
pnpm registry:build                   # clean + shadcn build + import-fix + validator
pnpm changeset status                 # are we missing a changeset for this PR?
pnpm --filter @app-cn/cli build        # bundle the CLI with tsup
pnpm --filter showcase start          # scan QR with Expo Go
pnpm --filter @app-cn/web dev          # http://localhost:3100
```

A passing `pnpm typecheck` plus `pnpm registry:build` plus a clean
`pnpm changeset status` (or a fresh changeset committed) is the minimum bar
before you say a change is done.

## Things that look like bugs but aren't

- Showcase's `apps/showcase/AGENTS.md` and `apps/web/AGENTS.md` are tiny
  deprecation/warning files, not full guides. Root `AGENTS.md` (this file)
  is canonical.
- `apps/web/public/r/` is **generated** (`pnpm registry:build`) and
  gitignored. Don't commit the JSON.
- In-repo component sources import shared helpers relatively
  (`../lib/cn`). The post-build script
  `apps/web/scripts/fix-registry-imports.mjs` rewrites those to `@/lib/cn`
  in the emitted registry JSON. Don't try to "fix" the relative imports —
  they're correct in-repo.
- The web app has **no React Native** deps. Previews are iframed in from
  the Expo showcase. Don't add `react-native-web`, `nativewind`, or RN
  modules to `apps/web/`.

## When you're stuck

- Check `CLAUDE.md` first — most architecture answers are there.
- Check `DESIGN.md` for taste/motion questions.
- If a Next.js API behaves unexpectedly, **read
  `node_modules/next/dist/docs/`** before guessing.
- If a Metro / NativeWind / Reanimated config behaves unexpectedly, the
  three usual suspects are `apps/showcase/babel.config.js` (worklets plugin
  must be last), `apps/showcase/metro.config.js` (watchFolders), and the
  hoisted RN version in the root `node_modules`.
