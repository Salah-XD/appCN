import * as React from "react";
import { View } from "react-native";
import {
  Button,
  PromptInput,
  ReasoningTrace,
  StreamBubble,
  VoiceWaveform,
  type PromptAttachment,
} from "@appcn/ui";

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

/** VoiceWaveform with a press-to-listen toggle. */
function WaveformDemo() {
  const [active, setActive] = React.useState(false);
  return (
    <View className="w-full items-center gap-6">
      <VoiceWaveform active={active} />
      <Button
        variant={active ? "destructive" : "default"}
        onPress={() => setActive((a) => !a)}
      >
        {active ? "Stop" : "Start listening"}
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
    slug: "voice-waveform",
    title: "Voice Waveform",
    description:
      "Live mic visualizer; breathes when idle, shifts hue to the accent when active.",
    category: "ai",
    render: () => <WaveformDemo />,
  },
];

export const demoMap: Record<string, Demo> = Object.fromEntries(
  demos.map((d) => [d.slug, d])
);
