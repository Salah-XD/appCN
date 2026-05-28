import * as React from "react";
import { Platform, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import {
  Button,
  PromptInput,
  ReasoningTrace,
  StreamBubble,
  VoiceSphere,
  type PromptAttachment,
} from "@app-cn/ui";

export type DemoCategory = "base" | "ai";

export type Demo = {
  slug: string;
  title: string;
  description: string;
  category: DemoCategory;
  render: () => React.ReactNode;
};

/** PromptInput with live generating + attachment state.
 *
 * Stock images cycle through `picsum.photos` so each click adds a different
 * thumbnail to the chip. Deterministic seeds keep the same image stable
 * across re-renders.
 */
const STOCK_IMAGES: { seed: string; label: string }[] = [
  { seed: "appcn-mountain", label: "mountain.jpg" },
  { seed: "appcn-coffee", label: "coffee.jpg" },
  { seed: "appcn-studio", label: "studio.jpg" },
  { seed: "appcn-portrait", label: "portrait.jpg" },
  { seed: "appcn-city", label: "city.jpg" },
];

function PromptDemo() {
  const [generating, setGenerating] = React.useState(false);
  const [attachments, setAttachments] = React.useState<PromptAttachment[]>([]);
  const counter = React.useRef(0);

  return (
    <View className="w-full">
      <PromptInput
        generating={generating}
        attachments={attachments}
        hint="⌘ + Enter to send"
        onAddAttachment={() => {
          const next = STOCK_IMAGES[counter.current % STOCK_IMAGES.length];
          counter.current += 1;
          setAttachments((a) => [
            ...a,
            {
              id: `f${counter.current}`,
              label: next.label,
              uri: `https://picsum.photos/seed/${next.seed}/80/80`,
            },
          ]);
        }}
        onRemoveAttachment={(id) =>
          setAttachments((a) => a.filter((x) => x.id !== id))
        }
        onSubmit={() => {
          setGenerating(true);
          setAttachments([]);
          setTimeout(() => setGenerating(false), 2600);
        }}
        onStop={() => setGenerating(false)}
      />
    </View>
  );
}

const REASONING =
  "The user is asking for a concise answer. Let me weigh the options: a list would be skimmable, but a single sentence reads faster here. I'll lead with the recommendation, then give the one tradeoff that matters.";

/** ReasoningTrace that streams its thinking, then settles + auto-collapses. */
function ReasoningDemo() {
  const [run, setRun] = React.useState(0);
  const [thinking, setThinking] = React.useState(true);
  const [reasoning, setReasoning] = React.useState("");

  React.useEffect(() => {
    setThinking(true);
    setReasoning("");
    let i = 0;
    const id = setInterval(() => {
      i += 3;
      setReasoning(REASONING.slice(0, i));
      if (i >= REASONING.length) {
        clearInterval(id);
        setTimeout(() => setThinking(false), 700);
      }
    }, 28);
    return () => clearInterval(id);
  }, [run]);

  return (
    <View className="w-full gap-4">
      <ReasoningTrace reasoning={reasoning} thinking={thinking} />
      <Button variant="outline" onPress={() => setRun((r) => r + 1)}>
        Replay
      </Button>
    </View>
  );
}

/**
 * Fake-amplitude variant used by the landing hero. No button, no mic, no
 * chrome — just the sphere animating with a synthetic speech-like signal so
 * it looks alive in the marketing iframe.
 */
function SphereFakeDemo() {
  const [amplitude, setAmplitude] = React.useState(0);

  React.useEffect(() => {
    let t = 0;
    let raf = 0;
    const tick = () => {
      t += 0.016;
      // Layered sines + a slow envelope = organic speech-shaped amplitude.
      const swell = Math.sin(t * 1.2) * 0.5 + 0.5;
      const mid = Math.sin(t * 3.5) * 0.3;
      const hi = Math.sin(t * 8.7) * 0.18;
      const burstEnv = Math.pow(Math.sin(t * 0.45) * 0.5 + 0.5, 2);
      const amp = Math.max(
        0,
        Math.min(1, (swell * 0.5 + mid + hi) * burstEnv)
      );
      setAmplitude(amp);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0A0A14",
      }}
    >
      <VoiceSphere active amplitude={amplitude} size={240} />
    </View>
  );
}

/**
 * VoiceSphere with live mic metering on web. Tapping "Speak to me" requests
 * microphone access, sets up an AnalyserNode, and feeds RMS amplitude into
 * the sphere every frame. Tap again to stop and release the mic.
 *
 * On native this currently falls back to internal idle animation — wiring
 * `expo-av` recorder metering is left to the consumer.
 */
function SphereDemo() {
  // Honor ?fake=1 in the URL — the landing hero embeds this route with that
  // param to get a chrome-free, mic-free, auto-animating preview.
  const params = useLocalSearchParams<{ fake?: string }>();
  if (params.fake === "1") {
    return <SphereFakeDemo />;
  }

  return <SphereInteractiveDemo />;
}

function SphereInteractiveDemo() {
  const [active, setActive] = React.useState(false);
  const [amplitude, setAmplitude] = React.useState<number | undefined>(undefined);
  const audioRef = React.useRef<{
    ctx: AudioContext;
    stream: MediaStream;
    raf: number;
  } | null>(null);

  const stop = React.useCallback(() => {
    const ref = audioRef.current;
    if (ref) {
      cancelAnimationFrame(ref.raf);
      ref.stream.getTracks().forEach((t) => t.stop());
      void ref.ctx.close();
      audioRef.current = null;
    }
    setActive(false);
    setAmplitude(undefined);
  }, []);

  const start = React.useCallback(async () => {
    if (Platform.OS !== "web") {
      setActive(true);
      return;
    }
    try {
      console.log("[VoiceSphere demo] requesting mic…");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log(
        "[VoiceSphere demo] mic granted. tracks:",
        stream.getAudioTracks().map((t) => ({
          label: t.label,
          enabled: t.enabled,
          muted: t.muted,
          readyState: t.readyState,
        }))
      );

      const Ctx =
        (window as any).AudioContext || (window as any).webkitAudioContext;
      const ctx: AudioContext = new Ctx();
      // Resume the context — some browsers create it suspended until a
      // user-gesture-bound resume() call.
      if (ctx.state === "suspended") {
        await ctx.resume();
      }
      console.log(
        "[VoiceSphere demo] AudioContext state:",
        ctx.state,
        "sampleRate:",
        ctx.sampleRate
      );

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.4;
      source.connect(analyser);

      const data = new Uint8Array(analyser.fftSize);
      let smoothed = 0;
      let logCounter = 0;
      const tick = () => {
        analyser.getByteTimeDomainData(data);
        let sumSq = 0;
        let min = 255;
        let max = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128;
          sumSq += v * v;
          if (data[i] < min) min = data[i];
          if (data[i] > max) max = data[i];
        }
        const rms = Math.sqrt(sumSq / data.length);
        // Boosted scale — speech RMS is small, push it up to make the wave
        // read clearly. Tune down if it feels too sensitive.
        const target = Math.min(1, rms * 8);
        smoothed = smoothed * 0.55 + target * 0.45;
        setAmplitude(smoothed);

        logCounter++;
        if (logCounter % 30 === 0) {
          // ~ twice a second
          console.log(
            `[mic] raw min/max: ${min}/${max}, rms: ${rms.toFixed(4)}, target: ${target.toFixed(3)}, smoothed: ${smoothed.toFixed(3)}`
          );
        }

        if (audioRef.current) {
          audioRef.current.raf = requestAnimationFrame(tick);
        }
      };

      audioRef.current = {
        ctx,
        stream,
        raf: requestAnimationFrame(tick),
      };
      setActive(true);
    } catch (e) {
      console.error("[VoiceSphere demo] mic access failed:", e);
      setActive(false);
    }
  }, []);

  React.useEffect(() => stop, [stop]);

  return (
    <View className="w-full items-center gap-4">
      <VoiceSphere active={active} amplitude={amplitude} size={280} />
      {active ? (
        <Text className="font-mono text-xs text-muted-foreground">
          amp: {amplitude != null ? amplitude.toFixed(3) : "—"}
        </Text>
      ) : null}
      <Button
        variant={active ? "destructive" : "default"}
        onPress={() => (active ? stop() : start())}
      >
        {active ? "Stop" : "Speak to me"}
      </Button>
    </View>
  );
}

/**
 * Single source of truth for what the showcase renders. Each entry is
 * deep-linkable at /c/<slug> so the docs site can QR-code straight to it.
 */
export const demos: Demo[] = [
  {
    slug: "button",
    title: "Button",
    description: "Pressable with a Reanimated press-scale and variants.",
    category: "base",
    render: () => (
      <View className="w-full gap-3">
        <Button onPress={() => {}}>Get started</Button>
        <Button variant="secondary" onPress={() => {}}>
          Secondary
        </Button>
        <Button variant="outline" onPress={() => {}}>
          Outline
        </Button>
        <Button variant="destructive" onPress={() => {}}>
          Delete
        </Button>
      </View>
    ),
  },
  {
    slug: "stream-bubble",
    title: "Stream Bubble",
    description: "AI assistant message: thinking → token stream → settle.",
    category: "ai",
    render: () => (
      <View className="w-full">
        <StreamBubble
          avatar="✦"
          tools={["Searched the web", "Read 3 sources"]}
          content="Hey! I'm appCN's streaming assistant bubble — watch me think for a moment, then stream this reply token by token, then settle into place."
        />
      </View>
    ),
  },
  {
    slug: "prompt-input",
    title: "Prompt Input",
    description:
      "AI composer: auto-grow, attachments, send morphs into a stop with a spinning ring.",
    category: "ai",
    render: () => <PromptDemo />,
  },
  {
    slug: "reasoning-trace",
    title: "Reasoning Trace",
    description:
      "Collapsible chain-of-thought with a shimmer; auto-collapses when the answer lands.",
    category: "ai",
    render: () => <ReasoningDemo />,
  },
  {
    slug: "voice-sphere",
    title: "Voice Sphere",
    description:
      "True-3D particle sphere that breathes when idle and ripples with sound when active.",
    category: "ai",
    render: () => <SphereDemo />,
  },
];

export const demoMap: Record<string, Demo> = Object.fromEntries(
  demos.map((d) => [d.slug, d])
);
