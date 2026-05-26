import * as React from "react";
import {
  Image,
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
  /** Optional image preview URI. When provided, the chip shows a thumbnail. */
  uri?: string;
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
  /** When true, the send button morphs into a stop with a spinning arc. */
  generating?: boolean;
  placeholder?: string;
  /** Optional hint shown below the input (e.g. "⌘+Enter to send"). */
  hint?: string;
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
 * attachment chips, glows on focus, and (the delight detail) morphs its send
 * button into a stop control wrapped in a spinning gradient arc the moment
 * generation starts.
 */
export function PromptInput({
  value: valueProp,
  defaultValue,
  onChangeText,
  onSubmit,
  onStop,
  generating = false,
  placeholder = "Message appCN…",
  hint,
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

  // Focus glow: a subtle shadow + border-ring on focus.
  const focusProgress = useSharedValue(0);
  React.useEffect(() => {
    focusProgress.value = withTiming(focused && !disabled ? 1 : 0, {
      duration: duration.base,
      easing: easing.standard,
    });
  }, [focused, disabled, focusProgress]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: focusProgress.value * 0.5,
  }));

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
    <View className={className}>
      <View className="relative">
        {/* Focus glow — soft primary halo built from stacked tinted layers. */}
        <Animated.View
          aria-hidden
          pointerEvents="none"
          style={glowStyle}
          className="absolute -inset-2 rounded-[28px] bg-primary/15"
        />
        <Animated.View
          aria-hidden
          pointerEvents="none"
          style={glowStyle}
          className="absolute -inset-1 rounded-[26px] bg-primary/20"
        />

        <View
          className={cn(
            "relative rounded-3xl border bg-card px-2.5 py-2",
            focused && !disabled ? "border-ring" : "border-border",
            disabled && "opacity-60"
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
                <PlusGlyph />
              </IconButton>
            ) : null}

            <TextInput
              value={value}
              onChangeText={setValue}
              onContentSizeChange={handleContentSize}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={placeholder}
              placeholderTextColor="rgba(255,255,255,0.35)"
              multiline
              editable={!disabled}
              // `outlineStyle: 'none'` + zero border kills both the default
              // browser focus ring AND the subtle text-input border that
              // react-native-web sometimes paints on multiline inputs. The
              // parent container is the only border. No-op on iOS/Android.
              style={[
                {
                  height,
                  paddingTop: 0,
                  paddingBottom: 0,
                  borderWidth: 0,
                },
                { outlineStyle: "none" } as object,
              ]}
              className="flex-1 self-center px-1 text-[15px] leading-5 text-foreground"
              accessibilityLabel={placeholder}
            />

            <SendButton
              active={canSend}
              generating={generating}
              onPress={handleSend}
            />
          </View>
        </View>
      </View>

      {hint ? (
        <View className="mt-2 px-1">
          <Text className="text-xs text-muted-foreground">{hint}</Text>
        </View>
      ) : null}
    </View>
  );
}

/* ============================================================ */
/* Send button — morph between arrow and stop, with arc sweep   */
/* ============================================================ */

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
        withTiming(360, { duration: 1100, easing: easing.linear }),
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
    transform: [
      { scale: withTiming(generating ? 0.5 : 1, { duration: duration.fast }) },
    ],
  }));

  const stopStyle = useAnimatedStyle(() => ({
    opacity: withTiming(generating ? 1 : 0, { duration: duration.fast }),
    transform: [
      { scale: withTiming(generating ? 1 : 0.5, { duration: duration.fast }) },
    ],
  }));

  // Two stacked arcs at different offsets create a gradient-feel sweep.
  const arcAStyle = useAnimatedStyle(() => ({
    opacity: withTiming(generating ? 1 : 0, { duration: duration.fast }),
    transform: [{ rotate: `${rot.value}deg` }],
  }));
  const arcBStyle = useAnimatedStyle(() => ({
    opacity: withTiming(generating ? 0.7 : 0, { duration: duration.fast }),
    transform: [{ rotate: `${rot.value + 140}deg` }],
  }));

  // Soft glow behind the button when enabled — pulls the eye to the action.
  const glow = useAnimatedStyle(() => ({
    opacity: withTiming(enabled ? 1 : 0, { duration: duration.base }),
  }));

  return (
    <Animated.View style={containerStyle} className="relative">
      {/* Ambient primary glow when active */}
      <Animated.View
        aria-hidden
        pointerEvents="none"
        style={glow}
        className="absolute -inset-2 rounded-full bg-primary/30"
      />
      <Animated.View
        aria-hidden
        pointerEvents="none"
        style={glow}
        className="absolute -inset-1 rounded-full bg-primary/40"
      />

      {/* Bright leading arc */}
      <Animated.View
        pointerEvents="none"
        style={arcAStyle}
        className="absolute -inset-[3px] rounded-full border-[2.5px] border-transparent border-t-primary-foreground border-r-primary-foreground/40"
      />
      {/* Trailing arc, offset for gradient feel */}
      <Animated.View
        pointerEvents="none"
        style={arcBStyle}
        className="absolute -inset-[3px] rounded-full border-[2.5px] border-transparent border-t-primary-foreground/55"
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
          "h-10 w-10 items-center justify-center rounded-full",
          enabled ? "bg-primary" : "bg-muted"
        )}
      >
        {/* Both glyphs are wrapped in an absolute layer that exactly fills the
            button. The wrapper uses flex centering, so each glyph sits dead-
            centre. Glyphs themselves are pixel-sized — no Tailwind % values. */}
        <Animated.View
          style={[
            arrowStyle,
            {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              alignItems: "center",
              justifyContent: "center",
            },
          ]}
        >
          <ArrowUpGlyph filled={enabled} />
        </Animated.View>
        <Animated.View
          style={[
            stopStyle,
            {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              alignItems: "center",
              justifyContent: "center",
            },
          ]}
        >
          <StopGlyph />
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

/* ============================================================ */
/* Icon button (Add attachment) — press lift                    */
/* ============================================================ */

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
    transform: [
      { scale: withSpring(pressed.value ? PRESS_SCALE : 1, spring.press) },
    ],
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
        className="h-10 w-10 items-center justify-center rounded-full border border-border bg-secondary"
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

/* ============================================================ */
/* Attachment chip — press-lift with subtle shadow              */
/* ============================================================ */

function AttachmentChip({
  attachment,
  onRemove,
}: {
  attachment: PromptAttachment;
  onRemove?: (id: string) => void;
}) {
  const pressed = useSharedValue(0);
  const style = useAnimatedStyle(() => ({
    transform: [
      { scale: withSpring(pressed.value ? 0.96 : 1, spring.press) },
      { translateY: withSpring(pressed.value ? 1 : 0, spring.press) },
    ],
  }));

  // With a thumbnail, the chip shows the image; without, a small primary dot.
  const hasImage = Boolean(attachment.uri);

  return (
    <Animated.View
      entering={FadeIn.duration(duration.fast)}
      style={style}
      className="relative flex-row items-center gap-2 self-start rounded-xl border border-border bg-secondary py-1 pl-1 pr-2.5"
    >
      {hasImage ? (
        <Image
          source={{ uri: attachment.uri }}
          accessibilityIgnoresInvertColors
          className="h-7 w-7 rounded-lg bg-muted"
        />
      ) : (
        <View className="h-7 w-7 items-center justify-center rounded-lg bg-muted">
          <View className="h-1.5 w-1.5 rounded-full bg-primary" />
        </View>
      )}
      <Text
        numberOfLines={1}
        className="max-w-[120px] text-xs font-medium text-secondary-foreground"
      >
        {attachment.label}
      </Text>
      {onRemove ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Remove ${attachment.label}`}
          hitSlop={6}
          onPressIn={() => {
            pressed.value = 1;
          }}
          onPressOut={() => {
            pressed.value = 0;
          }}
          onPress={() => onRemove(attachment.id)}
          className="-mr-0.5 h-4 w-4 items-center justify-center rounded-full bg-background/60"
        >
          <CloseGlyph />
        </Pressable>
      ) : null}
    </Animated.View>
  );
}

/* ============================================================ */
/* Glyphs — composed Views, polished weights                    */
/* ============================================================ */

/**
 * Up arrow — a solid filled triangle head sitting on a rectangular stem.
 * Uses RN's borderWidth-triangle trick for the head (no SVG dependency).
 *
 * Layout uses pure flex column centering — no percentages, no absolute
 * positioning, so it sits dead-centre wherever it's rendered.
 */
function ArrowUpGlyph({ filled }: { filled: boolean }) {
  // Resolved to literal colors so the borderWidth-triangle trick works
  // reliably across platforms (NativeWind className colors don't always
  // resolve on a 0×0 View on web).
  const color = filled ? "#FFFFFF" : "rgba(244, 244, 250, 0.55)";

  return (
    <View
      style={{
        width: 16,
        height: 16,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Triangle head: a 0×0 View whose bottom border is the colored fill.
          12 wide × 8 tall — wide chevron, like ChatGPT/Claude send icons. */}
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: 6,
          borderRightWidth: 6,
          borderBottomWidth: 8,
          borderLeftColor: "transparent",
          borderRightColor: "transparent",
          borderBottomColor: color,
        }}
      />
      {/* Stem: tucked right under the head, sharing the same color. */}
      <View
        style={{
          width: 3,
          height: 6,
          backgroundColor: color,
          marginTop: -0.5,
          borderBottomLeftRadius: 1.5,
          borderBottomRightRadius: 1.5,
        }}
      />
    </View>
  );
}

/** Stop — rounded square. */
function StopGlyph() {
  return (
    <View
      style={{
        width: 12,
        height: 12,
        borderRadius: 3,
        backgroundColor: "#FFFFFF",
      }}
    />
  );
}

/** Plus — two centred, rounded bars (inline positioning, no percent transforms). */
function PlusGlyph() {
  const color = "rgba(244, 244, 250, 0.85)";
  return (
    <View style={{ width: 16, height: 16 }}>
      <View
        style={{
          position: "absolute",
          top: 7,
          left: 1,
          width: 14,
          height: 2.5,
          borderRadius: 9,
          backgroundColor: color,
        }}
      />
      <View
        style={{
          position: "absolute",
          top: 1,
          left: 7,
          width: 2.5,
          height: 14,
          borderRadius: 9,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

/** Close — two crossed, rounded bars. */
function CloseGlyph() {
  const color = "rgba(244, 244, 250, 0.85)";
  return (
    <View style={{ width: 12, height: 12 }}>
      <View
        style={{
          position: "absolute",
          top: 5.25,
          left: 0,
          width: 12,
          height: 1.75,
          borderRadius: 9,
          backgroundColor: color,
          transform: [{ rotate: "45deg" }],
        }}
      />
      <View
        style={{
          position: "absolute",
          top: 5.25,
          left: 0,
          width: 12,
          height: 1.75,
          borderRadius: 9,
          backgroundColor: color,
          transform: [{ rotate: "-45deg" }],
        }}
      />
    </View>
  );
}
