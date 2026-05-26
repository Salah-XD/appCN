# appCN

A **shadcn-philosophy component system for React Native / Expo**: copy-paste ownership, editable
source, NativeWind styling, motion-first premium defaults. Distributed through the **shadcn CLI's
custom-registry** mechanism (`npx shadcn add <url>`), not as a black-box npm package.

## Positioning

- **Base:** a broad mobile component library (button, sheet, input, list, tabs, …).
- **Featured / hero:** an **AI-native mobile collection** (`packages/ui/src/ai/*`) — streaming chat
  bubble, voice waveform, typing/thinking states, copilot overlay. This is the marketed wedge that
  differentiates appCN from the incumbent (React Native Reusables).
- **Differentiator:** the previews experience — every component is viewable **interactively in the
  browser**, **live on a real phone via QR (Expo)**, and as **video**.
  - The interactive web preview is an **iframe into the Expo web build** (`expo start --web`, default
    `:8081`, route `/c/<slug>`), NOT react-native-web inside Next. Same code path as the phone, so
    web and device previews are guaranteed identical and we avoid NativeWind-in-Next config hell.
  - The web app therefore has **no React Native / NativeWind deps** — it's plain Next.js + Tailwind v3.

## Monorepo map

Turborepo + pnpm workspaces. The cross-bundler boundary (Metro for Expo vs Next for web) is handled
inside the repo, not by splitting repos.

```
apps/
  web/        Next.js App Router — landing + docs + interactive previews + the registry JSON it serves
  showcase/   Expo Router app — renders every component; the target the docs QR codes deep-link into
packages/
  ui/         ★ SINGLE SOURCE OF TRUTH for all components (RN + NativeWind). Also exports the
              shared Tailwind/NativeWind preset + theme tokens consumed by BOTH apps.
  tsconfig/   shared TypeScript bases (@appcn/tsconfig)
```

**Golden rule:** component source lives ONLY in `packages/ui/src`. The Expo app, the web previews,
and the registry builder all read from there. Never fork a component into an app.

## Commands

```bash
pnpm install                      # install all workspaces
pnpm dev                          # run everything (turbo)
pnpm --filter @appcn/web dev      # web (landing + docs) only
pnpm --filter showcase start      # Expo dev server (scan QR with Expo Go)
pnpm typecheck                    # tsc across the repo
pnpm lint
pnpm registry:build               # `shadcn build` -> apps/web/public/r/*.json (the installable registry)
```

Install a component into a consumer app (this is the product):
```bash
npx shadcn@latest add https://appcn.dev/r/button.json
```

## Component authoring conventions

- **Styling:** NativeWind v4 className only. No inline `StyleSheet` unless a prop genuinely can't be
  expressed in NativeWind. Theme via tokens in the shared preset (`packages/ui` Tailwind preset).
- **Dark-mode first.** Design the dark variant first, then light.
- **Motion:** `react-native-reanimated`. **Gestures:** `react-native-gesture-handler`. Prefer these
  over the Animated API.
- **Accessibility required:** `accessibilityRole`, labels, hit slop, and focus/press states on every
  interactive component.
- **Portability (critical for copy-paste):** each component must be as self-contained as possible.
  Shared helpers (`cn`, `motion`, `haptics`) are declared as registry `dependencies` /
  `registryDependencies` so the shadcn CLI pulls them in — never assume the consumer has
  appCN-internal modules.
- **Motion + haptics tokens:** reach for `../lib/motion` (`duration` / `easing` / `spring` /
  `PRESS_SCALE`) and `../lib/haptics` (`haptic.*`) instead of hand-typed values — they're what
  makes everything feel like one system.

> **Read [`DESIGN.md`](./DESIGN.md) before authoring a component.** It's the taste layer:
> the "one delight detail" rule, motion/variant conventions, the per-component file shape, and
> the explicit "what NOT to do" list. CLAUDE.md is architecture; DESIGN.md is feel.

## Component SOP

Every component ships **seven** artifacts. The PR template enforces them; reviewers bounce PRs
that skip any one. The full checklist lives in
[`DESIGN.md → Component checklist (SOP)`](./DESIGN.md#component-checklist-sop), and the
`/new-component` Claude skill walks an agent through them.

1. `packages/ui/src/{components,ai}/<slug>.tsx`
2. `packages/ui/src/{components,ai}/<slug>.meta.ts` (satisfies `ComponentMeta` from
   `packages/ui/src/lib/meta.ts`; consumed by the docs renderer)
3. Named exports added to `packages/ui/src/index.ts` (component + types + meta via the
   `lib/meta` barrel)
4. Demo entry added to `apps/showcase/lib/demos.tsx`
5. Entry added to `apps/web/lib/registry.ts`
6. Entry added to `apps/web/registry.json` (shadcn manifest)
7. Verified: `pnpm typecheck && pnpm registry:build` clean, `/c/<slug>` reachable in the
   showcase, `/components/<slug>` renders all docs sections.

## Distribution

appCN ships **both** ways — same primitives, consumer's choice:

- **shadcn CLI** (copy-paste, no lock-in):
  `npx shadcn@latest add https://appcn.dev/r/<slug>.json` or the namespaced form
  `npx shadcn@latest add @appcn/<slug>` (after registering `"@appcn"` in `components.json`).
  Served by `apps/web/public/r/*.json`, regenerated by `pnpm registry:build` on every deploy.
- **npm** (managed dep): `npm install @appcn/ui`. Ships TS source only (`files: ["src",
  "tailwind.preset.js", "README.md", "LICENSE", "CHANGELOG.md"]`); Metro / Next / Vite transpile
  TS themselves — no build step. Publishing flow lives in
  `.github/workflows/release.yml` (manual `workflow_dispatch`).

The docs site (`/components/<slug>` → Install tabs) and landing hero pill surface both forms.

## Agent rules

- Root [`AGENTS.md`](./AGENTS.md) is the canonical cross-tool agent guide (Cursor / Codex /
  Windsurf / Aider / Claude Code all read it). Hard rules, Next 16 caveat, and the SOP summary.
- Claude-specific skills under `.claude/skills/`:
  - `/new-component` — walks the seven-step SOP and verifies.
  - `/document-component` — fills out a `<slug>.meta.ts` for an existing component.
- The two `apps/*/AGENTS.md` files are tiny deprecation notes — root `AGENTS.md` is canonical.

## Registry conventions

- `apps/web/registry.json` is the manifest; each item points at source files in `packages/ui/src`.
- `pnpm registry:build` runs `shadcn build` AND `scripts/fix-registry-imports.mjs`, emitting static
  `apps/web/public/r/<name>.json`, served by the web app. `public/r/` is gitignored — generated on deploy.
- **Import rewrite (important):** in-repo components import shared helpers relatively (`../lib/cn`) so
  the monorepo bundles. shadcn does NOT rewrite relative imports for consumers, so the post-build
  script converts `../lib/<name>` → `@/lib/<name>` in the emitted JSON. The rule is generic
  (`apps/web/scripts/fix-registry-imports.mjs`), so any new `lib/*` helper is handled automatically.
- Cross-references between items use the **namespaced** form (`registryDependencies: ["@appcn/cn"]`),
  installed via a consumer `components.json` registry entry `"@appcn": ".../r/{name}.json"`.
- Naming: kebab-case (`stream-bubble`), one item per component. Base vs `ai` collection is reflected
  in registry item metadata/categories.
- Verified install loop: `npx shadcn@latest add @appcn/button` pulls the component + its `cn`
  dependency and writes them with correctly-resolving `@/lib/cn` imports.

## Monorepo gotchas (read before debugging build errors)

- **Single React Native version** must be hoisted — duplicate RN copies break Metro. `.npmrc` sets
  `node-linker=hoisted` (Expo requirement under pnpm).
- **Tailwind v3 across the WHOLE repo.** NativeWind 4 requires `tailwindcss@~3`. The web app was
  converted off create-next-app's Tailwind v4 to v3 so the single hoisted `tailwindcss` satisfies
  NativeWind. Do not reintroduce Tailwind v4 anywhere.
- **Metro `watchFolders` + `nodeModulesPaths`** (see `apps/showcase/metro.config.js`) include the
  workspace root so the Expo app resolves `@appcn/ui` and hoisted deps; `disableHierarchicalLookup`
  is on.
- **Reanimated 4** uses `react-native-worklets/plugin` (last in `babel.config.js`), not the old
  `react-native-reanimated/plugin`.
- The web app does NOT bundle RN — no `transpilePackages` needed (previews are iframed; see above).

## Honest project notes

- The moat is **brand / taste / docs / previews**, not component count (copy-paste = zero lock-in).
  Invest in the AI collection and the preview experience over breadth.
- react-native-web interactive previews are the fiddliest piece; motion/gesture-heavy components may
  degrade on web — that's expected, the QR-to-phone preview is the source of truth for those.
