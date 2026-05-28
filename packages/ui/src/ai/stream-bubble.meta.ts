import type { ComponentMeta } from "../lib/meta";

export const meta: ComponentMeta = {
  slug: "stream-bubble",
  title: "Stream Bubble",
  category: "ai",
  description:
    "An assistant message that animates through thinking, token streaming, and a settled final state. The AI-native flagship.",
  anatomy:
    "A self-bounded chat bubble that owns three phases — `thinking` (staggered dots), `streaming` (token reveal + blinking caret), `done` (settled). Optional tool chips fade in above the message once thinking ends. Pair it with PromptInput and ReasoningTrace for a complete AI screen.",
  delight:
    "The phase transitions are physical — dots stagger by 150ms each, the caret blinks on its own rhythm, and a `replayKey` re-runs the whole sequence so the bubble can come back to life on demand.",
  props: [
    {
      name: "content",
      type: "string",
      required: true,
      description: "Full assistant message that streams in token-by-token.",
    },
    {
      name: "tools",
      type: "string[]",
      description: 'Optional "tool used" chips rendered above the message (e.g. "Searched the web").',
    },
    {
      name: "thinkingDuration",
      type: "number",
      default: "900",
      description: "How long the thinking dots show before streaming begins (ms).",
    },
    {
      name: "chunkSize",
      type: "number",
      default: "2",
      description: "Characters revealed per tick.",
    },
    {
      name: "speed",
      type: "number",
      default: "28",
      description: "Tick interval in ms — lower is faster.",
    },
    {
      name: "replayKey",
      type: "string | number",
      description: "Change this value to replay the animation from the start.",
    },
    {
      name: "className",
      type: "string",
      description: "Extra NativeWind classes merged onto the bubble container.",
    },
  ],
  examples: [
    {
      title: "Basic",
      description: "Content-only — thinks, streams, settles.",
      code: `<StreamBubble content="Hey! I'm appCN's streaming assistant bubble — watch me think, then stream, then settle." />`,
    },
    {
      title: "With tool chips",
      description: "Chips fade in once thinking ends, before the tokens start.",
      code: `<StreamBubble
  tools={["Searched the web", "Read 3 sources"]}
  content="Based on what I found, the short answer is yes — and here's why."
/>`,
    },
    {
      title: "Replayable",
      description: "Bump replayKey to re-run the full thinking→stream→done cycle.",
      code: `const [run, setRun] = React.useState(0);
return (
  <View className="gap-4">
    <StreamBubble replayKey={run} content="Tap replay to watch me do it again." />
    <Button variant="outline" onPress={() => setRun((r) => r + 1)}>Replay</Button>
  </View>
);`,
    },
  ],
  a11y: [
    'The bubble has `accessibilityRole="text"` so screen readers announce it as a single message.',
    "Honors `useReducedMotion()` — when set, the bubble snaps straight to the settled state instead of animating.",
    "The caret is decorative (no role); it's announced as part of the streaming text.",
    "Tool chips inherit their text as accessible content — no extra label needed.",
  ],
  addedAt: "2026-05-28",
};
