import type { ComponentMeta } from "../lib/meta";

export const meta: ComponentMeta = {
  slug: "voice-waveform",
  title: "Voice Waveform",
  category: "ai",
  description:
    "A live mic visualizer. Breathes when idle and shifts hue to the accent when listening.",
  anatomy:
    "A row of vertical bars whose height scales with an animated shared value. Each bar carries its own envelope (taller in the middle, shorter at the edges) so the bank reads as a single waveform. Hand it real metering data via `amplitude`, or let it self-animate when omitted.",
  delight:
    "Idle doesn't go flat — bars `breathe` with a slow ~1s envelope so the mic always reads as live. The instant `active` flips true, the whole bank cross-fades from muted to the accent color, telling the user they're being listened to before they read a label.",
  props: [
    {
      name: "active",
      type: "boolean",
      default: "false",
      description:
        "When true, bars come alive (faster, taller motion) and shift to the accent color.",
    },
    {
      name: "amplitude",
      type: "number",
      description:
        "Optional live amplitude 0..1 (e.g. from a metering source). When provided, drives the bars directly and disables the self-animation.",
    },
    {
      name: "barCount",
      type: "number",
      default: "28",
      description: "Number of bars in the bank. Higher = denser visual.",
    },
    {
      name: "className",
      type: "string",
      description: "Extra NativeWind classes merged onto the container (default height is h-12).",
    },
  ],
  examples: [
    {
      title: "Idle",
      description: "Default state — bars breathe in muted grey.",
      code: `<VoiceWaveform />`,
    },
    {
      title: "Listening",
      description: "Toggle `active` to shift the whole bank to the accent and speed up the motion.",
      code: `const [listening, setListening] = React.useState(false);
return (
  <View className="items-center gap-6">
    <VoiceWaveform active={listening} />
    <Button onPress={() => setListening((a) => !a)}>
      {listening ? "Stop" : "Start listening"}
    </Button>
  </View>
);`,
    },
    {
      title: "Driven by amplitude",
      description: "Feed in real metering data and the bars track it directly.",
      code: `// amplitude is a 0..1 value from your audio meter
<VoiceWaveform active amplitude={amplitude} />`,
    },
  ],
  a11y: [
    'The container is accessible with a dynamic `accessibilityLabel`: "Listening" when active, "Microphone idle" otherwise.',
    "Honors `useReducedMotion()` — bars freeze at a representative height instead of breathing/animating.",
    "Decorative bars themselves are not focusable — VoiceOver hears one label for the whole control.",
  ],
};
