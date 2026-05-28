# @app-cn/cli

Command-line interface for [appCN](https://appcn.vercel.app) — copy-paste mobile components for React Native + Expo.

## Quick start

```sh
# Initialize an Expo / React Native project for appCN
npx @app-cn/cli@latest init

# Install a component
npx @app-cn/cli@latest add button
```

Replace `npx` with `pnpm dlx`, `yarn dlx`, or `bunx --bun` depending on your package manager.

## Commands

### `appcn init`

Sets up NativeWind + Reanimated config and registers the `@app-cn` namespace in your `components.json` so the shadcn CLI can resolve appCN components by their short name (e.g. `@app-cn/button`).

> The init wizard is a work-in-progress in `0.1.0` and currently prints manual setup instructions. The full automated flow ships in `0.2.0`.

### `appcn add <slug>`

Installs a single component from `https://appcn.vercel.app/r/<slug>.json`. Behind the scenes this:

1. Verifies the slug exists on the registry.
2. Ensures your `components.json` has the `@app-cn` registry entry.
3. Delegates to `shadcn@latest add @app-cn/<slug>` via your detected package manager.

Flags:

- `-y, --yes` — auto-patch `components.json` if the registry entry is missing.

## Environment variables

- `APPCN_REGISTRY_URL` — override the registry base URL. Defaults to `https://appcn.vercel.app/r`. Useful for local docs work.

## License

MIT © Salah-XD
