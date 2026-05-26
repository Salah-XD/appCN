# appCN

**Copy-paste mobile components for React Native + Expo.** A shadcn-philosophy
component library: you own the source, NativeWind styles, motion-first
defaults, and a featured AI-native collection (streaming bubbles, reasoning
traces, voice waveforms, prompt composers).

Distributed two ways:

- **shadcn CLI** — copy individual components straight into your app.
- **npm** — install the whole library as a managed dependency.

> Status: **v0.1 early access**. 5 components shipped, more landing soon.

---

## Install

Pick whichever fits how you build:

```bash
# 1. Copy-paste a single component (no lock-in)
npx shadcn@latest add https://appcn.dev/r/button.json

# 2. Or pull the whole library as a managed dep
npm install @appcn/ui
```

You'll also need the peer deps and the Tailwind preset — see
`packages/ui/README.md` for the full setup.

## What's in the box

| Component         | Category | Delight                                                     |
| ----------------- | -------- | ----------------------------------------------------------- |
| `Button`          | Base     | Spring-y press scale, no overshoot                          |
| `StreamBubble`    | AI       | Three-phase thinking → token stream → settle                |
| `PromptInput`     | AI       | Send morphs into a stop with a spinning ring                |
| `ReasoningTrace`  | AI       | Auto-collapses the instant the answer lands                 |
| `VoiceWaveform`   | AI       | Breathes when idle, shifts hue to accent when listening     |

Browse the live catalog at <https://appcn.dev/components> — every component
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

- **[CLAUDE.md](./CLAUDE.md)** — architecture, monorepo map, commands, gotchas.
- **[DESIGN.md](./DESIGN.md)** — taste layer, motion rules, the component SOP.
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** — dev setup, the 7-step checklist
  for new components, release flow.
- **[AGENTS.md](./AGENTS.md)** — guidance for AI coding agents working in this
  repo (read first if you're Claude, Cursor, Windsurf, Codex, Aider, …).

## Contributing

We welcome contributions! Every new component goes through the 7-step SOP in
[DESIGN.md → Component checklist](./DESIGN.md#component-checklist-sop). If
you're using an AI agent, invoke the `/new-component` skill — it walks the
checklist for you.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for dev setup and PR conventions.

## License

[MIT](./LICENSE) — you own the code.
