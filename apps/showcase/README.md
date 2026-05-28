# showcase

The appCN Expo app — renders every component at `/c/<slug>`. It's:

- The **iframe target** for the docs site's interactive web previews.
- The **QR code deep-link target** so reviewers can scan a component on their
  phone via Expo Go.

Deployed (web export) to <https://appcn-showcase.vercel.app>.

## Dev

```bash
pnpm --filter showcase start           # Expo dev server — scan QR with Expo Go
pnpm --filter showcase web             # web preview at http://localhost:8081
```

## How it fits

- **Source of truth** for components is `packages/ui/src/`. The showcase
  only adds a per-component demo wrapper in `lib/demos.tsx`.
- Metro `watchFolders` includes the workspace root so changes in
  `packages/ui/` hot-reload here.
- See `babel.config.js` (worklets plugin must be last), `metro.config.js`
  (NativeWind wrapper + monorepo resolver), and `global.css` (token mirror).

Root context: [README.md](../../README.md). Architecture: [CLAUDE.md](../../CLAUDE.md).
