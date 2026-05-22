import * as React from "react";
import { Pressable, Text, View, type LayoutChangeEvent } from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { cn } from "../lib/cn";
import { duration, easing, spring } from "../lib/motion";
import { haptic } from "../lib/haptics";

export interface ReasoningTraceProps {
  /** The chain-of-thought text. Can stream in while `thinking` is true. */
  reasoning: string;
  /** Whether the model is still reasoning. When it flips false, the panel auto-collapses. */
  thinking?: boolean;
  /** Header label override. Defaults to "Thinking…" / "Thought for Ns". */
  label?: string;
  /** Controlled expanded state. */
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  /** Collapse automatically when thinking ends (unless the user toggled). Default true. */
  autoCollapse?: boolean;
  className?: string;
}

/**
 * appCN ReasoningTrace — a collapsible chain-of-thought panel. While the model
 * is thinking, a soft shimmer sweeps across the reasoning; the delight detail is
 * that the panel collapses its own height the instant the answer lands, getting
 * out of the way without the user lifting a finger.
 */
export function ReasoningTrace({
  reasoning,
  thinking = false,
  label,
  expanded: expandedProp,
  defaultExpanded = false,
  onExpandedChange,
  autoCollapse = true,
  className,
}: ReasoningTraceProps) {
  const reduced = useReducedMotion();
  const isControlled = expandedProp !== undefined;
  const [internalExpanded, setInternalExpanded] = React.useState(
    defaultExpanded || thinking
  );
  const expanded = isControlled ? expandedProp : internalExpanded;

  const manualRef = React.useRef(false);
  const prevThinking = React.useRef(thinking);
  const startRef = React.useRef<number | null>(thinking ? Date.now() : null);
  const [elapsed, setElapsed] = React.useState<number | null>(null);

  const setExpanded = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalExpanded(next);
      onExpandedChange?.(next);
    },
    [isControlled, onExpandedChange]
  );

  React.useEffect(() => {
    const was = prevThinking.current;
    if (!was && thinking) {
      startRef.current = Date.now();
      setElapsed(null);
      manualRef.current = false;
      setExpanded(true);
    } else if (was && !thinking) {
      if (startRef.current != null) {
        setElapsed(
          Math.max(1, Math.round((Date.now() - startRef.current) / 1000))
        );
      }
      if (autoCollapse && !manualRef.current) setExpanded(false);
    }
    prevThinking.current = thinking;
  }, [thinking, autoCollapse, setExpanded]);

  const open = useSharedValue(expanded ? 1 : 0);
  const contentH = useSharedValue(0);

  React.useEffect(() => {
    if (reduced) {
      open.value = expanded ? 1 : 0;
      return;
    }
    open.value = withTiming(expanded ? 1 : 0, {
      duration: duration.slow,
      easing: easing.standard,
    });
  }, [expanded, reduced, open]);

  const bodyStyle = useAnimatedStyle(() => ({
    height: open.value * contentH.value,
    opacity: open.value,
  }));

  const onContentLayout = (e: LayoutChangeEvent) => {
    contentH.value = e.nativeEvent.layout.height;
  };

  const headerText =
    label ??
    (thinking
      ? "Thinking…"
      : elapsed != null
        ? `Thought for ${elapsed}s`
        : "Reasoning");

  return (
    <View
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-card/60",
        className
      )}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={headerText}
        onPress={() => {
          manualRef.current = true;
          haptic.selection();
          setExpanded(!expanded);
        }}
        className="flex-row items-center gap-2 px-3.5 py-2.5"
      >
        {thinking ? <PulseDot /> : null}
        <Text className="flex-1 text-[13px] font-medium text-foreground">
          {headerText}
        </Text>
        <Chevron expanded={expanded} />
      </Pressable>

      <Animated.View style={bodyStyle} className="overflow-hidden">
        <View onLayout={onContentLayout}>
          <View className="px-3.5 pb-3.5 pt-0.5">
            <Text className="text-[13px] leading-5 text-muted-foreground">
              {reasoning}
            </Text>
          </View>
          {thinking ? <Shimmer /> : null}
        </View>
      </Animated.View>
    </View>
  );
}

/** A soft light streak that sweeps across the reasoning while thinking. */
function Shimmer() {
  const reduced = useReducedMotion();
  const x = useSharedValue(0);
  const [w, setW] = React.useState(0);

  React.useEffect(() => {
    if (reduced || w === 0) return;
    x.value = 0;
    x.value = withRepeat(
      withTiming(1, { duration: 1400, easing: easing.standard }),
      -1,
      false
    );
  }, [reduced, w, x]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: -60 + x.value * (w + 120) },
      { skewX: "-20deg" },
    ],
  }));

  return (
    <View
      pointerEvents="none"
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
      className="absolute inset-0 overflow-hidden"
    >
      <Animated.View
        style={style}
        className="absolute -inset-y-2 w-16 bg-foreground/10"
      />
    </View>
  );
}

/** Pulsing dot shown in the header while thinking. */
function PulseDot() {
  const reduced = useReducedMotion();
  const p = useSharedValue(reduced ? 1 : 0);

  React.useEffect(() => {
    if (reduced) return;
    p.value = withRepeat(
      withTiming(1, { duration: 700, easing: easing.standard }),
      -1,
      true
    );
  }, [reduced, p]);

  const style = useAnimatedStyle(() => ({
    opacity: 0.3 + p.value * 0.7,
    transform: [{ scale: 0.85 + p.value * 0.15 }],
  }));

  return <Animated.View style={style} className="h-2 w-2 rounded-full bg-primary" />;
}

/** Right-pointing chevron that rotates to point down when expanded. */
function Chevron({ expanded }: { expanded: boolean }) {
  const reduced = useReducedMotion();
  const r = useSharedValue(expanded ? 1 : 0);

  React.useEffect(() => {
    if (reduced) {
      r.value = expanded ? 1 : 0;
      return;
    }
    r.value = withSpring(expanded ? 1 : 0, spring.gentle);
  }, [expanded, reduced, r]);

  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${r.value * 90}deg` }],
  }));

  return (
    <Animated.View
      style={style}
      className="h-3.5 w-3.5 items-center justify-center"
    >
      <View className="h-2 w-2 -rotate-45 border-b-2 border-r-2 border-muted-foreground" />
    </Animated.View>
  );
}
