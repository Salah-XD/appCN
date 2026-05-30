import type { ComponentMeta } from "../lib/meta";

export const meta: ComponentMeta = {
  slug: "chat",
  title: "Chat",
  category: "ai",
  description:
    "The AI chat block — a complete, drop-in conversation: streaming assistant bubbles, a docked composer, reasoning, and starter prompts.",
  anatomy:
    "A full chat screen that composes StreamBubble (assistant turns), PromptInput (the composer), and ReasoningTrace (inline chain-of-thought) over a scrolling message list with user bubbles. Controlled by `messages` + `onSendMessage`. The header is a slot — default thin bar, `null` for immersive, or your own node. Reach for it when you want a finished AI chat instead of wiring the primitives by hand.",
  delight:
    "Magnetic stream-follow — while the assistant streams, the list eases to keep the newest line in view and releases the moment you scroll up; a scroll-to-bottom pill springs you back with a soft overshoot, and a success haptic fires the instant a reply settles.",
  props: [
    { name: "messages", type: "ChatMessage[]", required: true, description: "The conversation. Each message has id, role, content, and (assistant-only) status/reasoning/tools." },
    { name: "onSendMessage", type: "(text: string) => void", required: true, description: "Called with the trimmed text when the user sends." },
    { name: "generating", type: "boolean", default: "false", description: "While true, the composer shows the stop control." },
    { name: "onStop", type: "() => void", description: "Called when the user taps stop while generating." },
    { name: "onRetry", type: "(id: string) => void", description: "Retry a failed (status: \"error\") assistant message." },
    { name: "onRegenerate", type: "(id: string) => void", description: "Regenerate an assistant message from its actions row." },
    { name: "starters", type: "string[]", description: "Empty-state suggested prompts; tapping one calls onSendMessage." },
    { name: "placeholder", type: "string", default: '"Message appCN…"', description: "Composer placeholder." },
    { name: "header", type: "React.ReactNode", description: "Header slot. undefined → default thin header; null → no header; node → custom." },
    { name: "title", type: "string", default: '"appCN"', description: "Title shown in the default header and empty state." },
    { name: "statusLabel", type: "string", description: "Status line under the title in the default header (e.g. \"Ready\")." },
    { name: "avatar", type: "React.ReactNode", description: "Avatar content for the default header disc." },
    { name: "onNewChat", type: "() => void", description: "When provided, the default header shows a + action that calls this." },
    { name: "emptyState", type: "React.ReactNode", description: "Override the default empty state entirely." },
    { name: "className", type: "string", description: "Extra NativeWind classes on the root container." },
  ],
  examples: [
    {
      title: "Basic",
      description: "A controlled chat. You own the messages and append the assistant's reply.",
      code: `const [messages, setMessages] = React.useState<ChatMessage[]>([]);
const [generating, setGenerating] = React.useState(false);

const send = (text: string) => {
  setMessages((m) => [...m, { id: \`u\${Date.now()}\`, role: "user", content: text }]);
  setGenerating(true);
  const id = \`a\${Date.now()}\`;
  setMessages((m) => [...m, { id, role: "assistant", content: "Sure — here's the answer.", status: "streaming" }]);
  setTimeout(() => {
    setMessages((m) => m.map((x) => (x.id === id ? { ...x, status: "done" } : x)));
    setGenerating(false);
  }, 1800);
};

return (
  <Chat
    messages={messages}
    generating={generating}
    onSendMessage={send}
    starters={["What can you build?", "Show me a button", "Explain reanimated"]}
  />
);`,
    },
    {
      title: "Immersive (no header)",
      description: "Pass header={null} for an edge-to-edge, chrome-free conversation.",
      code: `<Chat header={null} messages={messages} onSendMessage={send} />`,
    },
  ],
  a11y: [
    "Every control (composer, send/stop, starter chips, scroll-to-bottom pill, copy/regenerate, retry) has an accessibilityRole and label, hitSlop, and visible press feedback.",
    "Bubbles use accessibilityRole=\"text\" so each message is announced as one unit.",
    "Status (thinking/streaming/done/error) is conveyed by labels and text, never color alone.",
    "Honors useReducedMotion() — entrance animations and the magnetic follow fall back to instant positioning.",
    "The composer rises above the keyboard (KeyboardAvoidingView) and respects the home indicator via safe-area insets.",
  ],
  addedAt: "2026-05-30",
};
