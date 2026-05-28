# Contributing to appCN

Thanks for being here. appCN is small, opinionated, and motion-first — please
read [`DESIGN.md`](./DESIGN.md) before you write a line of component code.
Architecture lives in [`CLAUDE.md`](./CLAUDE.md).

## Dev setup

```bash
# Once
pnpm install

# Everything (turbo)
pnpm dev

# Just the docs site
pnpm --filter @app-cn/web dev

# Just the Expo showcase (scan the QR with Expo Go)
pnpm --filter showcase start

# Typecheck the whole workspace
pnpm typecheck

# Build the installable shadcn registry
pnpm registry:build
```

Requirements: Node 20+, pnpm 9+, an Expo Go install on a real device for the
showcase QR.

## Adding a new component

Every component ships seven artifacts. The PR template enforces them — there
are no exceptions. The full checklist is in
[`DESIGN.md → Component checklist (SOP)`](./DESIGN.md#component-checklist-sop):

1. `packages/ui/src/{components,ai}/<slug>.tsx` — the component.
2. `packages/ui/src/{components,ai}/<slug>.meta.ts` — typed docs payload.
3. Named export in `packages/ui/src/index.ts`.
4. Demo entry in `apps/showcase/lib/demos.tsx`.
5. Entry in `apps/web/lib/registry.ts`.
6. Entry in `apps/web/registry.json` (shadcn manifest).
7. Verified with `pnpm typecheck && pnpm registry:build`, `/c/<slug>`
   reachable in the showcase, `/components/<slug>` renders all sections.

If you're working with an AI coding agent (Claude / Cursor / Codex / Aider /
Windsurf), invoke the `/new-component` skill — it walks the seven steps for
you. See [`AGENTS.md`](./AGENTS.md) for agent-specific guidance.

## Code style

- **NativeWind only** for styling, no inline `StyleSheet` unless a prop
  genuinely can't be expressed in classes.
- **Reanimated** for motion, **gesture-handler** for gestures, **never** the
  legacy `Animated` API.
- **Tokens, not magic numbers.** Reach for `../lib/motion` (`duration` /
  `easing` / `spring` / `PRESS_SCALE`) and `../lib/haptics` (`haptic.*`).
- **Dark-mode first.** Design the dark variant, then derive light.
- **Accessibility required.** `accessibilityRole`, label, `hitSlop`, focus
  /press state on every interactive component.
- See [`DESIGN.md → What NOT to do`](./DESIGN.md#what-not-to-do) for the full
  list of footguns.

## Commits & PRs

- Conventional-Commit-ish prefixes are welcome (`feat:`, `fix:`, `docs:`,
  `chore:`, `ui:`) but not required.
- Keep PRs scoped — a new component is one PR, a registry tweak is another.
- Include before/after of the showcase route for any visual change.
- CI runs `pnpm typecheck`, `pnpm lint`, and `pnpm registry:build` on every
  PR — fix red builds before requesting review.

## Releasing (maintainers)

`@app-cn/ui` is published manually for now:

1. Bump `packages/ui/package.json` `version` and add a `CHANGELOG.md` entry.
2. Tag the commit (`git tag v0.1.x && git push --tags`).
3. Dispatch the `release.yml` workflow from the Actions tab.

The shadcn registry (`apps/web/public/r/*.json`) is rebuilt and deployed with
every push to `main` via the docs site's deploy.

## Reporting bugs / requesting components

- **Bug?** Use the bug-report issue template — include the component slug,
  repro, and env (Expo SDK, RN, NativeWind versions).
- **Want a new component?** Use the component-request template. You'll be
  asked: *what's the delight detail?* This filters lazy requests — every
  shipped component has to earn its place.

## Code of conduct

By participating, you agree to abide by the
[Contributor Covenant](./CODE_OF_CONDUCT.md). Report incidents to
**thisissalah.dev@gmail.com**.
