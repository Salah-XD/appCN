/**
 * appCN component metadata schema — the typed SOP every component must satisfy.
 *
 * Each component ships a colocated `<slug>.meta.ts` exporting `meta: ComponentMeta`.
 * The web docs renderer reads these and renders Anatomy / Delight / Props /
 * Examples / A11y sections from them, so a component literally cannot ship
 * docs unless its meta is filled in. See DESIGN.md → "Component checklist (SOP)".
 *
 * This file is also the web-safe meta entry point: the docs site imports the
 * filled-in metas from here via `@appcn/ui/lib/meta` (no RN code involved).
 */

export interface PropDoc {
  /** Prop name as it appears in the component's interface. */
  name: string;
  /** TypeScript type, as a short readable string (e.g. `"boolean"`, `"(text: string) => void"`). */
  type: string;
  /** Stringified default value, if any (e.g. `"false"`, `'"Message…"'`). */
  default?: string;
  /** True when the prop has no default and the caller must provide it. */
  required?: boolean;
  /** One-line description. Mirror the TSDoc on the prop where it exists. */
  description: string;
}

export interface ExampleDoc {
  /** Section heading shown above the snippet (e.g. "Basic", "Generating"). */
  title: string;
  /** Optional sentence rendered under the heading. */
  description?: string;
  /** A copy-paste-runnable snippet. Keep it self-contained — no off-screen imports. */
  code: string;
}

export interface ComponentMeta {
  /** Kebab-case slug — matches file name, registry name, and route. */
  slug: string;
  /** Title cased name (e.g. "Stream Bubble"). */
  title: string;
  /** "base" for the broad mobile library, "ai" for the featured AI collection. */
  category: "base" | "ai";
  /** One-line description used in cards, headers, and meta tags. */
  description: string;
  /** 2–4 sentences: what the component is made of and when to reach for it. */
  anatomy: string;
  /** The one non-obvious motion / feedback / behavior that earns its keep. */
  delight: string;
  /** Every public prop, in the order it appears in the component's interface. */
  props: PropDoc[];
  /** At least two examples — first one is the canonical demo. */
  examples: ExampleDoc[];
  /** Bullets covering screen-reader labels, hit targets, reduced-motion, etc. */
  a11y: string[];
}

/* --- Filled-in metas for every appCN component, re-exported for web docs. --- */
export { meta as buttonMeta } from "../components/button.meta";
export { meta as streamBubbleMeta } from "../ai/stream-bubble.meta";
export { meta as promptInputMeta } from "../ai/prompt-input.meta";
export { meta as voiceWaveformMeta } from "../ai/voice-waveform.meta";
export { meta as reasoningTraceMeta } from "../ai/reasoning-trace.meta";
