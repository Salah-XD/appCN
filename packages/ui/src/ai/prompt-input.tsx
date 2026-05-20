import * as React from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { cn } from "../lib/cn";

export interface PromptInputProps {
  placeholder?: string;
  /** When true, the action button becomes a "stop" control. */
  streaming?: boolean;
  /** Called with the trimmed message when the user sends. */
  onSend?: (text: string) => void;
  /** Called when the user taps stop while streaming. */
  onStop?: () => void;
  className?: string;
}

/**
 * appCN PromptInput — an AI chat composer. A rounded multiline field with an
 * animated circular action button that is muted when empty, primary when there
 * is text to send, and a stop control while the assistant is streaming.
 */
export function PromptInput({
  placeholder = "Message appCN…",
  streaming = false,
  onSend,
  onStop,
  className,
}: PromptInputProps) {
  const [text, setText] = React.useState("");
  const hasText = text.trim().length > 0;
  const enabled = streaming || hasText;

  const scale = useSharedValue(1);
  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  function handlePress() {
    if (streaming) {
      onStop?.();
      return;
    }
    if (!hasText) return;
    onSend?.(text.trim());
    setText("");
  }

  return (
    <View
      className={cn(
        "w-full flex-row items-end gap-2 rounded-3xl border border-border bg-card p-2 pl-4",
        className
      )}
    >
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder={placeholder}
        placeholderTextColor="#71717a"
        multiline
        className="max-h-28 flex-1 py-2 text-[15px] leading-5 text-card-foreground"
      />

      <Animated.View style={buttonStyle}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={streaming ? "Stop" : "Send"}
          disabled={!enabled}
          onPressIn={() => {
            scale.value = withTiming(0.9, { duration: 90 });
          }}
          onPressOut={() => {
            scale.value = withTiming(1, { duration: 130 });
          }}
          onPress={handlePress}
          className={cn(
            "h-9 w-9 items-center justify-center rounded-full",
            enabled ? "bg-primary" : "bg-secondary"
          )}
        >
          {streaming ? (
            <View className="h-3 w-3 rounded-[3px] bg-primary-foreground" />
          ) : (
            <Text
              className={cn(
                "text-base font-bold leading-none",
                enabled ? "text-primary-foreground" : "text-muted-foreground"
              )}
            >
              ↑
            </Text>
          )}
        </Pressable>
      </Animated.View>
    </View>
  );
}
