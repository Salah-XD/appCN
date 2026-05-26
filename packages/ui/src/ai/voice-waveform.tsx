import * as React from "react";
import { View } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { cn } from "../lib/cn";
import { duration, easing, spring } from "../lib/motion";

export interface VoiceWaveformProps {
  /** When true, bars come alive and shift hue through the accent spectrum. */
  active?: boolean;
  /**
   * Live amplitude 0..1. When provided it drives the bars directly via spring
   * (feed it from a metering source). When omitted, an internal lively
   * animation runs.
   */
  amplitude?: number;
  /** Number of bars. */
  barCount?: number;
  /**
   * Shape of the envelope across bars.
   * - "envelope" (default): taller in the middle, like a real waveform.
   * - "uniform": all bars share a single amplitude.
   */
  variant?: "envelope" | "uniform";
  /** Show the center glow halo + pulsing mic dot. */
  indicator?: boolean;
  className?: string;
}

const TRACK_HEIGHT = 96; // explicit pixel height — no flex resolution
const BAR_WIDTH = 8;
const BAR_GAP = 8;
const MIN_BAR_RATIO = 0.18; // bars never collapse fully — always readable

/**
 * appCN VoiceWaveform — a live mic visualizer. Spring-driven so amplitude
 * changes feel tactile; bars hue-shift across primary→accent when listening,
 * a center glow halo pulses with energy, and a tiny mic dot at the heart
 * keeps the surface alive even at low input.
 *
 * Uses animated `height` (not scaleY) so it renders reliably on every
 * platform — including react-native-web inside an iframe.
 */
export function VoiceWaveform({
  active = false,
  amplitude,
  barCount = 22,
  variant = "envelope",
  indicator = true,
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
      style={{
        height: TRACK_HEIGHT,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: BAR_GAP,
        position: "relative",
        paddingHorizontal: 16,
      }}
      className={cn(className)}
    >
      {indicator ? <Halo active={active} amplitude={amplitude} /> : null}

      {bars.map((i) => (
        <Bar
          key={i}
          index={i}
          active={active}
          amplitude={amplitude}
          barCount={barCount}
          variant={variant}
        />
      ))}

      {indicator ? <MicDot active={active} /> : null}
    </View>
  );
}

/* ============================================================ */
/* Halo — soft radial glow centered behind the waveform         */
/* ============================================================ */

function Halo({
  active,
  amplitude,
}: {
  active: boolean;
  amplitude?: number;
}) {
  const reduced = useReducedMotion();
  const pulse = useSharedValue(active ? 0.8 : 0.4);

  React.useEffect(() => {
    if (reduced) {
      pulse.value = active ? 1 : 0.4;
      return;
    }
    if (amplitude != null) {
      pulse.value = withSpring(0.4 + amplitude * 0.6, spring.gentle);
      return;
    }
    if (active) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 700, easing: easing.standard }),
          withTiming(0.6, { duration: 700, easing: easing.standard })
        ),
        -1,
        true
      );
    } else {
      pulse.value = withRepeat(
        withSequence(
          withTiming(0.5, { duration: 1800, easing: easing.standard }),
          withTiming(0.3, { duration: 1800, easing: easing.standard })
        ),
        -1,
        true
      );
    }
  }, [active, amplitude, reduced, pulse]);

  const style = useAnimatedStyle(() => ({
    opacity: pulse.value * (active ? 0.4 : 0.12),
    transform: [{ scale: 0.7 + pulse.value * 0.5 }],
  }));

  return (
    <Animated.View
      aria-hidden
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          left: "50%",
          top: "50%",
          marginLeft: -80,
          marginTop: -80,
          height: 160,
          width: 160,
          borderRadius: 80,
          backgroundColor: "rgba(160, 110, 255, 1)",
        },
        style,
      ]}
    />
  );
}

/* ============================================================ */
/* Bar — animated HEIGHT (not scaleY) for cross-platform safety */
/* ============================================================ */

function Bar({
  index,
  active,
  amplitude,
  barCount,
  variant,
}: {
  index: number;
  active: boolean;
  amplitude?: number;
  barCount: number;
  variant: "envelope" | "uniform";
}) {
  const reduced = useReducedMotion();
  // 0..1 amplitude. Start mid-range so bars are visible immediately.
  const h = useSharedValue(0.45);
  const voice = useSharedValue(active ? 1 : 0);

  const center = (barCount - 1) / 2;
  const dist = Math.abs(index - center) / (center || 1);
  const envelope = variant === "uniform" ? 1 : 1 - dist * 0.4;
  const spatial = index / Math.max(1, barCount - 1);

  React.useEffect(() => {
    voice.value = reduced
      ? active
        ? 1
        : 0
      : withTiming(active ? 1 : 0, { duration: duration.slow });
  }, [active, reduced, voice]);

  React.useEffect(() => {
    if (amplitude != null) return;
    if (reduced) {
      h.value = active ? 0.85 : 0.5;
      return;
    }
    const peak = active ? 0.7 + 0.3 * envelope : 0.5 + 0.3 * envelope;
    const base = active ? 0.3 : 0.3;
    const dur = (active ? 240 : 850) + (index % 5) * (active ? 50 : 100);
    h.value = withDelay(
      index * (active ? 22 : 45),
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

  React.useEffect(() => {
    if (amplitude == null) return;
    const jitter = 0.75 + 0.25 * Math.sin(index * 1.7);
    const target = Math.max(
      MIN_BAR_RATIO,
      Math.min(1, amplitude * envelope * jitter * 1.3)
    );
    h.value = reduced ? target : withSpring(target, spring.bouncy);
  }, [amplitude, index, envelope, reduced, h]);

  // Animated HEIGHT — the inner view literally grows/shrinks. Far more
  // reliable than scaleY when rendered cross-platform (especially in an iframe
  // via react-native-web).
  const idleStyle = useAnimatedStyle(() => ({
    height: TRACK_HEIGHT * (MIN_BAR_RATIO + h.value * (1 - MIN_BAR_RATIO)),
    opacity: 1 - voice.value,
  }));

  const activeStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      spatial,
      [0, 0.5, 1],
      ["hsl(250, 90%, 66%)", "hsl(280, 88%, 70%)", "hsl(316, 85%, 70%)"]
    );
    return {
      height: TRACK_HEIGHT * (MIN_BAR_RATIO + h.value * (1 - MIN_BAR_RATIO)),
      opacity: voice.value,
      backgroundColor: color,
    };
  });

  return (
    <View
      style={{
        width: BAR_WIDTH,
        height: TRACK_HEIGHT,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Animated.View
        style={[
          {
            position: "absolute",
            width: BAR_WIDTH,
            borderRadius: BAR_WIDTH / 2,
            backgroundColor: "#F4F4FA",
          },
          idleStyle,
        ]}
      />
      <Animated.View
        style={[
          {
            position: "absolute",
            width: BAR_WIDTH,
            borderRadius: BAR_WIDTH / 2,
          },
          activeStyle,
        ]}
      />
    </View>
  );
}

/* ============================================================ */
/* MicDot — small pulsing indicator at the center               */
/* ============================================================ */

function MicDot({ active }: { active: boolean }) {
  const reduced = useReducedMotion();
  const p = useSharedValue(0);

  React.useEffect(() => {
    if (reduced) {
      p.value = active ? 1 : 0;
      return;
    }
    if (active) {
      p.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 600, easing: easing.standard }),
          withTiming(0.4, { duration: 600, easing: easing.standard })
        ),
        -1,
        true
      );
    } else {
      p.value = withTiming(0, { duration: duration.base });
    }
  }, [active, reduced, p]);

  const dot = useAnimatedStyle(() => ({
    opacity: 0.3 + p.value * 0.7,
    transform: [{ scale: 0.9 + p.value * 0.3 }],
  }));

  const ring = useAnimatedStyle(() => ({
    opacity: p.value * 0.6,
    transform: [{ scale: 1 + p.value * 0.8 }],
  }));

  if (!active) return null;

  return (
    <View
      aria-hidden
      pointerEvents="none"
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        marginLeft: -8,
        marginTop: -8,
        width: 16,
        height: 16,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Animated.View
        style={[
          {
            position: "absolute",
            width: 16,
            height: 16,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "rgba(160, 110, 255, 1)",
          },
          ring,
        ]}
      />
      <Animated.View
        style={[
          {
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: "rgba(160, 110, 255, 1)",
          },
          dot,
        ]}
      />
    </View>
  );
}
