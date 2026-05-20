import * as React from "react";
import { View } from "react-native";
import { Button, PromptInput, StreamBubble, VoiceWaveform } from "@appcn/ui";

/** Demo wrapper: PromptInput that fakes a 1.5s streaming response on send. */
function PromptInputDemo() {
  const [streaming, setStreaming] = React.useState(false);
  return (
    <PromptInput
      streaming={streaming}
      onSend={() => {
        setStreaming(true);
        setTimeout(() => setStreaming(false), 1500);
      }}
      onStop={() => setStreaming(false)}
    />
  );
}

export type DemoCategory = "base" | "ai";

export type Demo = {
  slug: string;
  title: string;
  description: string;
  category: DemoCategory;
  render: () => React.ReactNode;
};

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
        <StreamBubble content="Hey! I'm appCN's streaming assistant bubble — watch me think for a moment, then stream this reply token by token, then settle into place." />
      </View>
    ),
  },
  {
    slug: "voice-waveform",
    title: "Voice Waveform",
    description: "Animated listening visualization for voice / assistant UI.",
    category: "ai",
    render: () => (
      <View className="w-full items-center">
        <VoiceWaveform barCount={7} height={56} />
      </View>
    ),
  },
  {
    slug: "prompt-input",
    title: "Prompt Input",
    description: "AI chat composer with an animated send / stop button.",
    category: "ai",
    render: () => (
      <View className="w-full">
        <PromptInputDemo />
      </View>
    ),
  },
];

export const demoMap: Record<string, Demo> = Object.fromEntries(
  demos.map((d) => [d.slug, d])
);
