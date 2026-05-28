# @app-cn/ui

[![npm](https://img.shields.io/npm/v/%40app-cn%2Fui)](https://www.npmjs.com/package/@app-cn/ui)
[![license](https://img.shields.io/npm/l/%40app-cn%2Fui)](./LICENSE)

**Copy-paste mobile components for React Native + Expo.** Motion-first,
dark-by-default, with a featured AI-native collection.

This package can be consumed two ways — pick whichever fits your project:

- **`npx shadcn add`** — copy the source straight into your repo. You own the
  code, zero lock-in.
- **`npm install @app-cn/ui`** — managed dependency. Same primitives, just
  imported.

Docs and live previews: <https://appcn.vercel.app>

---

## Install (managed dep)

```bash
npm install @app-cn/ui
# or
pnpm add @app-cn/ui
# or
yarn add @app-cn/ui
```

You'll also need the peer deps (which you almost certainly already have in
an Expo + NativeWind project):

```bash
npm install react react-native react-native-reanimated react-native-gesture-handler nativewind
# Optional — for haptics
npm install expo-haptics
```

### Configure NativeWind

Extend your `tailwind.config.js` with appCN's preset so the components'
classes resolve:

```js
const appcnPreset = require("@app-cn/ui/tailwind-preset");

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [appcnPreset],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./node_modules/@app-cn/ui/src/**/*.{ts,tsx}",
  ],
};
```

…and import the global CSS (defines the dark/light tokens) once at app
entry:

```ts
import "@app-cn/ui/global.css";
```

## Install (copy-paste via shadcn)

If you'd rather own the source, use the shadcn CLI against appCN's
registry:

```bash
# Single component (no setup)
npx shadcn@latest add https://appcn.vercel.app/r/button.json

# Or set up the namespaced form once in components.json
# and use:
npx shadcn@latest add @app-cn/stream-bubble
```

Each component pulls in its required helpers (`cn`, `motion`, `haptics`)
automatically via the shadcn registry's `registryDependencies`.

## Use

```tsx
import { Button, StreamBubble, PromptInput } from "@app-cn/ui";

export function Chat() {
  return (
    <>
      <StreamBubble content="Hey! Watch me think, then stream this reply." />
      <PromptInput onSubmit={(text) => console.log(text)} />
    </>
  );
}
```

## What's shipped (v0.1.0)

| Component         | Category | Delight                                                     |
| ----------------- | -------- | ----------------------------------------------------------- |
| `Button`          | Base     | Spring-y press scale, no overshoot                          |
| `StreamBubble`    | AI       | Three-phase thinking → token stream → settle                |
| `PromptInput`     | AI       | Send morphs into a stop with a spinning ring                |
| `ReasoningTrace`  | AI       | Auto-collapses the instant the answer lands                 |

Each one has full docs (anatomy, props table, examples, accessibility) at
<https://appcn.vercel.app/components/{slug}>, plus a QR you can scan with Expo Go
to run it live on your phone.

## License

[MIT](./LICENSE). You own the code.
