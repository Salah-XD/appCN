# appCN

**Copy-paste mobile components for React Native + Expo.** A shadcn-philosophy
component library: you own the source, NativeWind styles, motion-first
defaults, and a featured AI-native collection (streaming bubbles, reasoning
traces, voice waveforms, prompt composers).

Distributed three ways:

- **`appcn` CLI** — recommended. Sets up NativeWind + Reanimated and pulls components.
- **shadcn CLI** — copy individual components straight in (no lock-in).
- **npm** — install the whole library as a managed dependency.

> Status: **v0.1.0 live on npm**. 5 components shipped, AI collection growing.

---

## Install

Pick whichever fits how you build:

```bash
# 1. (Recommended) One-shot project setup, then add components by slug
npx @app-cn/cli@latest init
npx @app-cn/cli@latest add button

# 2. Copy-paste a single component via shadcn (no setup, one-off)
npx shadcn@latest add https://appcn.vercel.app/r/button.json

# 3. Or pull the whole library as a managed dep
npm install @app-cn/ui
```

The CLI handles NativeWind + Reanimated wiring and registers the `@app-cn`
shadcn namespace for you — see [the CLI docs](https://appcn.vercel.app/docs/cli)
for the exact diff `init` produces. For paths (2) and (3) you'll need the
peer deps and the Tailwind preset — see `packages/ui/README.md`.

## What's in the box

| Component         | Category | Delight                                                     |
| ----------------- | -------- | ----------------------------------------------------------- |
| `Button`          | Base     | Spring-y press scale, no overshoot                          |
| `StreamBubble`    | AI       | Three-phase thinking → token stream → settle                |
| `PromptInput`     | AI       | Send morphs into a stop with a spinning ring                |
| `ReasoningTrace`  | AI       | Auto-collapses the instant the answer lands                 |
| `VoiceSphere`     | AI       | Reactive 3D orb that breathes with voice level              |

Browse the live catalog at <https://appcn.vercel.app/components> — every component
has a QR you can scan with Expo Go to see it run on your phone, an interactive
web preview, and a recorded video.

## Why appCN

- **Real-phone previews.** Scan a QR with Expo Go and the component runs live
  on your actual device with native gestures.
- **AI-native flagship.** The AI collection is the wedge — components built
  for AI apps that nobody else ships well.
- **Dual distribution.** Copy-paste via shadcn CLI for ownership, or install
  from npm for ergonomics. Same primitives.
- **Motion-first defaults.** Reanimated + gesture handler, shared motion
  tokens, one delight detail per component.
- **Dark-mode first.** Designed dark, then light — premium reads as depth,
  not rainbows.

## Documentation

- **[appcn.vercel.app/docs/cli](https://appcn.vercel.app/docs/cli)** — the
  `appcn` CLI: `init`, `add`, env vars, the idempotency contract.
- **[CLAUDE.md](./CLAUDE.md)** — architecture, monorepo map, commands, gotchas.
- **[DESIGN.md](./DESIGN.md)** — taste layer, motion rules, the component SOP.
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** — dev setup, the 8-step checklist
  for new components, the Changesets release flow.
- **[AGENTS.md](./AGENTS.md)** — guidance for AI coding agents working in this
  repo (read first if you're Claude, Cursor, Windsurf, Codex, Aider, …).

## Contributing

We welcome contributions! Every new component goes through the 7-step SOP in
[DESIGN.md → Component checklist](./DESIGN.md#component-checklist-sop). If
you're using an AI agent, invoke the `/new-component` skill — it walks the
checklist for you.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for dev setup and PR conventions.

## Deploying

The site ships as **two Vercel projects** from this monorepo — both deploy on
the same `git push`:

| Project   | Vercel root directory | What it serves                                              |
| --------- | --------------------- | ----------------------------------------------------------- |
| Docs      | `apps/web`            | Landing, `/components/*`, the shadcn registry at `/r/*.json` |
| Showcase  | `apps/showcase`       | Expo web export — the iframe target for the Web preview tab |

### Deploy order (matters)

1. **Deploy the showcase first** (`apps/showcase`) so you have a URL.
2. **Deploy the docs**, setting `NEXT_PUBLIC_SHOWCASE_WEB_URL` to the URL from step 1.
3. Optional: set custom domains (`appcn.vercel.app` → docs, `appcn-showcase.vercel.app` → showcase).

### Vercel project settings

For each project, in the Vercel dashboard:

- **Connect** the appCN GitHub repo.
- **Root Directory** → `apps/web` or `apps/showcase` (the only setting that
  matters — everything else comes from each project's `vercel.json`).
- **Install / Build / Output** — leave on defaults; `vercel.json` overrides them.

### Required environment variables (docs project)

Set in **Vercel → Project → Settings → Environment Variables**. See
[`apps/web/.env.example`](./apps/web/.env.example) for the canonical list.

| Variable                       | Value                                              |
| ------------------------------ | -------------------------------------------------- |
| `NEXT_PUBLIC_SHOWCASE_WEB_URL` | `https://<showcase-project>.vercel.app`            |
| `NEXT_PUBLIC_EXPO_URL`         | *(empty for v1 — needs EAS Update for the QR tab)* |
| `NEXT_PUBLIC_REGISTRY_URL`     | `https://<docs-domain>/r`                          |

The showcase project needs no env vars.

### CLI deploy (one-off)

If you'd rather skip the dashboard:

```bash
# Once per project
npm i -g vercel
cd apps/showcase && vercel --prod
cd ../web && vercel --prod
```

## License

[MIT](./LICENSE) — you own the code.
