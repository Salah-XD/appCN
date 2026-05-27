# Changelog

All notable changes to **`@appcn/ui`** are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); the project adheres
to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Typed component-meta SOP (`packages/ui/src/lib/meta.ts`) — every component
  ships a colocated `<slug>.meta.ts` consumed by the docs renderer.
- Filled-in metas for `button`, `stream-bubble`, `prompt-input`,
  `reasoning-trace`.
- Rebuilt docs page renderer (`/components/<slug>`) with Install /
  Anatomy / Delight / Props / Examples / Accessibility sections.
- Sidebar nav at `/components/*` split by Base vs AI.
- Landing rebuild: hero with live phone-frame iframe, dual-install pill, AI
  collection feature card with 2×2 live previews, "How it works", "Why
  appCN", real footer with link columns.
- OSS hygiene: `LICENSE`, root `README`, `CONTRIBUTING`, `CODE_OF_CONDUCT`,
  `SECURITY`, `.editorconfig`, `.github/` issue + PR templates + CI workflow.
- AI agent rules: root `AGENTS.md`, `.claude/skills/new-component/`,
  `.claude/skills/document-component/`.

### Fixed
- `apps/showcase/lib/demos.tsx` — `prompt-input` and `reasoning-trace`
  demos were defined but never registered. All shipped components are now
  reachable from the showcase index and via `/c/<slug>`.

## [0.1.0] — Unreleased

Initial public release once Phase 6 (npm dual distribution) lands.

### Added
- `Button` — pressable with variants and a Reanimated press-scale.
- `StreamBubble` — AI assistant message with thinking → token-stream → settle.
- `PromptInput` — AI composer; send button morphs into a stop with a spinning ring.
- `ReasoningTrace` — collapsible chain-of-thought with shimmer + auto-collapse.
- shadcn custom registry served at `appcn.dev/r/*.json`.
- `@appcn/ui` published to npm under MIT.

[Unreleased]: https://github.com/Salah-XD/appCN/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/Salah-XD/appCN/releases/tag/v0.1.0
