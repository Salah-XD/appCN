import type { ComponentMeta } from "../lib/meta";

export const meta: ComponentMeta = {
  slug: "reasoning-trace",
  title: "Reasoning Trace",
  category: "ai",
  description:
    "A collapsible chain-of-thought panel. Shimmers while thinking, then collapses itself the instant the answer lands.",
  anatomy:
    "An expandable card with a pressable header (label + animated chevron) and an animated body. The body's height is driven by a measured layout value so the panel can grow with streaming reasoning without jumping. While thinking, a soft light streak sweeps across the body — the universal signal for 'work in progress'.",
  delight:
    "When `thinking` flips false, the panel auto-collapses its own height (unless the user manually toggled it open) — the trace gets out of the way the moment the answer is ready, so the user doesn't have to do it themselves.",
  props: [
    {
      name: "reasoning",
      type: "string",
      required: true,
      description: "The chain-of-thought text. Can stream in while `thinking` is true.",
    },
    {
      name: "thinking",
      type: "boolean",
      default: "false",
      description:
        "Whether the model is still reasoning. When it flips false, the panel auto-collapses (unless the user toggled it).",
    },
    {
      name: "label",
      type: "string",
      description: 'Header label override. Defaults to "Thinking…" / "Thought for Ns".',
    },
    {
      name: "expanded",
      type: "boolean",
      description: "Controlled expanded state. Omit to use uncontrolled mode.",
    },
    {
      name: "defaultExpanded",
      type: "boolean",
      default: "false",
      description:
        "Initial expanded state in uncontrolled mode. The panel auto-expands while `thinking` regardless.",
    },
    {
      name: "onExpandedChange",
      type: "(expanded: boolean) => void",
      description: "Fires when the panel opens or closes (user tap or auto-collapse).",
    },
    {
      name: "autoCollapse",
      type: "boolean",
      default: "true",
      description:
        "When true, the panel collapses itself the instant `thinking` flips from true to false. The user can override by tapping the header.",
    },
    {
      name: "className",
      type: "string",
      description: "Extra NativeWind classes merged onto the outer card.",
    },
  ],
  examples: [
    {
      title: "Streaming with auto-collapse",
      description:
        "Hand the panel reasoning as it streams. When `thinking` flips false, it collapses on its own.",
      code: `const [thinking, setThinking] = React.useState(true);
const [reasoning, setReasoning] = React.useState("");

React.useEffect(() => {
  const FULL = "The user wants a concise answer. Lead with the recommendation…";
  let i = 0;
  const id = setInterval(() => {
    i += 3;
    setReasoning(FULL.slice(0, i));
    if (i >= FULL.length) {
      clearInterval(id);
      setTimeout(() => setThinking(false), 700);
    }
  }, 28);
  return () => clearInterval(id);
}, []);

return <ReasoningTrace reasoning={reasoning} thinking={thinking} />;`,
    },
    {
      title: "Manually controlled",
      description: "Drive expanded yourself if you need to coordinate with surrounding UI.",
      code: `const [expanded, setExpanded] = React.useState(false);
return (
  <ReasoningTrace
    reasoning="I considered three options and went with the simplest…"
    expanded={expanded}
    onExpandedChange={setExpanded}
  />
);`,
    },
  ],
  a11y: [
    "The header is a button with `accessibilityState.expanded` so VoiceOver announces the open/closed state.",
    "`accessibilityLabel` mirrors the visible header text (`Thinking…` / `Thought for Ns`).",
    "Tapping the header fires `haptic.selection()` — a crisp detent tick that grounds the toggle.",
    "Honors `useReducedMotion()` — the height animation, shimmer, and chevron rotation all short-circuit to instant.",
  ],
  addedAt: "2026-05-28",
};
