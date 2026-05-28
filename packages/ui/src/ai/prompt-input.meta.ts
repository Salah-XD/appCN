import type { ComponentMeta } from "../lib/meta";

export const meta: ComponentMeta = {
  slug: "prompt-input",
  title: "Prompt Input",
  category: "ai",
  description:
    "The AI composer. Auto-grows with content, holds attachment chips, and morphs its send button into a stop with a spinning ring while generating.",
  anatomy:
    "A rounded card containing an optional row of attachment chips, an auto-growing multiline TextInput, and a circular send button. The send button is the affordance: it animates between three states (disabled, ready, generating) and is the canonical control surface for AI chat composers.",
  delight:
    "The send glyph cross-fades into a stop square the moment generation starts, with a 2px progress ring spinning at 900ms/turn wrapped around it — one element doing the work of three.",
  props: [
    {
      name: "value",
      type: "string",
      description: "Controlled text value. Omit to use uncontrolled mode.",
    },
    {
      name: "defaultValue",
      type: "string",
      description: "Initial text in uncontrolled mode.",
    },
    {
      name: "onChangeText",
      type: "(text: string) => void",
      description: "Fires on every keystroke.",
    },
    {
      name: "onSubmit",
      type: "(text: string) => void",
      description: "Called with the trimmed message when the send button is tapped.",
    },
    {
      name: "onStop",
      type: "() => void",
      description: "Called when the user taps the stop button while `generating` is true.",
    },
    {
      name: "generating",
      type: "boolean",
      default: "false",
      description: "When true, the send button morphs into a stop with a spinning ring.",
    },
    {
      name: "placeholder",
      type: "string",
      default: '"Message appCN…"',
      description: "TextInput placeholder.",
    },
    {
      name: "minHeight",
      type: "number",
      default: "24",
      description: "Minimum input height in px before auto-grow kicks in.",
    },
    {
      name: "maxHeight",
      type: "number",
      default: "140",
      description: "Maximum height the input will grow to before scrolling.",
    },
    {
      name: "attachments",
      type: "PromptAttachment[]",
      description: "Chips rendered above the input. Each is `{ id, label }`.",
    },
    {
      name: "onAddAttachment",
      type: "() => void",
      description: 'When provided, a leading "+" button appears that calls this on tap.',
    },
    {
      name: "onRemoveAttachment",
      type: "(id: string) => void",
      description: 'When provided, each chip renders a small "×" that calls this with its id.',
    },
    {
      name: "disabled",
      type: "boolean",
      default: "false",
      description: "Greys out the whole composer and disables all controls.",
    },
    {
      name: "className",
      type: "string",
      description: "Extra NativeWind classes merged onto the outer container.",
    },
  ],
  examples: [
    {
      title: "Basic",
      description: "Uncontrolled — clears itself on submit.",
      code: `<PromptInput onSubmit={(text) => sendMessage(text)} />`,
    },
    {
      title: "Generating + stop",
      description: "Flip `generating` to morph send into stop. `onStop` cancels the request.",
      code: `const [generating, setGenerating] = React.useState(false);
return (
  <PromptInput
    generating={generating}
    onSubmit={async (text) => {
      setGenerating(true);
      await fetchReply(text);
      setGenerating(false);
    }}
    onStop={() => cancelInFlight()}
  />
);`,
    },
    {
      title: "With attachments",
      description: 'A "+" button appears when `onAddAttachment` is provided; chips animate in and out.',
      code: `const [files, setFiles] = React.useState<PromptAttachment[]>([]);
return (
  <PromptInput
    attachments={files}
    onAddAttachment={() => pickFile().then((f) => setFiles((a) => [...a, f]))}
    onRemoveAttachment={(id) => setFiles((a) => a.filter((f) => f.id !== id))}
    onSubmit={(text) => sendMessage(text, files)}
  />
);`,
    },
  ],
  a11y: [
    "The send button's `accessibilityLabel` dynamically swaps between “Send message” and “Stop generating” — VoiceOver announces the current affordance.",
    "`accessibilityState.disabled` reflects whether the button is actionable (empty input + not generating = disabled).",
    "Attachment remove buttons use `accessibilityLabel={`Remove ${label}`}` so each chip is uniquely addressable.",
    "Honors `useReducedMotion()` — the send-to-stop morph and ring spin both short-circuit when reduced motion is on.",
    "Hit slop is 8px on all small icon buttons (send, attachment-remove) so they meet ≥44pt targets.",
  ],
  addedAt: "2026-05-28",
};
