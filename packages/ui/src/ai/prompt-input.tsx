import * as React from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  type NativeSyntheticEvent,
  type TextInputContentSizeChangeEventData,
} from "react-native";
import Animated, {
  cancelAnimation,
  FadeIn,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { cn } from "../lib/cn";
import { duration, easing, spring, PRESS_SCALE } from "../lib/motion";
import { haptic } from "../lib/haptics";

export interface PromptAttachment {
  id: string;
  label: string;
}

export interface PromptInputProps {
  /** Controlled text value. */
  value?: string;
  /** Initial value when uncontrolled. */
  defaultValue?: string;
  onChangeText?: (text: string) => void;
  /** Called with the trimmed message on send. */
  onSubmit?: (text: string) => void;
  /** Called when the user taps the stop button while `generating`. */
  onStop?: () => void;
  /** When true, the send button morphs into a stop with a spinning ring. */
  generating?: boolean;
  placeholder?: string;
  /** Auto-grow bounds for the input (px). */
  minHeight?: number;
  maxHeight?: number;
  /** Optional attachment chips shown above the input. */
  attachments?: PromptAttachment[];
  onRemoveAttachment?: (id: string) => void;
  /** Show a leading "+" button when provided. */
  onAddAttachment?: () => void;
  disabled?: boolean;
  className?: string;
}

/**
 * appCN PromptInput — the AI composer. Auto-grows with content, holds optional
 * attachment chips, and (the delight detail) morphs its send button into a stop
 * control wrapped in a spinning progress ring the moment generation starts.
 */
export function PromptInput({
  value: valueProp,
  defaultValue,
  onChangeText,
  onSubmit,
  onStop,
  generating = false,
  placeholder = "Message appCN…",
  minHeight = 24,
  maxHeight = 140,
  attachments,
  onRemoveAttachment,
  onAddAttachment,
  disabled = false,
  className,
}: PromptInputProps) {
  const isControlled = valueProp !== undefined;
  const [internal, setInternal] = React.useState(defaultValue ?? "");
  const value = isControlled ? valueProp : internal;

  const [height, setHeight] = React.useState(minHeight);
  const [focused, setFocused] = React.useState(false);

  const canSend = value.trim().length > 0 && !disabled;

  const setValue = (text: string) => {
    if (!isControlled) setInternal(text);
    onChangeText?.(text);
  };

  const handleSend = () => {
    if (generating) {
      haptic.light();
      onStop?.();
      return;
    }
    if (!canSend) return;
    haptic.medium();
    onSubmit?.(value.trim());
    if (!isControlled) {
      setInternal("");
      setHeight(minHeight);
    }
  };

  const handleContentSize = (
    e: NativeSyntheticEvent<TextInputContentSizeChangeEventData>
  ) => {
    const next = Math.min(
      maxHeight,
      Math.max(minHeight, e.nativeEvent.contentSize.height)
    );
    setHeight(next);
  };

  return (
    <View
      className={cn(
        "rounded-3xl border bg-card px-2.5 py-2",
        focused && !disabled ? "border-ring" : "border-border",
        disabled && "opacity-60",
        className
      )}
    >
      {attachments && attachments.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-2"
          contentContainerStyle={{ gap: 8, paddingHorizontal: 4 }}
        >
          {attachments.map((a) => (
            <AttachmentChip
              key={a.id}
              attachment={a}
              onRemove={onRemoveAttachment}
            />
          ))}
        </ScrollView>
      ) : null}

      <View className="flex-row items-end gap-2">
        {onAddAttachment ? (
          <IconButton
            accessibilityLabel="Add attachment"
            onPress={onAddAttachment}
            disabled={disabled}
          >
            <PlusIcon colorClassName="bg-secondary-foreground" />
          </IconButton>
        ) : null}

        <TextInput
          value={value}
          onChangeText={setValue}
          onContentSizeChange={handleContentSize}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          multiline
          editable={!disabled}
          style={{ height, paddingTop: 0, paddingBottom: 0 }}
          className="flex-1 self-center px-1 text-[15px] leading-5 text-foreground placeholder:text-muted-foreground"
          accessibilityLabel={placeholder}
        />

        <SendButton
          active={canSend}
          generating={generating}
          onPress={handleSend}
        />
      </View>
    </View>
  );
}

function SendButton({
  active,
  generating,
  onPress,
}: {
  active: boolean;
  generating: boolean;
  onPress: () => void;
}) {
  const reduced = useReducedMotion();
  const pressed = useSharedValue(0);
  const rot = useSharedValue(0);
  const enabled = active || generating;

  React.useEffect(() => {
    if (generating && !reduced) {
      rot.value = withRepeat(
        withTiming(360, { duration: 900, easing: easing.linear }),
        -1,
        false
      );
    } else {
      cancelAnimation(rot);
      rot.value = withTiming(0, { duration: duration.fast });
    }
  }, [generating, reduced, rot]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: withSpring(enabled ? 1 : 0.86, spring.bouncy) },
      { scale: withSpring(pressed.value ? PRESS_SCALE : 1, spring.press) },
    ],
  }));

  const arrowStyle = useAnimatedStyle(() => ({
    opacity: withTiming(generating ? 0 : 1, { duration: duration.fast }),
    transform: [{ scale: withTiming(generating ? 0.5 : 1, { duration: duration.fast }) }],
  }));

  const stopStyle = useAnimatedStyle(() => ({
    opacity: withTiming(generating ? 1 : 0, { duration: duration.fast }),
    transform: [{ scale: withTiming(generating ? 1 : 0.5, { duration: duration.fast }) }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: withTiming(generating ? 1 : 0, { duration: duration.fast }),
    transform: [{ rotate: `${rot.value}deg` }],
  }));

  return (
    <Animated.View style={containerStyle}>
      <Animated.View
        pointerEvents="none"
        style={ringStyle}
        className="absolute -inset-[3px] rounded-full border-2 border-transparent border-t-primary-foreground"
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={generating ? "Stop generating" : "Send message"}
        accessibilityState={{ disabled: !enabled }}
        disabled={!enabled}
        hitSlop={8}
        onPressIn={() => {
          pressed.value = 1;
        }}
        onPressOut={() => {
          pressed.value = 0;
        }}
        onPress={onPress}
        className={cn(
          "h-9 w-9 items-center justify-center rounded-full",
          enabled ? "bg-primary" : "bg-muted"
        )}
      >
        <Animated.View style={arrowStyle} className="absolute">
          <ChevronArrowUp
            colorClassName={
              enabled ? "border-primary-foreground" : "border-muted-foreground"
            }
          />
        </Animated.View>
        <Animated.View style={stopStyle} className="absolute">
          <Square colorClassName="bg-primary-foreground" />
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

function IconButton({
  children,
  onPress,
  accessibilityLabel,
  disabled,
}: {
  children: React.ReactNode;
  onPress: () => void;
  accessibilityLabel: string;
  disabled?: boolean;
}) {
  const pressed = useSharedValue(0);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(pressed.value ? PRESS_SCALE : 1, spring.press) }],
  }));
  return (
    <Animated.View style={style}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        hitSlop={8}
        disabled={disabled}
        onPressIn={() => {
          pressed.value = 1;
        }}
        onPressOut={() => {
          pressed.value = 0;
        }}
        onPress={onPress}
        className="h-9 w-9 items-center justify-center rounded-full bg-secondary"
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

function AttachmentChip({
  attachment,
  onRemove,
}: {
  attachment: PromptAttachment;
  onRemove?: (id: string) => void;
}) {
  return (
    <Animated.View
      entering={FadeIn.duration(duration.fast)}
      className="flex-row items-center gap-1.5 rounded-xl bg-secondary px-2.5 py-1.5"
    >
      <Text
        numberOfLines={1}
        className="max-w-[140px] text-xs font-medium text-secondary-foreground"
      >
        {attachment.label}
      </Text>
      {onRemove ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Remove ${attachment.label}`}
          hitSlop={8}
          onPress={() => onRemove(attachment.id)}
          className="h-4 w-4 items-center justify-center rounded-full bg-muted-foreground/20"
        >
          <XIcon colorClassName="bg-secondary-foreground" />
        </Pressable>
      ) : null}
    </Animated.View>
  );
}

/* --- Dependency-free geometric icons (no icon library needed) --- */

/** Up arrow built from a border line (stem) + an L-shaped chevron (head). */
function ChevronArrowUp({ colorClassName }: { colorClassName: string }) {
  return (
    <View className="h-4 w-4 items-center justify-center">
      <View className={cn("absolute bottom-[2px] h-[11px] border-l-2", colorClassName)} />
      <View
        className={cn(
          "absolute top-[3px] h-[9px] w-[9px] rotate-45 border-l-2 border-t-2",
          colorClassName
        )}
      />
    </View>
  );
}

/** Solid rounded square — the stop glyph. Expects a `bg-*` class. */
function Square({ colorClassName }: { colorClassName: string }) {
  return <View className={cn("h-3 w-3 rounded-[3px]", colorClassName)} />;
}

/** Plus — two bars. Expects a `bg-*` class. */
function PlusIcon({ colorClassName }: { colorClassName: string }) {
  return (
    <View className="h-4 w-4 items-center justify-center">
      <View className={cn("absolute h-[2px] w-3.5 rounded-full", colorClassName)} />
      <View className={cn("absolute h-3.5 w-[2px] rounded-full", colorClassName)} />
    </View>
  );
}

/** Close — two crossed bars. Expects a `bg-*` class. */
function XIcon({ colorClassName }: { colorClassName: string }) {
  return (
    <View className="h-3 w-3 items-center justify-center">
      <View className={cn("absolute h-[1.5px] w-3 rotate-45 rounded-full", colorClassName)} />
      <View className={cn("absolute h-[1.5px] w-3 -rotate-45 rounded-full", colorClassName)} />
    </View>
  );
}
