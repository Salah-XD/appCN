# AI Chat Block Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `@app-cn/chat` — a complete, drop-in AI chat block for React Native / Expo that composes the existing `StreamBubble`, `PromptInput`, and `ReasoningTrace` primitives into one screen, branded as appCN's flagship "AI chat block."

**Architecture:** One self-contained `packages/ui/src/ai/chat.tsx` exporting a controlled `Chat` component (`messages[]` + `onSendMessage` + `generating`). It reuses the primitives via registry dependencies. A tiny backward-compatible `animate?: boolean` prop is added to `StreamBubble` so settled/historical messages render without re-animating. The signature delight is **magnetic stream-follow** (the list eases to follow the stream and releases on scroll-up, with a spring-back scroll-to-bottom pill).

**Tech Stack:** React Native, NativeWind v4 (className), `react-native-reanimated`, `react-native-safe-area-context`, `expo-clipboard`, the appCN `motion`/`haptics` tokens.

**Spec:** `docs/superpowers/specs/2026-05-30-ai-chat-block-design.md`.

---

## Testing approach (read first)

This repo has **no unit-test runner** for components and forbids splitting a component's logic into separately-shipped modules (copy-paste portability — see `DESIGN.md` and `CLAUDE.md`). Per the project's established SOP, **verification = typecheck + registry build + visual render in the showcase**, not jest/vitest. So each task's "test" step is a real, codebase-appropriate check:

- `pnpm --filter @app-cn/ui typecheck` (and full `pnpm typecheck`) must pass.
- `pnpm registry:build` must stay clean.
- The component must render and behave correctly at `/c/chat` in the showcase and `/components/chat` on the web docs.

Do **not** add a test framework — it would violate the established pattern. Where this plan says "verify," run the exact command shown and confirm the stated expected result before committing.

**Prerequisite:** Work on branch `feat/ai-chat-block` (already created; the spec is committed there). Run `git branch --show-current` and confirm it prints `feat/ai-chat-block` before starting.

---

## Task 1: Add `StreamBubble.animate` (settled render)

Lets the chat block render historical/settled assistant messages without re-running the thinking/stream animation. Fully backward-compatible (`animate` defaults to `true`).

**Files:**
- Modify: `packages/ui/src/ai/stream-bubble.tsx`
- Modify: `packages/ui/src/ai/stream-bubble.meta.ts`

- [ ] **Step 1: Add the `animate` prop to the interface**

In `packages/ui/src/ai/stream-bubble.tsx`, add to `StreamBubbleProps` (after `replayKey`, before `className`):

```ts
  /** Change this value to replay the animation from the start. */
  replayKey?: string | number;
  /**
   * When false, the bubble renders its settled "done" state immediately — no
   * thinking dots, no token reveal, no settle pulse. Use for already-finished
   * messages (e.g. chat history) so they don't re-animate on mount/scroll.
   */
  animate?: boolean;
  className?: string;
```

- [ ] **Step 2: Destructure `animate` with a default**

In the `StreamBubble` function params, add `animate = true` (after `replayKey`):

```ts
  replayKey,
  animate = true,
  className,
}: StreamBubbleProps) {
```

- [ ] **Step 3: Honor `animate === false` in the phase effect**

Replace the first phase `useEffect` (currently guarded by `if (reduced)`) so it also short-circuits when `animate` is false, and add `animate` to the dependency array:

```ts
  React.useEffect(() => {
    if (reduced || !animate) {
      setPhase("done");
      setShown(content.length);
      return;
    }
    setPhase("thinking");
    setShown(0);
    const t = setTimeout(() => setPhase("streaming"), thinkingDuration);
    return () => clearTimeout(t);
  }, [content, thinkingDuration, replayKey, reduced, animate]);
```

- [ ] **Step 4: Document the prop in the meta**

In `packages/ui/src/ai/stream-bubble.meta.ts`, add this entry to `props` immediately after the `replayKey` entry:

```ts
    {
      name: "animate",
      type: "boolean",
      default: "true",
      description:
        "When false, the bubble renders its settled final state immediately — no thinking, stream, or settle. Use for already-finished messages so they don't re-animate.",
    },
```

Then add an `updatedAt` field at the end of the meta object (after `addedAt`):

```ts
  addedAt: "2026-05-28",
  updatedAt: "2026-05-30",
};
```

- [ ] **Step 5: Verify typecheck**

Run: `pnpm --filter @app-cn/ui typecheck`
Expected: PASS (no errors).

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/ai/stream-bubble.tsx packages/ui/src/ai/stream-bubble.meta.ts
git commit -m "feat(stream-bubble): add animate prop for settled render"
```

---

## Task 2: Create the `Chat` component

The whole block in one self-contained file. Build it in steps, then typecheck and render.

**Files:**
- Create: `packages/ui/src/ai/chat.tsx`

- [ ] **Step 1: Write the full component file**

Create `packages/ui/src/ai/chat.tsx` with exactly this content:

```tsx
import * as React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  useReducedMotion,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Clipboard from "expo-clipboard";

import { cn } from "../lib/cn";
import { duration, easing, spring, PRESS_SCALE } from "../lib/motion";
import { haptic } from "../lib/haptics";
import { StreamBubble } from "./stream-bubble";
import { PromptInput } from "./prompt-input";
import { ReasoningTrace } from "./reasoning-trace";

export type ChatRole = "user" | "assistant";
export type ChatStatus = "thinking" | "streaming" | "done" | "error";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  /** assistant-only; default "done". */
  status?: ChatStatus;
  /** assistant-only; collapsible chain-of-thought. */
  reasoning?: string;
  /** assistant-only; tool chips above the message. */
  tools?: string[];
}

export interface ChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  generating?: boolean;
  onStop?: () => void;
  onRetry?: (id: string) => void;
  onRegenerate?: (id: string) => void;
  starters?: string[];
  placeholder?: string;
  /** Header slot. undefined → default header; null → none; node → custom. */
  header?: React.ReactNode;
  title?: string;
  statusLabel?: string;
  avatar?: React.ReactNode;
  onNewChat?: () => void;
  emptyState?: React.ReactNode;
  className?: string;
}

/**
 * appCN Chat — the AI chat block. A complete, drop-in conversation: a scrolling
 * message list (user bubbles + streaming assistant bubbles via StreamBubble), a
 * docked PromptInput composer, thinking/streaming/error states, empty-state
 * starter prompts, inline ReasoningTrace, and per-message actions.
 *
 * Delight detail: MAGNETIC STREAM-FOLLOW — while the assistant streams, the list
 * eases to keep the newest line in view and releases the instant you scroll up;
 * a scroll-to-bottom pill springs you back with a soft overshoot.
 */
export function Chat({
  messages,
  onSendMessage,
  generating = false,
  onStop,
  onRetry,
  onRegenerate,
  starters,
  placeholder = "Message appCN…",
  header,
  title = "appCN",
  statusLabel,
  avatar,
  onNewChat,
  emptyState,
  className,
}: ChatProps) {
  const reduced = useReducedMotion();
  const insets = useSafeAreaInsets();
  const scrollRef = React.useRef<ScrollView>(null);
  const atBottomRef = React.useRef(true);
  const [showPill, setShowPill] = React.useState(false);

  const isEmpty = messages.length === 0;
  const lastAssistantId = React.useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "assistant") return messages[i].id;
    }
    return null;
  }, [messages]);

  const scrollToBottom = React.useCallback(
    (animated = true) => {
      scrollRef.current?.scrollToEnd({ animated: animated && !reduced });
    },
    [reduced]
  );

  // Magnetic follow: only auto-scroll when the user is pinned to the bottom.
  const onContentSizeChange = React.useCallback(() => {
    if (atBottomRef.current) scrollToBottom(true);
  }, [scrollToBottom]);

  const onScroll = React.useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
      const distance =
        contentSize.height - (contentOffset.y + layoutMeasurement.height);
      const atBottom = distance < 24;
      atBottomRef.current = atBottom;
      setShowPill(!atBottom && contentSize.height > layoutMeasurement.height);
    },
    []
  );

  // Completion haptic: fire success the moment the latest assistant settles.
  const prevStatus = React.useRef<ChatStatus | undefined>(undefined);
  React.useEffect(() => {
    const last = messages[messages.length - 1];
    const status = last?.role === "assistant" ? last.status ?? "done" : undefined;
    if (prevStatus.current === "streaming" && status === "done") {
      haptic.success();
    }
    prevStatus.current = status;
  }, [messages]);

  const headerEl =
    header === undefined ? (
      <ChatHeader
        title={title}
        statusLabel={statusLabel ?? (generating ? "Thinking…" : "Ready")}
        avatar={avatar}
        onNewChat={onNewChat}
        topInset={insets.top}
      />
    ) : (
      header
    );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className={cn("flex-1 bg-background", className)}
    >
      {headerEl}

      <View className="flex-1">
        {isEmpty ? (
          emptyState ?? (
            <EmptyState
              title={title}
              starters={starters}
              onPick={onSendMessage}
            />
          )
        ) : (
          <ScrollView
            ref={scrollRef}
            onScroll={onScroll}
            onContentSizeChange={onContentSizeChange}
            scrollEventThrottle={16}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              padding: 14,
              gap: 12,
              flexGrow: 1,
              justifyContent: "flex-end",
            }}
          >
            {messages.map((m) =>
              m.role === "user" ? (
                <UserBubble key={m.id} content={m.content} reduced={reduced} />
              ) : (
                <AssistantMessage
                  key={m.id}
                  message={m}
                  isLatest={m.id === lastAssistantId}
                  onRetry={onRetry}
                  onRegenerate={onRegenerate}
                  reduced={reduced}
                />
              )
            )}
          </ScrollView>
        )}

        {showPill ? (
          <ScrollToBottomPill onPress={() => scrollToBottom(true)} reduced={reduced} />
        ) : null}
      </View>

      <View
        className="border-t border-border bg-background px-3 pt-2"
        style={{ paddingBottom: Math.max(insets.bottom, 8) }}
      >
        <PromptInput
          placeholder={placeholder}
          generating={generating}
          onSubmit={onSendMessage}
          onStop={onStop}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

/* ============================================================ */
/* Header                                                       */
/* ============================================================ */

function ChatHeader({
  title,
  statusLabel,
  avatar,
  onNewChat,
  topInset,
}: {
  title: string;
  statusLabel: string;
  avatar?: React.ReactNode;
  onNewChat?: () => void;
  topInset: number;
}) {
  return (
    <View
      className="flex-row items-center gap-3 border-b border-border bg-background px-4 pb-3"
      style={{ paddingTop: topInset + 10 }}
    >
      <View className="h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-primary">
        {/* soft top tint gives the disc depth without a gradient dep */}
        <View
          aria-hidden
          pointerEvents="none"
          className="absolute inset-x-0 top-0 h-4 bg-white/15"
        />
        {avatar ?? null}
      </View>
      <View className="flex-1">
        <Text className="text-[15px] font-semibold text-foreground">{title}</Text>
        <Text className="text-[11px] text-muted-foreground">{statusLabel}</Text>
      </View>
      {onNewChat ? (
        <IconButton accessibilityLabel="New chat" onPress={onNewChat}>
          <PlusGlyph />
        </IconButton>
      ) : null}
    </View>
  );
}

/* ============================================================ */
/* User bubble                                                  */
/* ============================================================ */

function UserBubble({
  content,
  reduced,
}: {
  content: string;
  reduced: boolean;
}) {
  return (
    <Animated.View
      entering={reduced ? undefined : FadeInDown.duration(duration.base).easing(easing.enter)}
      accessibilityRole="text"
      className="max-w-[82%] self-end rounded-2xl rounded-br-md bg-primary px-3.5 py-2.5"
    >
      <Text className="text-[15px] leading-5 text-primary-foreground">{content}</Text>
    </Animated.View>
  );
}

/* ============================================================ */
/* Assistant message: reasoning + bubble/error + actions        */
/* ============================================================ */

function AssistantMessage({
  message,
  isLatest,
  onRetry,
  onRegenerate,
  reduced,
}: {
  message: ChatMessage;
  isLatest: boolean;
  onRetry?: (id: string) => void;
  onRegenerate?: (id: string) => void;
  reduced: boolean;
}) {
  const status = message.status ?? "done";
  const active = isLatest && status !== "error";

  return (
    <Animated.View
      entering={reduced ? undefined : FadeInDown.duration(duration.base).easing(easing.enter)}
      className="w-full gap-2"
    >
      {message.reasoning ? (
        <ReasoningTrace
          reasoning={message.reasoning}
          thinking={status === "thinking" || status === "streaming"}
        />
      ) : null}

      {status === "error" ? (
        <ErrorBubble onRetry={onRetry ? () => onRetry(message.id) : undefined} />
      ) : (
        <View className="gap-1.5">
          <StreamBubble
            content={message.content}
            tools={message.tools}
            replayKey={message.id}
            animate={active}
          />
          {status === "done" ? (
            <MessageActions
              content={message.content}
              onRegenerate={onRegenerate ? () => onRegenerate(message.id) : undefined}
            />
          ) : null}
        </View>
      )}
    </Animated.View>
  );
}

/* ============================================================ */
/* Error bubble + retry                                         */
/* ============================================================ */

function ErrorBubble({ onRetry }: { onRetry?: () => void }) {
  return (
    <View
      accessibilityRole="text"
      className="max-w-[85%] self-start rounded-2xl rounded-bl-md border border-destructive/40 bg-destructive/10 px-3.5 py-3"
    >
      <Text className="text-[14px] leading-5 text-foreground">
        Couldn’t generate a reply.
      </Text>
      {onRetry ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retry"
          hitSlop={8}
          onPress={() => {
            haptic.medium();
            onRetry();
          }}
          className="mt-1.5 self-start"
        >
          <Text className="text-[13px] font-semibold text-destructive">Retry</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/* ============================================================ */
/* Message actions: copy (with "Copied" feedback) + regenerate  */
/* ============================================================ */

function MessageActions({
  content,
  onRegenerate,
}: {
  content: string;
  onRegenerate?: () => void;
}) {
  const [copied, setCopied] = React.useState(false);

  const copy = async () => {
    haptic.selection();
    await Clipboard.setStringAsync(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <View className="flex-row items-center gap-3 pl-1">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={copied ? "Copied" : "Copy message"}
        hitSlop={8}
        onPress={copy}
      >
        <Text className="text-[12px] font-medium text-muted-foreground">
          {copied ? "Copied" : "Copy"}
        </Text>
      </Pressable>
      {onRegenerate ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Regenerate"
          hitSlop={8}
          onPress={() => {
            haptic.selection();
            onRegenerate();
          }}
        >
          <Text className="text-[12px] font-medium text-muted-foreground">
            Regenerate
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/* ============================================================ */
/* Empty state + starter prompts                                */
/* ============================================================ */

function EmptyState({
  title,
  starters,
  onPick,
}: {
  title: string;
  starters?: string[];
  onPick: (text: string) => void;
}) {
  return (
    <Animated.View
      entering={FadeIn.duration(duration.slow)}
      className="flex-1 items-center justify-center gap-5 px-6"
    >
      <View className="items-center gap-2">
        <View className="h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-primary">
          <View aria-hidden pointerEvents="none" className="absolute inset-x-0 top-0 h-6 bg-white/15" />
        </View>
        <Text className="text-lg font-semibold text-foreground">How can I help?</Text>
        <Text className="text-center text-[13px] text-muted-foreground">
          Ask {title} anything to get started.
        </Text>
      </View>

      {starters && starters.length > 0 ? (
        <View className="w-full gap-2">
          {starters.map((s, i) => (
            <StarterChip key={s} label={s} index={i} onPress={() => onPick(s)} />
          ))}
        </View>
      ) : null}
    </Animated.View>
  );
}

function StarterChip({
  label,
  index,
  onPress,
}: {
  label: string;
  index: number;
  onPress: () => void;
}) {
  return (
    <Animated.View entering={FadeInDown.delay(index * 60).duration(duration.base)}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={() => {
          haptic.selection();
          onPress();
        }}
        className="rounded-2xl border border-border bg-card px-4 py-3 active:opacity-80"
      >
        <Text className="text-[14px] text-foreground">{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

/* ============================================================ */
/* Scroll-to-bottom pill — springs in with a soft overshoot     */
/* ============================================================ */

function ScrollToBottomPill({
  onPress,
  reduced,
}: {
  onPress: () => void;
  reduced: boolean;
}) {
  return (
    <Animated.View
      entering={
        reduced
          ? undefined
          : FadeInDown.springify().damping(spring.bouncy.damping).mass(spring.bouncy.mass).stiffness(spring.bouncy.stiffness)
      }
      pointerEvents="box-none"
      className="absolute inset-x-0 bottom-2 items-center"
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Scroll to latest"
        hitSlop={10}
        onPress={() => {
          haptic.selection();
          onPress();
        }}
        className="h-9 flex-row items-center gap-1.5 rounded-full border border-border bg-card px-3.5 shadow-lg active:opacity-80"
      >
        <ChevronDownGlyph />
        <Text className="text-[12px] font-medium text-foreground">Latest</Text>
      </Pressable>
    </Animated.View>
  );
}

/* ============================================================ */
/* Shared: icon button + glyphs (drawn from Views, no icon dep) */
/* ============================================================ */

function IconButton({
  children,
  onPress,
  accessibilityLabel,
}: {
  children: React.ReactNode;
  onPress: () => void;
  accessibilityLabel: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      onPress={() => {
        haptic.selection();
        onPress();
      }}
      className="h-9 w-9 items-center justify-center rounded-full border border-border bg-secondary active:opacity-80"
    >
      {children}
    </Pressable>
  );
}

/** Plus — two centred rounded bars. */
function PlusGlyph() {
  const color = "rgba(244, 244, 250, 0.85)";
  return (
    <View style={{ width: 16, height: 16 }}>
      <View
        style={{ position: "absolute", top: 7, left: 1, width: 14, height: 2.5, borderRadius: 9, backgroundColor: color }}
      />
      <View
        style={{ position: "absolute", top: 1, left: 7, width: 2.5, height: 14, borderRadius: 9, backgroundColor: color }}
      />
    </View>
  );
}

/** Chevron-down — a triangle via the borderWidth trick. */
function ChevronDownGlyph() {
  return (
    <View style={{ width: 12, height: 12, alignItems: "center", justifyContent: "center" }}>
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: 5,
          borderRightWidth: 5,
          borderTopWidth: 6,
          borderLeftColor: "transparent",
          borderRightColor: "transparent",
          borderTopColor: "rgba(244, 244, 250, 0.85)",
        }}
      />
    </View>
  );
}
```

- [ ] **Step 2: Verify typecheck**

Run: `pnpm --filter @app-cn/ui typecheck`
Expected: PASS. (If `FadeInDown.springify().damping(...)` errors on the installed Reanimated version, replace the pill's `entering` with `FadeIn.duration(duration.fast)` — the pill still appears, just without the spring overshoot; note it for the delight polish.)

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/ai/chat.tsx
git commit -m "feat(chat): add the AI chat block component"
```

---

## Task 3: Export `Chat` from the package barrel

**Files:**
- Modify: `packages/ui/src/index.ts`

- [ ] **Step 1: Add the component + type exports**

In `packages/ui/src/index.ts`, after the `VoiceSphere` export block (line ~14), add:

```ts
export { Chat } from "./ai/chat";
export type { ChatProps, ChatMessage, ChatRole, ChatStatus } from "./ai/chat";
```

- [ ] **Step 2: Add the meta to the barrel export**

In the same file, add `chatMeta` to the `export { ... } from "./lib/meta";` list:

```ts
export {
  buttonMeta,
  streamBubbleMeta,
  promptInputMeta,
  reasoningTraceMeta,
  voiceSphereMeta,
  chatMeta,
} from "./lib/meta";
```

- [ ] **Step 3: Register the meta re-export**

In `packages/ui/src/lib/meta.ts`, add at the end of the file (after the `voiceSphereMeta` re-export):

```ts
export { meta as chatMeta } from "../ai/chat.meta";
```

- [ ] **Step 4: Verify (will fail until Task 4 exists — expected)**

Run: `pnpm --filter @app-cn/ui typecheck`
Expected: FAIL with "Cannot find module './ai/chat.meta'". This is expected — Task 4 creates it. Do **not** commit yet; proceed to Task 4, then this resolves.

---

## Task 4: Write `chat.meta.ts`

**Files:**
- Create: `packages/ui/src/ai/chat.meta.ts`

- [ ] **Step 1: Create the meta file**

Create `packages/ui/src/ai/chat.meta.ts` with exactly:

```ts
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
```

- [ ] **Step 2: Verify typecheck (now resolves Task 3 too)**

Run: `pnpm --filter @app-cn/ui typecheck`
Expected: PASS.

- [ ] **Step 3: Commit Tasks 3 + 4 together**

```bash
git add packages/ui/src/index.ts packages/ui/src/lib/meta.ts packages/ui/src/ai/chat.meta.ts
git commit -m "feat(chat): export Chat + meta"
```

---

## Task 5: Showcase demo (scripted assistant)

A live, scripted demo so `/c/chat` is alive in the showcase and the web preview iframe.

**Files:**
- Modify: `apps/showcase/lib/demos.tsx`

- [ ] **Step 1: Import `Chat` + its types**

In `apps/showcase/lib/demos.tsx`, extend the `@app-cn/ui` import to include `Chat` and the chat types:

```ts
import {
  Button,
  Chat,
  PromptInput,
  ReasoningTrace,
  StreamBubble,
  VoiceSphere,
  type ChatMessage,
  type PromptAttachment,
} from "@app-cn/ui";
```

- [ ] **Step 2: Add the `ChatDemo` component**

Add this component above the `demos` array (e.g. after `SphereInteractiveDemo`):

```tsx
const CHAT_REPLIES: Record<string, string> = {
  default:
    "appCN is a copy-paste component system for React Native + Expo. Tell me what screen you want and I'll show you the pieces.",
  button:
    "Add one with: npx shadcn@latest add @app-cn/button. It ships a Reanimated press-scale and variants out of the box.",
  reanimated:
    "Reanimated runs your animations on the UI thread, so they stay at 60fps even when JS is busy. appCN leans on it for every motion token.",
};

function pickReply(text: string): string {
  const t = text.toLowerCase();
  if (t.includes("button")) return CHAT_REPLIES.button;
  if (t.includes("reanimated") || t.includes("animat")) return CHAT_REPLIES.reanimated;
  return CHAT_REPLIES.default;
}

/** Controlled Chat with a scripted assistant so the preview feels alive. */
function ChatDemo() {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [generating, setGenerating] = React.useState(false);
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([]);

  React.useEffect(
    () => () => timers.current.forEach(clearTimeout),
    []
  );

  const send = React.useCallback((text: string) => {
    const userId = `u${Date.now()}`;
    const aId = `a${Date.now()}`;
    setMessages((m) => [
      ...m,
      { id: userId, role: "user", content: text },
      { id: aId, role: "assistant", content: pickReply(text), status: "streaming" },
    ]);
    setGenerating(true);
    // Let StreamBubble run its thinking→stream, then settle.
    const t = setTimeout(() => {
      setMessages((m) =>
        m.map((x) => (x.id === aId ? { ...x, status: "done" } : x))
      );
      setGenerating(false);
    }, 2600);
    timers.current.push(t);
  }, []);

  return (
    <View style={{ height: 560, width: "100%" }}>
      <Chat
        messages={messages}
        generating={generating}
        onSendMessage={send}
        onRegenerate={(id) =>
          setMessages((m) =>
            m.map((x) => (x.id === id ? { ...x, status: "streaming" } : x))
          )
        }
        starters={[
          "What can you build?",
          "How do I add a button?",
          "Why use reanimated?",
        ]}
        onNewChat={() => setMessages([])}
      />
    </View>
  );
}
```

- [ ] **Step 3: Add the demo entry**

Add this object to the `demos` array (after the `voice-sphere` entry):

```tsx
  {
    slug: "chat",
    title: "Chat",
    description:
      "The AI chat block: streaming replies, a docked composer, starter prompts, and magnetic stream-follow.",
    category: "ai",
    render: () => <ChatDemo />,
  },
```

- [ ] **Step 4: Verify typecheck**

Run: `pnpm --filter showcase typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/showcase/lib/demos.tsx
git commit -m "feat(chat): showcase demo with scripted assistant"
```

---

## Task 6: Web docs registry entry

**Files:**
- Modify: `apps/web/lib/registry.ts`

- [ ] **Step 1: Import `chatMeta`**

In `apps/web/lib/registry.ts`, add `chatMeta` to the import from `@app-cn/ui/lib/meta`:

```ts
import {
  buttonMeta,
  chatMeta,
  promptInputMeta,
  reasoningTraceMeta,
  streamBubbleMeta,
  voiceSphereMeta,
  type ComponentMeta,
} from "@app-cn/ui/lib/meta";
```

- [ ] **Step 2: Add the component entry**

Add this object to the `components` array (after the `voice-sphere` entry):

```ts
  {
    slug: "chat",
    title: chatMeta.title,
    description: chatMeta.description,
    category: chatMeta.category,
    sourcePath: "../../packages/ui/src/ai/chat.tsx",
    registryItem: "chat",
    meta: chatMeta,
  },
```

- [ ] **Step 3: Verify typecheck**

Run: `pnpm --filter @app-cn/web typecheck`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add apps/web/lib/registry.ts
git commit -m "feat(chat): web docs registry entry"
```

---

## Task 7: shadcn registry manifest item

**Files:**
- Modify: `apps/web/registry.json`

- [ ] **Step 1: Add the `chat` item**

In `apps/web/registry.json`, add this object to the `items` array (after the `voice-sphere` item). Note the registryDependencies pull in the three primitives + helpers:

```json
    {
      "name": "chat",
      "type": "registry:component",
      "title": "Chat",
      "description": "The AI chat block: streaming assistant bubbles, a docked composer, inline reasoning, starter prompts, and magnetic stream-follow.",
      "dependencies": [
        "react-native-reanimated",
        "react-native-safe-area-context",
        "expo-clipboard"
      ],
      "registryDependencies": [
        "@app-cn/cn",
        "@app-cn/motion",
        "@app-cn/haptics",
        "@app-cn/stream-bubble",
        "@app-cn/prompt-input",
        "@app-cn/reasoning-trace"
      ],
      "files": [
        {
          "path": "../../packages/ui/src/ai/chat.tsx",
          "type": "registry:component",
          "target": "components/ui/chat.tsx"
        }
      ]
    }
```

- [ ] **Step 2: Verify the registry builds + validates**

Run: `pnpm registry:build`
Expected: PASS — emits `apps/web/public/r/chat.json`, and the import-rewrite + `validate-registry.mjs` pass with no errors. Confirm `apps/web/public/r/chat.json` exists and its `files[0].content` shows `@/lib/cn` (rewritten from `../lib/cn`).

- [ ] **Step 3: Commit**

```bash
git add apps/web/registry.json
git commit -m "feat(chat): shadcn registry manifest item"
```

---

## Task 8: Changeset

**Files:**
- Create: `.changeset/ai-chat-block.md`

- [ ] **Step 1: Write the changeset**

Create `.changeset/ai-chat-block.md` with:

```markdown
---
"@app-cn/ui": minor
---

Add the **Chat** component — the AI chat block. A complete, drop-in conversation that composes StreamBubble, PromptInput, and ReasoningTrace: controlled `messages` + `onSendMessage`, header-as-slot, starter prompts, scroll-to-bottom pill, inline reasoning, message actions, error/retry, keyboard + safe-area handling, and a magnetic stream-follow delight. Also adds a backward-compatible `animate` prop to StreamBubble for rendering settled/historical messages.
```

- [ ] **Step 2: Verify the changeset is recognized**

Run: `pnpm changeset status`
Expected: shows `@app-cn/ui` will bump (minor).

- [ ] **Step 3: Commit**

```bash
git add .changeset/ai-chat-block.md
git commit -m "chore(changeset): @app-cn/ui minor — Chat block"
```

---

## Task 9: Full verification (SOP step 7)

**Files:** none (verification only).

- [ ] **Step 1: Whole-repo typecheck**

Run: `pnpm typecheck`
Expected: PASS across ui + cli + showcase + web.

- [ ] **Step 2: Registry build + validate**

Run: `pnpm registry:build`
Expected: PASS; `apps/web/public/r/chat.json` present and valid.

- [ ] **Step 3: Showcase renders + behaves**

Run: `pnpm --filter showcase start`, open `/c/chat` (web or Expo Go). Confirm, in order:
- Empty state shows the greeting + three starter chips.
- Tapping a starter (or typing + send) appends a right-aligned user bubble, then an assistant bubble that **thinks → streams → settles** (settle-glow + a success haptic on device).
- Scrolling up while a reply streams reveals the **"Latest" pill**; tapping it springs back to the bottom; if pinned to bottom, the list **auto-follows** the stream.
- A settled assistant message shows **Copy / Regenerate**; Copy flips to "Copied" briefly; Regenerate re-streams.
- The composer's send morphs to **stop** while generating; the composer sits above the keyboard.

- [ ] **Step 4: Web docs render**

Run: `pnpm --filter @app-cn/web dev`, open `/components/chat`. Confirm the page renders all sections (Anatomy, Delight, Props, Examples, A11y) and the interactive preview iframe (`/c/chat`) loads.

- [ ] **Step 5: Final commit if anything was tidied**

```bash
git add -A
git commit -m "test(chat): verify SOP — typecheck, registry, showcase, docs" || echo "nothing to commit"
```

---

## Self-Review (completed by plan author)

**1. Spec coverage** — every spec section maps to a task:
- Composite component / slug `chat` → Tasks 2,4,6,7. Controlled shell → Task 2 (`ChatProps`). Core list/composer/streaming/empty → Task 2. Starter prompts → Task 2 (`EmptyState`/`StarterChip`). Scroll-to-bottom pill + magnetic follow (delight) → Task 2 (`onContentSizeChange`/`onScroll`/`ScrollToBottomPill`). Inline reasoning → Task 2 (`AssistantMessage`→`ReasoningTrace`). Message actions → Task 2 (`MessageActions`). Keyboard + safe-area → Task 2 (`KeyboardAvoidingView`/`useSafeAreaInsets`). Stop generation → Task 2 (PromptInput `generating`/`onStop`). Error + retry → Task 2 (`ErrorBubble`). Completion haptic → Task 2 (status-transition effect). Header-as-slot → Task 2 (`headerEl`/`ChatHeader`). StreamBubble.animate patch → Task 1. Dependencies → Task 7. A11y → Task 2 + Task 4 meta. SOP/release → Tasks 3–9.

**2. Placeholder scan** — no TBD/TODO; every code step shows complete code; the one conditional (Task 2 Step 2 Reanimated `springify` fallback) names the exact replacement.

**3. Type consistency** — `ChatMessage`/`ChatProps`/`ChatStatus`/`ChatRole` defined in Task 2 are used identically in the index export (Task 3), the meta prop docs (Task 4), and the demo import (Task 5). `animate` prop name matches between Task 1's `stream-bubble.tsx` and its use in Task 2's `<StreamBubble animate={active} />`. `chatMeta` named consistently across `lib/meta.ts`, `index.ts`, and `registry.ts`. Registry item name `chat` matches `registryItem`/`slug`/demo `slug`.

**Known integration caveat (from spec §12):** indeterminate "thinking" with empty content is not held beyond StreamBubble's `thinkingDuration`; v1 expects the assistant message to carry its `content` with `status: "streaming"` and lets StreamBubble run thinking→stream→settle (the demo in Task 5 does exactly this). A dedicated indeterminate-thinking hold + a `StreamBubble.onDone` callback (to fire the completion haptic exactly on settle rather than on the `status` flip) are documented future enhancements, intentionally out of v1 scope.
