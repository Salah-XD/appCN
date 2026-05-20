import * as React from "react";
import { Text, View } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { cn } from "../lib/cn";

type Phase = "thinking" | "streaming" | "done";

/** A single staggered "thinking" dot. */
function Dot({ index }: { index: number }) {
  const progress = useSharedValue(0);

  React.useEffect(() => {
    progress.value = withDelay(
      index * 150,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 350, easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration: 350, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        false
      )
    );
  }, [index, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: 0.35 + progress.value * 0.65,
    transform: [{ translateY: -progress.value * 3 }],
  }));

  return (
    <Animated.View
      style={style}
      className="h-2 w-2 rounded-full bg-muted-foreground"
    />
  );
}

/** Blinking caret shown while tokens are streaming in. */
function Caret() {
  const opacity = useSharedValue(1);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 500 }),
        withTiming(1, { duration: 500 })
      ),
      -1,
      true
    );
  }, [opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.Text style={style} className="text-[15px] leading-6 text-primary">
      {"▍"}
    </Animated.Text>
  );
}

export interface StreamBubbleProps {
  /** Full assistant message that streams in token-by-token. */
  content: string;
  /** How long the thinking indicator shows before streaming (ms). */
  thinkingDuration?: number;
  /** Characters revealed per tick. */
  chunkSize?: number;
  /** Tick interval (ms) — lower is faster. */
  speed?: number;
  /** Change this value to replay the animation from the start. */
  replayKey?: string | number;
  className?: string;
}

/**
 * appCN StreamBubble — the AI-native flagship. An assistant message that
 * animates through three phases: a staggered "thinking" indicator, a
 * token-by-token stream with a blinking caret, then a settled final state.
 */
export function StreamBubble({
  content,
  thinkingDuration = 900,
  chunkSize = 2,
  speed = 28,
  replayKey,
  className,
}: StreamBubbleProps) {
  const [phase, setPhase] = React.useState<Phase>("thinking");
  const [shown, setShown] = React.useState(0);

  // Reset + run the thinking phase whenever the message (or replayKey) changes.
  React.useEffect(() => {
    setPhase("thinking");
    setShown(0);
    const t = setTimeout(() => setPhase("streaming"), thinkingDuration);
    return () => clearTimeout(t);
  }, [content, thinkingDuration, replayKey]);

  // Reveal tokens while streaming.
  React.useEffect(() => {
    if (phase !== "streaming") return;
    const id = setInterval(() => {
      setShown((n) => {
        const next = Math.min(content.length, n + chunkSize);
        if (next >= content.length) {
          clearInterval(id);
          setPhase("done");
        }
        return next;
      });
    }, speed);
    return () => clearInterval(id);
  }, [phase, content, chunkSize, speed]);

  return (
    <Animated.View
      entering={FadeIn.duration(220)}
      accessibilityRole="text"
      className={cn(
        "max-w-[85%] self-start rounded-3xl rounded-bl-md bg-card px-4 py-3",
        className
      )}
    >
      {phase === "thinking" ? (
        <View className="flex-row items-center gap-1.5 py-1">
          <Dot index={0} />
          <Dot index={1} />
          <Dot index={2} />
        </View>
      ) : (
        <Text className="text-[15px] leading-6 text-card-foreground">
          {content.slice(0, shown)}
          {phase === "streaming" ? <Caret /> : null}
        </Text>
      )}
    </Animated.View>
  );
}
