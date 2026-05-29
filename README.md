<div align="center">

# appCN

**Copy-paste mobile components for React Native + Expo.**

A shadcn-philosophy library: you own the source, NativeWind styles the surface,
Reanimated drives the motion — and the featured AI-native collection ships
streaming bubbles, prompt composers, reasoning traces, and a reactive 3D voice
orb.

[![@app-cn/ui on npm](https://img.shields.io/npm/v/%40app-cn%2Fui?label=%40app-cn%2Fui&color=8b5cf6&labelColor=18181b)](https://www.npmjs.com/package/@app-cn/ui)
[![@app-cn/cli on npm](https://img.shields.io/npm/v/%40app-cn%2Fcli?label=%40app-cn%2Fcli&color=8b5cf6&labelColor=18181b)](https://www.npmjs.com/package/@app-cn/cli)
[![License: MIT](https://img.shields.io/github/license/Salah-XD/appCN?color=8b5cf6&labelColor=18181b)](./LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/Salah-XD/appCN/ci.yml?branch=main&label=CI&color=8b5cf6&labelColor=18181b)](https://github.com/Salah-XD/appCN/actions/workflows/ci.yml)
[![Stars](https://img.shields.io/github/stars/Salah-XD/appCN?style=flat&color=8b5cf6&labelColor=18181b)](https://github.com/Salah-XD/appCN/stargazers)

[![React Native](https://img.shields.io/badge/React%20Native-0.81-61dafb?logo=react&logoColor=white&labelColor=18181b)](https://reactnative.dev)
[![Expo SDK 54](https://img.shields.io/badge/Expo-SDK%2054-1B69B4?logo=expo&logoColor=white&labelColor=18181b)](https://expo.dev)
[![NativeWind 4](https://img.shields.io/badge/NativeWind-4-38bdf8?logo=tailwindcss&logoColor=white&labelColor=18181b)](https://www.nativewind.dev)
[![Reanimated 4](https://img.shields.io/badge/Reanimated-4-9333ea?labelColor=18181b)](https://docs.swmansion.com/react-native-reanimated/)
[![Built with pnpm](https://img.shields.io/badge/pnpm-9.15-f9ad00?logo=pnpm&logoColor=white&labelColor=18181b)](https://pnpm.io)

[![Open in Expo Go](https://img.shields.io/badge/Expo%20Go-Live%20on%20Android%20%26%20iPhone-1B69B4?logo=expo&logoColor=white&labelColor=18181b)](https://appcn.vercel.app/docs/mobile-app)
[![Play Store — Coming soon](https://img.shields.io/badge/Google%20Play-Coming%20soon-9ca3af?logo=googleplay&logoColor=white&labelColor=18181b)](https://appcn.vercel.app/docs/mobile-app)

**[Browse components](https://appcn.vercel.app/components)** ·
**[CLI docs](https://appcn.vercel.app/docs/cli)** ·
**[Mobile app](https://appcn.vercel.app/docs/mobile-app)** ·
**[Live showcase](https://appcn-showcase.vercel.app)** ·
**[GitHub](https://github.com/Salah-XD/appCN)**

</div>

---

## Quick start

The CLI handles NativeWind + Reanimated wiring and registers the `@app-cn`
shadcn namespace for you. One command to set up, one to add a component.

```bash
# 1. (Recommended) One-shot project setup
npx @app-cn/cli@latest init

# 2. Add any component by slug
npx @app-cn/cli@latest add voice-sphere
```

Prefer your own pipeline? `appcn add` is a thin wrapper around shadcn — you can
skip the CLI entirely:

```bash
# Copy a single component via shadcn (no setup, one-off)
npx shadcn@latest add https://appcn.vercel.app/r/voice-sphere.json

# Or pull the whole library as a managed dep
npm install @app-cn/ui
```

Building with an AI agent? Add the appCN **MCP server** so Claude Code, Cursor,
or Windsurf can discover and install components for you — and write new code in
appCN's motion/haptic style:

```bash
# Claude Code
claude mcp add appcn -- npx -y @app-cn/mcp
```

See **[MCP docs](https://appcn.vercel.app/docs/mcp)** for Cursor / Windsurf / VS Code config.

> Status: **v0.1.0 live on npm.** Five components shipped — the AI collection
> is the marketed wedge and is the first place to land new work.

---

## What's in the box

> **New:** appCN is live on real phones — scan a QR with **[Expo Go](https://appcn.vercel.app/docs/mobile-app)**
> and the entire component gallery loads on Android or iPhone in seconds.
> No emulator, no developer account. Standalone Play Store APK is in review —
> shipping soon.

### Base

| Component | Delight |
| :-- | :-- |
| `Button` | Spring-y press scale to 0.96, settles in 140 ms — feels weighted, never twitchy |

### AI-native

| Component | Delight |
| :-- | :-- |
| `StreamBubble` | Three-phase thinking → token stream → settle |
| `PromptInput` | Send morphs into a stop with a spinning ring |
| `ReasoningTrace` | Auto-collapses the instant the answer lands |
| `VoiceSphere` | Reactive 3D orb that breathes with voice level |

Every component has an **interactive web preview**, a **QR you can scan with
Expo Go** to run it live on your phone, and a **video** — same code path
on every surface. → **[appcn.vercel.app/components](https://appcn.vercel.app/components)**

---

## Why appCN

- **Real-phone previews.** Scan a QR with Expo Go and the component runs live
  on your device with native gestures. No emulator gymnastics.
- **AI-native flagship.** The AI collection is the wedge — components built
  for AI apps that nobody else ships well.
- **Quadruple distribution.** The `appcn` CLI, the shadcn registry, `@app-cn/ui`
  from npm — or the **MCP server**, so your AI coding agent installs components
  for you. Same primitives, your call.
- **Motion-first defaults.** Reanimated + gesture-handler, shared motion
  tokens (`duration` / `easing` / `spring`), one delight detail per component.
- **Dark-mode first.** Designed dark, then derived to light. Premium reads as
  depth, not rainbows.
- **You own the source.** Copy-paste philosophy means no lock-in — once a
  component lands in your repo, edit freely.

---

## Documentation

| Surface | What's there |
| :-- | :-- |
| **[appcn.vercel.app](https://appcn.vercel.app)** | Live docs site — landing, every component, live previews |
| **[CLI docs](https://appcn.vercel.app/docs/cli)** | `init`, `add`, env vars, the idempotency contract |
| **[Mobile app](https://appcn.vercel.app/docs/mobile-app)** | Play Store + Expo Go install paths, deep-link contract |
| **[`CLAUDE.md`](./CLAUDE.md)** | Architecture, monorepo map, commands, Metro/Reanimated gotchas |
| **[`DESIGN.md`](./DESIGN.md)** | Taste layer — motion rules, the "one delight detail" rule, the 8-step SOP |
| **[`CONTRIBUTING.md`](./CONTRIBUTING.md)** | Dev setup, the Changesets release flow, PR conventions |
| **[`AGENTS.md`](./AGENTS.md)** | Cross-tool guide for AI coding agents (Claude / Cursor / Windsurf / Codex / Aider) |

---

## Contributing

Every new component ships through the **8-step SOP** in
[DESIGN.md → Component checklist](./DESIGN.md#component-checklist-sop). Don't
skip steps — the PR template enforces them and a missing changeset blocks the
release pipeline.

Working with an AI agent? Invoke the **`/new-component`** Claude skill — it
walks the checklist, drops a typed `<slug>.meta.ts` template ready to fill,
wires the registry + showcase entries, and verifies with typecheck + registry
build.

Full guide: [`CONTRIBUTING.md`](./CONTRIBUTING.md).

---

## Releases

Releases are driven by [Changesets](https://github.com/changesets/changesets)
and published to npm via **OIDC Trusted Publishing** — zero long-lived secrets.

```bash
pnpm changeset           # describe what changed + pick a bump
git commit -am "..."     # commit the changeset alongside your code
# Open a PR. After merge to main, a "Version Packages" PR opens automatically.
# Merge that PR → CI publishes via OIDC.
```

Every published version gets a verified provenance badge on npm.

---

## Deploying

<details>
<summary>The site is two Vercel projects from one monorepo — click for setup.</summary>

| Project | Vercel root directory | What it serves |
| :-- | :-- | :-- |
| Docs | `apps/web` | Landing, `/components/*`, `/docs/*`, the shadcn registry at `/r/*.json` |
| Showcase | `apps/showcase` | Expo web export — the iframe target for interactive previews |

**Deploy order (matters):**

1. **Deploy the showcase first** (`apps/showcase`) so you have a URL.
2. **Deploy the docs**, setting `NEXT_PUBLIC_SHOWCASE_WEB_URL` to that URL.
3. Optional: custom domains (`appcn.vercel.app` → docs, `appcn-showcase.vercel.app` → showcase).

**Required env vars (docs project):**

| Variable | Value |
| :-- | :-- |
| `NEXT_PUBLIC_SHOWCASE_WEB_URL` | `https://<showcase-project>.vercel.app` |
| `NEXT_PUBLIC_EXPO_URL` | *(empty for v1 — needs EAS Update for the QR tab)* |
| `NEXT_PUBLIC_REGISTRY_URL` | `https://<docs-domain>/r` |

The showcase project needs no env vars. Defaults live in
[`apps/web/.env.example`](./apps/web/.env.example).

</details>

---

## Acknowledgments

Inspired by [shadcn/ui](https://ui.shadcn.com)'s copy-paste philosophy and
[react-native-reusables](https://www.reactnativereusables.com)'s
docs-site polish. Built on top of [NativeWind](https://www.nativewind.dev),
[Reanimated](https://docs.swmansion.com/react-native-reanimated/), and
[Expo](https://expo.dev).

---

## License

[MIT](./LICENSE) — you own the code.

<div align="center">
<sub>Made with care by <a href="https://github.com/Salah-XD">Salah-XD</a>.</sub>
<br />
<sub>Powered by <a href="https://www.shineup.digital"><b>Shineup</b></a> ↗</sub>
</div>
