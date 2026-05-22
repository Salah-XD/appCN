import * as React from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { cn } from "../lib/cn";
import { duration, easing } from "../lib/motion";

export interface VoiceWaveformProps {
  /** When true, bars come alive and shift to the accent color. */
  active?: boolean;
  /**
   * Live amplitude 0..1. When provided it drives the bars directly (feed it from
   * a metering source). When omitted, an internal lively animation runs.
   */
  amplitude?: number;
  /** Number of bars. */
  barCount?: number;
  className?: string;
}

/**
 * appCN VoiceWaveform — a live mic visualizer. The delight detail: when idle it
 * doesn't go flat, it *breathes* with a slow low envelope; the instant it goes
 * active the whole bank shifts hue from muted to the accent, so "listening" is
 * felt before it's read.
 */
export function VoiceWaveform({
  active = false,
  amplitude,
  barCount = 28,
  className,
}: VoiceWaveformProps) {
  const bars = React.useMemo(
    () => Array.from({ length: barCount }, (_, i) => i),
    [barCount]
  );

  return (
    <View
      accessible
      accessibilityLabel={active ? "Listening" : "Microphone idle"}
      className={cn("h-12 flex-row items-center justify-center gap-1", className)}
    >
      {bars.map((i) => (
        <Bar
          key={i}
          index={i}
          active={active}
          amplitude={amplitude}
          barCount={barCount}
        />
      ))}
    </View>
  );
}

function Bar({
  index,
  active,
  amplitude,
  barCount,
}: {
  index: number;
  active: boolean;
  amplitude?: number;
  barCount: number;
}) {
  const reduced = useReducedMotion();
  const h = useSharedValue(0.2);
  const voice = useSharedValue(active ? 1 : 0);

  const center = (barCount - 1) / 2;
  const dist = Math.abs(index - center) / (center || 1);
  const envelope = 1 - dist * 0.55; // taller in the middle, like a real waveform

  // Hue shift muted -> accent.
  React.useEffect(() => {
    voice.value = reduced
      ? active
        ? 1
        : 0
      : withTiming(active ? 1 : 0, { duration: duration.slow });
  }, [active, reduced, voice]);

  // Self-driven liveliness when no amplitude is supplied.
  React.useEffect(() => {
    if (amplitude != null) return;
    if (reduced) {
      h.value = active ? 0.6 : 0.3;
      return;
    }
    const peak = active ? 0.55 + 0.45 * envelope : 0.18 + 0.12 * envelope;
    const base = active ? 0.18 : 0.1;
    const dur = (active ? 240 : 1000) + (index % 5) * (active ? 50 : 130);
    h.value = withDelay(
      index * (active ? 25 : 60),
      withRepeat(
        withSequence(
          withTiming(peak, { duration: dur, easing: easing.standard }),
          withTiming(base, { duration: dur, easing: easing.standard })
        ),
        -1,
        true
      )
    );
  }, [active, reduced, amplitude, index, envelope, h]);

  // Controlled amplitude.
  React.useEffect(() => {
    if (amplitude == null) return;
    const jitter = 0.75 + 0.25 * Math.sin(index * 1.7);
    const target = Math.max(
      0.08,
      Math.min(1, amplitude * envelope * jitter * 1.3)
    );
    h.value = reduced
      ? target
      : withTiming(target, { duration: 90, easing: easing.standard });
  }, [amplitude, index, envelope, reduced, h]);

  const heightStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: 0.12 + h.value * 0.88 }],
  }));
  const voiceStyle = useAnimatedStyle(() => ({ opacity: voice.value }));

  return (
    <View className="h-full w-1">
      <Animated.View
        style={heightStyle}
        className="absolute inset-0 rounded-full bg-muted-foreground"
      />
      <Animated.View
        style={[heightStyle, voiceStyle]}
        className="absolute inset-0 rounded-full bg-primary"
      />
    </View>
  );
}
