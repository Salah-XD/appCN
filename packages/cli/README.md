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

One-shot setup wizard. Detects whether the project is Expo or bare React Native, detects your package manager from the lockfile, installs the missing runtime deps, and patches the configs needed for NativeWind + Reanimated. **Idempotent** — re-running on an already-configured project produces zero diffs.

What `init` writes / patches:

- `tailwind.config.js` — adds `presets: [require("@app-cn/ui/tailwind-preset")]` and content globs.
- `babel.config.js` — `nativewind/babel` preset and `react-native-worklets/plugin` (Reanimated 4) or `react-native-reanimated/plugin` (Reanimated 3) as the **last** plugin.
- `metro.config.js` — wraps `getDefaultConfig` with `withNativeWind(..., { input: "./global.css" })`.
- `global.css` — Tailwind directives + appCN CSS variables. Prints the one-line import to add to your app entry; never silently edits `_layout.tsx`.
- `tsconfig.json` — ensures `compilerOptions.paths["@/*"]` resolves to `./*` (jsonc-parser; preserves comments and trailing commas).
- `components.json` — deep-merges `registries["@app-cn"]: "https://appcn.vercel.app/r/{name}.json"` and default `aliases`.

If any config exists but is incompatible (e.g. a metro config without `withNativeWind`), the CLI prints the required diff and aborts — it never silently mutates Metro or app entry files.

Flag: `--lib` also adds `@app-cn/ui` as a managed dependency.

Full docs at [appcn.vercel.app/docs/cli](https://appcn.vercel.app/docs/cli).

### `appcn add <slug>`

Installs a single component from `https://appcn.vercel.app/r/<slug>.json`. Behind the scenes this:

1. Verifies the slug exists on the registry (HEAD check).
2. Ensures your `components.json` has the `@app-cn` registry entry.
3. Delegates to `shadcn@latest add @app-cn/<slug>` via your detected package manager.

Flags:

- `-y, --yes` — auto-patch `components.json` if the registry entry is missing.

## Environment variables

- `APPCN_REGISTRY_URL` — override the registry base URL. Defaults to `https://appcn.vercel.app/r`. Useful for local docs work.

## License

MIT © Salah-XD
