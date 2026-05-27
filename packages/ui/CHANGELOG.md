# Changelog — @appcn/ui

See the root [CHANGELOG.md](../../CHANGELOG.md) for the project-wide log;
this file tracks only changes to the published `@appcn/ui` package surface
(exports, components, peer deps).

## [0.1.0] — Unreleased

Initial public release.

### Added
- **Components:** `Button` (base) + `StreamBubble`, `PromptInput`,
  `ReasoningTrace` (AI collection).
- **Libs:** `cn`, motion tokens (`duration`, `easing`, `spring`,
  `PRESS_SCALE`), safe `haptic.*` wrapper.
- **Tailwind preset:** dark-first HSL token palette consumable via
  `presets: [require("@appcn/ui/tailwind-preset")]`.
- **`@appcn/ui/global.css`** — drop into your app entry to define the CSS
  variables.
- **Subpath exports:**
  - `@appcn/ui` — full barrel.
  - `@appcn/ui/components/*` — individual base components.
  - `@appcn/ui/ai/*` — individual AI components.
  - `@appcn/ui/lib/*` — shared helpers + the component meta payloads.
  - `@appcn/ui/tailwind-preset` — Tailwind preset.
  - `@appcn/ui/global.css` — CSS variables file.

### Notes
- Ships TS source only (no `dist/`). Metro / Next / Vite transpile TS
  themselves — no build step required.
- `expo-haptics` is an **optional** peer dep — the components no-op on web
  and on devices without it.

[0.1.0]: https://github.com/Salah-XD/appCN/releases/tag/v0.1.0
