# AI Chat Block — Design Spec

- **Date:** 2026-05-30
- **Status:** Approved (brainstorming) → ready for implementation plan
- **Owner:** Salah-XD
- **Slug:** `chat` · **Package install:** `@app-cn/chat` · **Collection:** `ai`
- **Source:** `packages/ui/src/ai/chat.tsx`

## 1. Summary & positioning

The flagship **AI chat block**: a complete, drop-in, animated chat experience for React
Native / Expo. It is built as a **composite `ai/` component** (not a separate registry
"blocks" tier) that **composes the existing AI primitives** — `StreamBubble`,
`PromptInput`, `ReasoningTrace` — into one ready-to-use screen.

It is **marketed/presented** as "the AI chat block" — the hero entry in a Blocks/Featured
section of the docs + landing — without introducing a separate registry type. A formal
Blocks tier is deferred until there are 3–4 blocks to justify the plumbing. Rationale: the
marketing win is the *artifact + preview/video*, not the registry tier; shipping a composite
component captures ~95% of that value at a fraction of the effort and keeps everything DRY.

## 2. Decision log (locked during brainstorming)

1. **Tier:** composite `ai/` component, branded as a "block". No new registry tier yet.
2. **Data model:** controlled shell — `messages[]` + `onSendMessage` + `generating`. Parent
   owns state. The showcase demo supplies a scripted assistant so the preview is alive.
3. **Core v1:** scrollable message list (user right, assistant via `StreamBubble` left),
   docked `PromptInput` composer, thinking→stream on assistant, auto-scroll, empty state.
4. **Optional features (all in):** starter prompts, scroll-to-bottom pill, inline
   `ReasoningTrace`, message actions (copy / regenerate).
5. **"Make it real" additions (all in):** keyboard + safe-area aware composer, stop
   generation, error + retry, completion haptic + settle.
6. **Layout:** thin premium **default header**, with the **header as a slot** —
   `header` default = `ChatHeader`; `header={null}` = immersive; `header={<Custom/>}` =
   fully-branded showpiece.
7. **Signature delight detail:** **magnetic stream-follow** (see §7).
8. **Out of scope v1:** voice (`voice-sphere`), attachments, markdown rendering,
   multi-conversation/history, message editing, day separators.

## 3. Architecture — units

One self-contained `chat.tsx`. Each unit has one clear purpose:

- **`Chat`** — orchestrator. Owns the layout (header slot, scroll area, composer, empty
  state, pill) and the stick-to-bottom behavior. Exported.
- **`ChatHeader`** (internal) — thin premium bar: avatar + subtle ring, `title` + live
  `status`, one `＋` action (`onNewChat`). Used only when `header` is undefined.
- **`UserBubble`** (internal) — right-aligned accent bubble. New: the primitives have no
  user bubble. Mirrors `StreamBubble`'s visual language (radius, depth) on the accent side.
- **`AssistantMessage`** (internal) — renders one assistant turn by `status`:
  `thinking`/`streaming`/`done` → `StreamBubble`; `error` → error bubble + retry. Hosts the
  optional `ReasoningTrace` (above the bubble) and the message actions row.
- **`StarterPrompts`** (internal) — empty-state suggested-prompt chips; tap → `onSendMessage`.
- **`ScrollToBottomPill`** (internal) — appears when scrolled up; live unread pulse; tap →
  spring to bottom with soft overshoot.
- **`MessageActions`** (internal) — copy / regenerate row on assistant messages.
- **`useStickToBottom`** (internal hook or inline) — the magnetic-follow logic (§7).

**Reused via registry dependencies:** `StreamBubble`, `PromptInput`, `ReasoningTrace`,
plus `cn`, `motion`, `haptics`.

## 4. Data model

```ts
export type ChatRole = "user" | "assistant";
export type ChatStatus = "thinking" | "streaming" | "done" | "error";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  /** assistant-only; default "done". Drives StreamBubble phase / error rendering. */
  status?: ChatStatus;
  /** assistant-only; collapsible chain-of-thought (ReasoningTrace). */
  reasoning?: string;
  /** assistant-only; tool chips shown above the message (StreamBubble `tools`). */
  tools?: string[];
}

export interface ChatProps {
  messages: ChatMessage[];
  /** Called with the trimmed text when the user sends. */
  onSendMessage: (text: string) => void;
  /** While true, composer shows the stop control. */
  generating?: boolean;
  onStop?: () => void;
  /** Retry a failed (status: "error") assistant message. */
  onRetry?: (id: string) => void;
  /** Regenerate an assistant message from the message-actions row. */
  onRegenerate?: (id: string) => void;
  /** Empty-state starter chips; tapping a chip calls onSendMessage(text). */
  starters?: string[];
  placeholder?: string;
  /** Header slot. undefined → <ChatHeader>; null → no header; node → custom. */
  header?: React.ReactNode;
  /** Feed the default ChatHeader. `statusLabel` is the display string under the
   *  title (e.g. "Ready" / "Thinking…") — distinct from a message's ChatStatus. */
  title?: string;
  statusLabel?: string;
  avatar?: React.ReactNode;
  onNewChat?: () => void;
  /** Override the empty state entirely. */
  emptyState?: React.ReactNode;
  className?: string;
}
```

Controlled only. The parent appends the user message and the assistant message(s) and
advances `status` (`thinking` → `streaming` → `done` / `error`). v1 uses `StreamBubble`'s
**simulated** streaming (the signature look): set `status: "streaming"` with the full
`content` and the bubble animates it in. Real token-by-token streaming (consumer grows
`content`) is a documented pattern, not the default path.

## 5. Behavior & states

- **Empty:** `messages` empty → `emptyState` or the default (greeting + `StarterPrompts`).
- **User send:** composer `onSubmit` → `onSendMessage(trimmed)`; composer clears (its own
  uncontrolled behavior); list sticks to bottom.
- **Assistant active (thinking/streaming):** the **latest** assistant message renders an
  **animating** `StreamBubble` that self-drives thinking→stream→done from its `content`
  (keyed by `replayKey = message.id`). The parent provides `content`; the block keeps a
  persistent thinking indicator until `content` is non-empty, so "thinking" holds for as long
  as `status === "thinking"` rather than `StreamBubble`'s fixed `thinkingDuration`. The list
  magnetically follows (§7).
- **Assistant done:** historical assistant messages render a **non-animating** `StreamBubble`
  (`animate={false}`, see §6) so they never re-run thinking/stream on scroll/re-render.
  Completion fires `haptic.success()` + settle-glow.
- **Error:** `status: "error"` → error bubble with an inline "Couldn't generate — Retry"
  affordance → `onRetry(id)`.
- **Generating:** `generating` → `PromptInput` shows the stop control → `onStop()`.

## 6. Required existing-code change: `StreamBubble.animate`

`StreamBubble` currently always self-animates thinking→stream→done from `content`. The chat
block needs settled historical messages to render instantly without re-animating. Add a
**backward-compatible** prop:

- `animate?: boolean` — default `true` (preserves all current behavior). When `false`, the
  bubble jumps straight to the settled "done" state (full content, tool chips, no thinking
  indicator, no caret, no settle pulse).

Implementation: in the `useEffect` that sets phase, treat `animate === false` like the
`useReducedMotion()` branch (set `phase = "done"`, `shown = content.length`). No API break.
Ships as a `@app-cn/ui` **patch** in the same release; `stream-bubble.meta.ts` gains the new
prop doc; registry entry unchanged.

## 7. Delight detail — magnetic stream-follow

Named in the `chat.tsx` header doc comment. Behavior over a **ScrollView**:

- A `useStickToBottom` flag tracks whether the user is pinned to the latest message.
- While streaming (content growing / new messages), if pinned, the list **eases** to keep
  the newest line in view (Reanimated-driven `scrollTo`, not a hard jump).
- If the user scrolls up, the follow **releases** and the **scroll-to-bottom pill** appears
  with a live unread pulse; tapping springs to bottom with a soft overshoot (`spring.gentle`).
- Honors `useReducedMotion()` → falls back to instant `scrollToEnd`, no overshoot.
- **ScrollView vs FlatList:** ScrollView chosen for full motion control + Reanimated entering
  on bubbles; fine for chat-sized histories. Documented note: swap to a windowed list for
  very long logs (future).

## 8. Accessibility (per DESIGN.md, non-negotiable)

- Composer, send/stop, pill, starter chips, message actions: `accessibilityRole`,
  `accessibilityLabel`, `accessibilityState` (disabled/expanded), `hitSlop`, ≥44pt targets,
  visible press feedback.
- Message list is a logical reading order; assistant bubbles `accessibilityRole="text"`.
- Status changes (thinking/streaming/done/error) communicated via labels, not color alone.
- Reduced motion honored throughout (follow, pill, settle).

## 9. Dependencies

- **npm:** `react-native-reanimated`, `react-native-safe-area-context`, `expo-clipboard`.
- **registry (`registryDependencies`):** `@app-cn/cn`, `@app-cn/motion`, `@app-cn/haptics`,
  `@app-cn/stream-bubble`, `@app-cn/prompt-input`, `@app-cn/reasoning-trace`.
- Installing `@app-cn/chat` pulls the whole AI collection — intentional "wow".

## 10. Styling / theming

Block container + header + user bubble + composer use **NativeWind theme tokens**
(`bg-background`, `bg-card`, `border-border`, `text-foreground`, `bg-primary`), matching
`PromptInput`. Assistant `StreamBubble` keeps its self-contained dark tokens (unchanged).
Dark-mode first; one accent. No inline hex outside the small glyph-trick exceptions the
primitives already use.

## 11. SOP, file checklist & release plan

Build on a feature branch following the 8-step component SOP, plus the stream-bubble patch:

1. `packages/ui/src/ai/chat.tsx` (+ the `StreamBubble.animate` patch in `stream-bubble.tsx`).
2. `packages/ui/src/ai/chat.meta.ts` (and update `stream-bubble.meta.ts` for `animate`).
3. `packages/ui/src/index.ts` — export `Chat`, `ChatProps`, `ChatMessage`, `ChatRole`,
   `ChatStatus`, `chatMeta`.
4. `apps/showcase/lib/demos.tsx` — `chat` demo with a scripted assistant (alive preview).
5. `apps/web/lib/registry.ts` — `chat` entry.
6. `apps/web/registry.json` — `chat` item with deps (§9) and registryDependencies.
7. Verify: `pnpm typecheck && pnpm registry:build`; `/c/chat` reachable in showcase;
   `/components/chat` renders all docs sections.
8. Changeset: **`@app-cn/ui` minor** (new component; stream-bubble patch rides along).

Release: PR → merge → Changesets "Version Packages" PR → merge → auto-publish to npm +
Official MCP Registry (pipeline proven on 0.1.2). Glama follows on its next crawl.

## 12. Risks & notes

- **`status` → `StreamBubble` mapping (key integration detail):** the plan must pin down the
  three render paths cleanly — `done`/historical → `animate={false}` settled bubble;
  `error` → error bubble + retry; latest active → animating `StreamBubble` self-driving from
  `content` with a persistent thinking hold until the first token. Getting this mapping right
  (no re-animation on scroll, no premature "done" on empty content) is the main implementation
  risk and should be its own task with a focused test/demo.
- **Simulated vs real streaming:** v1 standardizes on `StreamBubble`'s simulated streaming
  (the signature look). Real token streaming is documented but not the default; revisit if
  consumers need raw-token control (would lean on `animate={false}` + external content growth).
- **Web-preview parity:** the magnetic-follow + pill must degrade gracefully in the iframed
  Expo-web preview; motion-heavy follow is acceptable to soften on web (phone is the source
  of truth, per project notes).
- **ScrollView scale:** fine for demo/typical chats; documented swap for very long histories.

## 13. Out of scope (v1)

Voice (`voice-sphere`), attachments, markdown rendering, multi-conversation/history,
message editing, day/time separators. All clean future additions.
