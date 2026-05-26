import * as React from "react";
import { Text, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  FadeIn,
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

type Phase = "thinking" | "streaming" | "done";

/* ============================================================ */
/* Design tokens — hardcoded so visuals don't depend on the     */
/* consumer's tailwind/NativeWind setup. Override-able later if */
/* anyone needs themed bubbles.                                  */
/* ============================================================ */
const COLOR = {
  primary: "hsl(250, 90%, 66%)",
  primarySoft: "hsla(250, 90%, 66%, 0.25)",
  primaryGlow: "hsla(250, 90%, 66%, 0.12)",
  accent: "hsl(316, 85%, 70%)",
  bubbleBg: "#15151B",
  bubbleBgTop: "rgba(255, 255, 255, 0.02)",
  bubbleBorder: "rgba(255, 255, 255, 0.08)",
  text: "#F5F5FA",
  textMuted: "rgba(245, 245, 250, 0.65)",
  chipBg: "rgba(255, 255, 255, 0.06)",
  chipBorder: "rgba(255, 255, 255, 0.10)",
  avatarBg: "#1C1C24",
  avatarBorder: "rgba(255, 255, 255, 0.10)",
} as const;

export interface StreamBubbleProps {
  /** Full assistant message that streams in token-by-token. */
  content: string;
  /** Optional "tool used" chips rendered above the message. */
  tools?: string[];
  /**
   * Optional avatar shown to the left of the bubble. Pass a single character
   * (e.g. "C", "✦") or any React node — it'll get a rotating gradient ring
   * during thinking.
   */
  avatar?: React.ReactNode;
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
 * token-by-token stream with a soft caret bar, then a settled final state
 * that briefly glows. Optional avatar gets a rotating gradient ring while
 * the model is thinking.
 */
export function StreamBubble({
  content,
  tools,
  avatar,
  thinkingDuration = 900,
  chunkSize = 2,
  speed = 28,
  replayKey,
  className,
}: StreamBubbleProps) {
  const reduced = useReducedMotion();
  const [phase, setPhase] = React.useState<Phase>("thinking");
  const [shown, setShown] = React.useState(0);

  React.useEffect(() => {
    if (reduced) {
      setPhase("done");
      setShown(content.length);
      return;
    }
    setPhase("thinking");
    setShown(0);
    const t = setTimeout(() => setPhase("streaming"), thinkingDuration);
    return () => clearTimeout(t);
  }, [content, thinkingDuration, replayKey, reduced]);

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
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 10,
      }}
    >
      {avatar !== undefined ? (
        <Avatar thinking={phase === "thinking"}>{avatar}</Avatar>
      ) : null}
      <Bubble
        phase={phase}
        tools={tools}
        content={content}
        shown={shown}
        className={className}
      />
    </View>
  );
}

/* ============================================================ */
/* Bubble                                                       */
/* ============================================================ */

function Bubble({
  phase,
  tools,
  content,
  shown,
  className,
}: {
  phase: Phase;
  tools?: string[];
  content: string;
  shown: number;
  className?: string;
}) {
  // Settled-glow: when we transition to "done", briefly pulse a primary ring.
  const settle = useSharedValue(0);
  React.useEffect(() => {
    if (phase === "done") {
      settle.value = withSequence(
        withTiming(1, { duration: duration.base, easing: easing.enter }),
        withTiming(0, { duration: 900, easing: easing.exit })
      );
    } else {
      settle.value = 0;
    }
  }, [phase, settle]);

  const glowStyle = useAnimatedStyle(() => ({ opacity: settle.value }));

  return (
    <Animated.View
      entering={FadeIn.duration(duration.base).easing(easing.enter)}
      accessibilityRole="text"
      style={{
        maxWidth: "85%",
        alignSelf: "flex-start",
        backgroundColor: COLOR.bubbleBg,
        borderColor: COLOR.bubbleBorder,
        borderWidth: 1,
        borderRadius: 20,
        borderBottomLeftRadius: 6,
        paddingHorizontal: 14,
        paddingVertical: 12,
        gap: 8,
        position: "relative",
        overflow: "hidden",
      }}
      className={cn(className)}
    >
      {/* Top-edge gradient wash — gives the bubble depth without expo-linear-gradient. */}
      <View
        aria-hidden
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 40,
          backgroundColor: COLOR.bubbleBgTop,
        }}
      />
      {/* Accent stripe along the left edge — subtle "alive" marker. */}
      <View
        aria-hidden
        pointerEvents="none"
        style={{
          position: "absolute",
          left: 0,
          top: 8,
          bottom: 8,
          width: 2,
          borderRadius: 1,
          backgroundColor: COLOR.primarySoft,
        }}
      />
      {/* Settle glow — fades in when streaming completes. */}
      <Animated.View
        aria-hidden
        pointerEvents="none"
        style={[
          {
            position: "absolute",
            left: -1,
            right: -1,
            top: -1,
            bottom: -1,
            borderRadius: 20,
            borderBottomLeftRadius: 6,
            borderWidth: 1,
            borderColor: COLOR.primary,
          },
          glowStyle,
        ]}
      />

      {tools && tools.length > 0 && phase !== "thinking" ? (
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 6,
          }}
        >
          {tools.map((label, i) => (
            <ToolChip key={label} label={label} index={i} />
          ))}
        </View>
      ) : null}

      {phase === "thinking" ? (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            paddingVertical: 4,
            paddingHorizontal: 2,
          }}
        >
          <ThinkingDot index={0} />
          <ThinkingDot index={1} />
          <ThinkingDot index={2} />
        </View>
      ) : (
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 15,
              lineHeight: 22,
              color: COLOR.text,
            }}
          >
            {content.slice(0, shown)}
          </Text>
          {phase === "streaming" ? <StreamCaret /> : null}
        </View>
      )}
    </Animated.View>
  );
}

/* ============================================================ */
/* Avatar with rotating accent ring + soft glow                 */
/* ============================================================ */

const AVATAR_SIZE = 36;

function Avatar({
  children,
  thinking,
}: {
  children: React.ReactNode;
  thinking: boolean;
}) {
  const reduced = useReducedMotion();
  const rot = useSharedValue(0);
  const glow = useSharedValue(0);

  React.useEffect(() => {
    if (thinking && !reduced) {
      rot.value = withRepeat(
        withTiming(360, { duration: 1800, easing: Easing.linear }),
        -1,
        false
      );
      glow.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 700, easing: easing.standard }),
          withTiming(0.45, { duration: 700, easing: easing.standard })
        ),
        -1,
        true
      );
    } else {
      cancelAnimation(rot);
      cancelAnimation(glow);
      rot.value = withTiming(0, { duration: duration.fast });
      glow.value = withTiming(0, { duration: duration.fast });
    }
  }, [thinking, reduced, rot, glow]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: thinking ? 1 : 0,
    transform: [{ rotate: `${rot.value}deg` }],
  }));

  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value * 0.6 }));

  return (
    <View
      style={{
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      {/* Soft outer glow during thinking */}
      <Animated.View
        aria-hidden
        pointerEvents="none"
        style={[
          {
            position: "absolute",
            left: -6,
            right: -6,
            top: -6,
            bottom: -6,
            borderRadius: AVATAR_SIZE / 2 + 6,
            backgroundColor: COLOR.primaryGlow,
          },
          glowStyle,
        ]}
      />
      {/* Rotating accent ring — top + right segments visible */}
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: "absolute",
            left: -3,
            right: -3,
            top: -3,
            bottom: -3,
            borderRadius: AVATAR_SIZE / 2 + 3,
            borderWidth: 2,
            borderColor: "transparent",
            borderTopColor: COLOR.primary,
            borderRightColor: COLOR.accent,
          },
          ringStyle,
        ]}
      />
      {/* Avatar disc — subtle gradient feel via two stacked tints. */}
      <View
        style={{
          width: AVATAR_SIZE,
          height: AVATAR_SIZE,
          borderRadius: AVATAR_SIZE / 2,
          backgroundColor: COLOR.avatarBg,
          borderColor: COLOR.avatarBorder,
          borderWidth: 1,
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <View
          aria-hidden
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: AVATAR_SIZE / 2,
            backgroundColor: COLOR.primaryGlow,
          }}
        />
        {typeof children === "string" ? (
          <Text
            style={{
              fontSize: 15,
              fontWeight: "600",
              color: COLOR.text,
            }}
          >
            {children}
          </Text>
        ) : (
          children
        )}
      </View>
    </View>
  );
}

/* ============================================================ */
/* Thinking dot — depth via scale + opacity + bigger size       */
/* ============================================================ */

function ThinkingDot({ index }: { index: number }) {
  const progress = useSharedValue(0);

  React.useEffect(() => {
    progress.value = withDelay(
      index * 160,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 420, easing: easing.standard }),
          withTiming(0, { duration: 420, easing: easing.standard })
        ),
        -1,
        false
      )
    );
  }, [index, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: 0.4 + progress.value * 0.6,
    transform: [
      { translateY: -progress.value * 5 },
      { scale: 0.85 + progress.value * 0.3 },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          width: 9,
          height: 9,
          borderRadius: 4.5,
          backgroundColor: COLOR.primary,
        },
        style,
      ]}
    />
  );
}

/* ============================================================ */
/* Stream caret — a real animated bar that sits inline with text */
/* ============================================================ */

function StreamCaret() {
  const blink = useSharedValue(1);

  React.useEffect(() => {
    blink.value = withRepeat(
      withSequence(
        withTiming(0.1, { duration: 480, easing: easing.standard }),
        withTiming(1, { duration: 480, easing: easing.standard })
      ),
      -1,
      true
    );
  }, [blink]);

  const style = useAnimatedStyle(() => ({ opacity: blink.value }));

  // Real View — sits next to the rendered text in the same flex row.
  return (
    <Animated.View
      style={[
        {
          width: 3,
          height: 17,
          marginLeft: 2,
          marginBottom: 2,
          borderRadius: 1.5,
          backgroundColor: COLOR.primary,
        },
        style,
      ]}
    />
  );
}

/* ============================================================ */
/* Tool chip — premium glassy pill, cascade entrance            */
/* ============================================================ */

function ToolChip({ label, index }: { label: string; index: number }) {
  const lift = useSharedValue(0);

  React.useEffect(() => {
    lift.value = withDelay(index * 80, withSpring(1, spring.bouncy));
  }, [index, lift]);

  const style = useAnimatedStyle(() => ({
    opacity: lift.value,
    transform: [{ translateY: (1 - lift.value) * 8 }],
  }));

  return (
    <Animated.View
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          alignSelf: "flex-start",
          borderRadius: 999,
          borderWidth: 1,
          borderColor: COLOR.chipBorder,
          backgroundColor: COLOR.chipBg,
          paddingHorizontal: 9,
          paddingVertical: 4,
        },
        style,
      ]}
    >
      <View
        style={{
          width: 5,
          height: 5,
          borderRadius: 2.5,
          backgroundColor: COLOR.primary,
        }}
      />
      <Text
        style={{
          fontSize: 11,
          fontWeight: "500",
          color: COLOR.textMuted,
          letterSpacing: 0.2,
        }}
      >
        {label}
      </Text>
    </Animated.View>
  );
}
