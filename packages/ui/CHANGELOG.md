# Changelog — @app-cn/ui

See the root [CHANGELOG.md](../../CHANGELOG.md) for the project-wide log;
this file tracks only changes to the published `@app-cn/ui` package surface
(exports, components, peer deps).

## [0.1.0] — Unreleased

Initial public release.

### Added
- **Components:** `Button` (base) + `StreamBubble`, `PromptInput`,
  `ReasoningTrace` (AI collection).
- **Libs:** `cn`, motion tokens (`duration`, `easing`, `spring`,
  `PRESS_SCALE`), safe `haptic.*` wrapper.
- **Tailwind preset:** dark-first HSL token palette consumable via
  `presets: [require("@app-cn/ui/tailwind-preset")]`.
- **`@app-cn/ui/global.css`** — drop into your app entry to define the CSS
  variables.
- **Subpath exports:**
  - `@app-cn/ui` — full barrel.
  - `@app-cn/ui/components/*` — individual base components.
  - `@app-cn/ui/ai/*` — individual AI components.
  - `@app-cn/ui/lib/*` — shared helpers + the component meta payloads.
  - `@app-cn/ui/tailwind-preset` — Tailwind preset.
  - `@app-cn/ui/global.css` — CSS variables file.

### Notes
- Ships TS source only (no `dist/`). Metro / Next / Vite transpile TS
  themselves — no build step required.
- `expo-haptics` is an **optional** peer dep — the components no-op on web
  and on devices without it.

[0.1.0]: https://github.com/Salah-XD/appCN/releases/tag/v0.1.0
