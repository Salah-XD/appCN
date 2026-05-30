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
import { duration, easing, spring } from "../lib/motion";
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
      if (messages[i]!.role === "assistant") return messages[i]!.id;
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
            style={{ flex: 1, minHeight: 0 }}
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
      style={{ alignSelf: "stretch", alignItems: "flex-end" }}
    >
      <View
        accessibilityRole="text"
        className="max-w-[82%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2.5"
      >
        <Text className="text-[15px] leading-5 text-primary-foreground">{content}</Text>
      </View>
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
        Couldn't generate a reply.
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
