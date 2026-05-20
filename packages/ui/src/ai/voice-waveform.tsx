import * as React from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { cn } from "../lib/cn";

const MIN_HEIGHT = 6;

function Bar({
  index,
  active,
  maxHeight,
}: {
  index: number;
  active: boolean;
  maxHeight: number;
}) {
  const height = useSharedValue(MIN_HEIGHT);

  React.useEffect(() => {
    if (active) {
      const peak = maxHeight * (0.45 + Math.random() * 0.55);
      const up = 260 + Math.random() * 220;
      const down = 260 + Math.random() * 220;
      height.value = withDelay(
        index * 70,
        withRepeat(
          withSequence(
            withTiming(peak, { duration: up, easing: Easing.inOut(Easing.ease) }),
            withTiming(MIN_HEIGHT, {
              duration: down,
              easing: Easing.inOut(Easing.ease),
            })
          ),
          -1,
          true
        )
      );
    } else {
      height.value = withTiming(MIN_HEIGHT, { duration: 250 });
    }
  }, [active, index, maxHeight, height]);

  const style = useAnimatedStyle(() => ({ height: height.value }));

  return <Animated.View style={style} className="w-1.5 rounded-full bg-primary" />;
}

export interface VoiceWaveformProps {
  /** Whether the waveform is animating (i.e. "listening"). */
  active?: boolean;
  /** Number of bars. */
  barCount?: number;
  /** Container height in px; bars peak near this. */
  height?: number;
  className?: string;
}

/**
 * appCN VoiceWaveform — an animated listening visualization for voice / AI
 * assistant UI. Bars oscillate with staggered, slightly randomized motion when
 * `active`, and settle flat when not.
 */
export function VoiceWaveform({
  active = true,
  barCount = 5,
  height = 48,
  className,
}: VoiceWaveformProps) {
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={active ? "Listening" : "Idle"}
      className={cn("flex-row items-center justify-center gap-1.5", className)}
      style={{ height }}
    >
      {Array.from({ length: barCount }).map((_, i) => (
        <Bar key={i} index={i} active={active} maxHeight={height} />
      ))}
    </View>
  );
}
