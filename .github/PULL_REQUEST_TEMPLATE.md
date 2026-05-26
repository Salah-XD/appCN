<!-- Thanks for the contribution. Fill in the sections that apply. -->

## Summary

<!-- One or two sentences. What does this PR do, and why? -->

## Type of change

- [ ] Bug fix (non-breaking)
- [ ] New component
- [ ] Enhancement to an existing component (non-breaking)
- [ ] Breaking change
- [ ] Docs / site / registry tooling
- [ ] Internal (CI, scripts, config — no user-visible change)

## Component checklist (for new components)

If this PR adds a new component, all seven boxes must be ticked. The
canonical checklist lives in
[`DESIGN.md → Component checklist (SOP)`](../DESIGN.md#component-checklist-sop).

- [ ] 1. `packages/ui/src/{components,ai}/<slug>.tsx`
- [ ] 2. `packages/ui/src/{components,ai}/<slug>.meta.ts` (anatomy / delight / props / examples / a11y)
- [ ] 3. Named exports added to `packages/ui/src/index.ts`
- [ ] 4. Demo entry added to `apps/showcase/lib/demos.tsx`
- [ ] 5. Entry added to `apps/web/lib/registry.ts`
- [ ] 6. Entry added to `apps/web/registry.json` (with correct `registryDependencies`)
- [ ] 7. Verified locally: `pnpm typecheck && pnpm registry:build` clean, `/c/<slug>` reachable in showcase, `/components/<slug>` renders all sections

## Verification

<!-- How did you test this? Include screenshots / screen recordings for any UI change. The showcase Expo route is the canonical preview surface. -->

## Notes for reviewers

<!-- Anything reviewers should look at first, decisions you're unsure about, follow-up work deliberately deferred. -->
